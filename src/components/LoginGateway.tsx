import React, { useState, useEffect } from 'react';
import { Student, TeacherProfile, CurrentUser } from '../types';
import { 
  LogIn, User, Lock, Eye, EyeOff, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { cloudAuth } from '../cloudFirestore';
import { ThemeToggle } from './ThemeToggle';
import { getWhatsAppUrl } from '../utils';

interface LoginGatewayProps {
  teacherProfile: TeacherProfile;
  students: Student[];
  onLoginSuccess: (user: CurrentUser) => void;
  onNavigateToProfile: () => void;
}

const REMEMBER_ME_KEY = 'ofoq_saved_login_user';

export const LoginGateway: React.FC<LoginGatewayProps> = ({
  teacherProfile,
  students,
  onLoginSuccess,
  onNavigateToProfile,
}) => {
  // Unified single form inputs
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load remembered user on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_ME_KEY);
      if (saved) {
        setIdentifier(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Handle unified login
  const handleUnifiedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const inputUser = identifier.trim();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setErrorMsg('يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsSubmitting(true);

    // Save or clear remember me
    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, inputUser);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    } catch {
      // Ignore
    }

    const cleanLower = inputUser.toLowerCase();

    // Check silently if the user is the specialist/owner (e.g. mfekry225@outlook.com, mfekry225@gmail.com, mfekry225, admin, teacher)
    const isSpecialistTarget = 
      cleanLower === 'mfekry225@outlook.com' ||
      cleanLower === 'mfekry225@gmail.com' ||
      cleanLower.includes('mfekry225') ||
      cleanLower === (teacherProfile.email || '').toLowerCase() ||
      cleanLower === 'admin' ||
      cleanLower === 'أدمن' ||
      cleanLower === 'teacher' ||
      cleanLower === 'أخصائي';

    if (isSpecialistTarget) {
      // Hidden specialist authentication via Firebase Auth
      try {
        const targetEmail = cleanLower.includes('@') ? cleanLower : (teacherProfile.email || 'mfekry225@outlook.com');
        const authResult = await cloudAuth.loginTeacher(targetEmail, inputPass);

        if (authResult.success) {
          setIsSubmitting(false);
          onLoginSuccess({
            role: 'teacher',
            name: authResult.user?.displayName || teacherProfile.name,
            email: authResult.user?.email || teacherProfile.email,
          });
          return;
        }

        setIsSubmitting(false);
        setErrorMsg(authResult.error || 'كلمة المرور غير صحيحة لحساب الإدارة في Firebase.');
        return;
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMsg(err?.message || 'تعذر التحقق من خوادم المصادقة السحابية.');
        return;
      }
    }

    // Otherwise: authenticate as a parent/student seamlessly (checking memory and Cloud Firestore)
    let matchedStudent = students.find((s) => {
      const matchUser = 
        (s.parentUsername && s.parentUsername.trim().toLowerCase() === cleanLower) ||
        (s.parentPhone && s.parentPhone.replace(/[^0-9]/g, '') === inputUser.replace(/[^0-9]/g, '')) ||
        (s.motherPhone && s.motherPhone.replace(/[^0-9]/g, '') === inputUser.replace(/[^0-9]/g, '')) ||
        (s.parentAccessCode && s.parentAccessCode.trim().toUpperCase() === inputUser.toUpperCase()) ||
        (s.parentName && s.parentName.trim() === inputUser) ||
        (s.name && s.name.trim() === inputUser);

      const matchPass = 
        (s.parentPassword && s.parentPassword === inputPass) ||
        (s.parentAccessCode && s.parentAccessCode.trim().toUpperCase() === inputPass.toUpperCase());

      return matchUser && matchPass;
    });

    // If not found in local memory, query Cloud Firestore directly (supports any phone, tablet, or fresh browser)
    if (!matchedStudent) {
      try {
        const cloudResult = await cloudAuth.loginParent(inputUser, inputPass);
        if (cloudResult.success && cloudResult.student) {
          matchedStudent = cloudResult.student;
        }
      } catch (cloudErr) {
        console.warn('Direct Firestore parent lookup notice:', cloudErr);
      }
    }

    if (matchedStudent) {
      setIsSubmitting(false);
      onLoginSuccess({
        role: 'parent',
        studentId: matchedStudent.id,
        name: matchedStudent.parentName,
        phone: matchedStudent.parentPhone,
        student: matchedStudent,
      });
      return;
    }

    // If no match found
    setIsSubmitting(false);
    setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من بيانات الدخول.');
  };


  // Password reset trigger
  const handleForgotPassword = async () => {
    const inputUser = identifier.trim().toLowerCase();
    
    // If input is owner's email or empty
    if (!inputUser || inputUser === 'mfekry225@outlook.com' || inputUser === 'mfekry225@gmail.com' || inputUser.includes('mfekry225') || inputUser === 'admin') {
      setIsResetting(true);
      setErrorMsg('');
      setSuccessMsg('');
      const targetEmail = inputUser.includes('@') ? inputUser : (teacherProfile.email || 'mfekry225@outlook.com');
      const res = await cloudAuth.sendPasswordReset(targetEmail);
      setIsResetting(false);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
      return;
    }

    // For parents: redirect to WhatsApp support
    const message = `مرحباً، أود استعادة بيانات تسجيل الدخول الخاصة بالطالب على منصة أُفق. المعرف المدخل: ${inputUser}`;
    window.location.href = getWhatsAppUrl(teacherProfile.phone, message);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">
                منصة أُفق
              </h1>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                الأخصائي محمد فكري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToProfile}
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-300 transition-colors"
            >
              التعريف بالأخصائي
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            
            {/* Header */}
            <div className="px-6 sm:px-8 pt-8 pb-4 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800/50 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
                <LogIn className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                تسجيل الدخول
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                أدخل بيانات حسابك للوصول إلى النظام
              </p>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="mx-6 sm:mx-8 mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mx-6 sm:mx-8 mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Unified Form */}
            <form onSubmit={handleUnifiedLogin} className="px-6 sm:px-8 pb-8 space-y-4">
              {/* Field 1: Identifier */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم المستخدم أو المعرف
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="اسم المستخدم أو الهاتف أو البريد الإلكتروني"
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResetting}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    {isResetting ? 'جارٍ الإرسال...' : 'نسيت كلمة المرور؟'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option (خانة تذكير الدخول) */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    تذكر تسجيل الدخول على هذا الجهاز
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.99] shadow-lg shadow-sky-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ التحقق...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>

            </form>

            {/* Bottom Footer Note */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 px-6 py-3.5 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>اتصال سحابي آمن ومشفر بواسطة معايير Google Cloud</span>
            </div>
          </div>

          {/* Quick Help Link for Parents */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              لأولياء الأمور: يمكنك الدخول باسم المستخدم أو رقم الهاتف المسجل. للطلب أو الدعم،{' '}
              <a
                href={getWhatsAppUrl(teacherProfile.phone, 'مرحباً، أود الاستفسار عن بيانات الدخول لحساب الطالب.')}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                تواصل عبر واتساب الأخصائي
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-slate-800/60">
        منصة أُفق لإدارة الجلسات ومتابعة التأهيل والتخاطب © {new Date().getFullYear()}
      </footer>
    </div>
  );
};
