import React, { useState } from 'react';
import { Student, TeacherProfile, CurrentUser, TeacherCredentials } from '../types';
import { LogIn, Key, User, Lock, Eye, EyeOff, BookOpen, ShieldAlert, UserPlus, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { storage } from '../storage';
import { cloudAuth } from '../cloudFirestore';
import { ThemeToggle } from './ThemeToggle';

interface LoginGatewayProps {
  teacherProfile: TeacherProfile;
  students: Student[];
  onLoginSuccess: (user: CurrentUser) => void;
  onNavigateToProfile: () => void;
  onNavigateToEnroll: () => void;
  onNavigateToAssessments?: () => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({
  teacherProfile,
  students,
  onLoginSuccess,
  onNavigateToProfile,
  onNavigateToEnroll,
  onNavigateToAssessments,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const inputUser = usernameOrEmail.trim();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setErrorMsg('يرجى إدخال اسم المستخدم وكلمة المرور');
      setIsSubmitting(false);
      return;
    }

    const teacherCreds: TeacherCredentials = storage.getTeacherCredentials();
    const isTeacherTarget = 
      inputUser.toLowerCase() === teacherProfile.email.toLowerCase() ||
      inputUser.toLowerCase() === teacherCreds.email.toLowerCase() ||
      inputUser.toLowerCase() === 'mfekry225@gmail.com' ||
      inputUser.toLowerCase() === 'admin' ||
      inputUser.toLowerCase() === 'teacher';

    // 1. Check if Teacher Login
    if (isTeacherTarget) {
      const emailToAuth = inputUser.includes('@') ? inputUser : 'mfekry225@gmail.com';
      try {
        const authResult = await cloudAuth.loginTeacher(emailToAuth, inputPass);
        if (authResult.success) {
          setIsSubmitting(false);
          onLoginSuccess({
            role: 'teacher',
            name: teacherProfile.name,
          });
          return;
        }

        // Secondary fallback for local offline mode if credentials match saved profile
        if (inputPass === teacherCreds.password) {
          setIsSubmitting(false);
          onLoginSuccess({
            role: 'teacher',
            name: teacherProfile.name,
          });
          return;
        }

        setIsSubmitting(false);
        setErrorMsg(authResult.error || 'كلمة المرور غير صحيحة لحساب الإدارة.');
        return;
      } catch {
        if (inputPass === teacherCreds.password) {
          setIsSubmitting(false);
          onLoginSuccess({
            role: 'teacher',
            name: teacherProfile.name,
          });
          return;
        }
      }
    }

    // 2. Check if Parent Login (Matching any registered student credentials)
    const matchedStudent = students.find((s) => {
      const matchUser = 
        (s.parentUsername && s.parentUsername.toLowerCase() === inputUser.toLowerCase()) ||
        (s.parentPhone && s.parentPhone.replace(/[^0-9]/g, '') === inputUser.replace(/[^0-9]/g, '')) ||
        (s.parentAccessCode && s.parentAccessCode.toUpperCase() === inputUser.toUpperCase()) ||
        (s.parentName && s.parentName.trim() === inputUser);

      const matchPass = 
        (s.parentPassword && s.parentPassword === inputPass) ||
        (s.parentAccessCode && s.parentAccessCode.toUpperCase() === inputPass.toUpperCase());

      return matchUser && matchPass;
    });

    if (matchedStudent) {
      await cloudAuth.loginParent();
      setIsSubmitting(false);
      onLoginSuccess({
        role: 'parent',
        studentId: matchedStudent.id,
        name: matchedStudent.parentName,
        phone: matchedStudent.parentPhone,
      });
      return;
    }

    // If neither matched
    setIsSubmitting(false);
    setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات أو مراجعة المعلم.');
  };

  return (
    <div id="login-gateway-view" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f0f7fc] dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 flex flex-col justify-between p-3 sm:p-6 relative transition-colors duration-200">
      {/* Background subtle ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-300/20 dark:bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand & Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between gap-2 z-10 pt-1 sm:pt-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-md shadow-blue-600/20 shrink-0">
            أ
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">أُفُق</span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">Ofoq</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-blue-700 dark:text-blue-400 font-semibold block truncate max-w-[130px] sm:max-w-none">{teacherProfile.name}</span>
          </div>
        </div>

        {/* Action Links & Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <ThemeToggle size="sm" />

          {onNavigateToAssessments && (
            <button
              id="nav-to-assessments-btn"
              onClick={onNavigateToAssessments}
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[10px] sm:text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 shadow-xs flex items-center gap-1 sm:gap-1.5 transition cursor-pointer"
              title="المقاييس السريعة وفحص مؤشرات الطفل"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>المقاييس (10 بنود)</span>
            </button>
          )}

          <button
            id="nav-to-profile-btn"
            onClick={onNavigateToProfile}
            className="px-2 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-blue-50 dark:hover:bg-[#152244] text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-sky-100 dark:border-blue-900/40 shadow-xs flex items-center gap-1 sm:gap-1.5 transition cursor-pointer"
            title="نبذة وخبرات الأخصائي"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden xs:inline">النبذة</span>
          </button>

          <button
            id="nav-to-enroll-btn"
            onClick={onNavigateToEnroll}
            className="px-2 sm:px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-[10px] sm:text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 shadow-xs flex items-center gap-1 sm:gap-1.5 transition cursor-pointer"
            title="طلب حجز وتقييم"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>انضمام</span>
          </button>
        </div>
      </div>

      {/* Unified Single Login Card & Quick Screening Card */}
      <div className="max-w-md w-full mx-auto my-auto py-4 sm:py-6 z-10 space-y-4">
        <div className="bg-white dark:bg-[#0f172a] border border-blue-100/80 dark:border-blue-900/40 rounded-3xl p-5 sm:p-8 shadow-xl shadow-blue-950/5 dark:shadow-blue-950/40 space-y-5 sm:space-y-6 transition-colors">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-1 border border-blue-100 dark:border-blue-900/40">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">تسجيل الدخول</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              أدخل اسم المستخدم أو البريد الإلكتروني وكلمة المرور للمتابعة
            </p>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Unified Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                <input
                  id="input-login-username"
                  type="text"
                  required
                  autoFocus
                  placeholder="اسم المستخدم أو البريد الإلكتروني"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-10 pl-3 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-10 pl-10 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="submit-unified-login-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-60 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-blue-200" />
              <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          {/* Quick Notice */}
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>نظام الدخول الذكي الموحد:</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              يقوم النظام بتوجيهك تلقائياً إلى لوحة الأخصائي أو لوحة ولي الأمر بحسب بيانات الحساب المسجل.
            </p>
          </div>
        </div>

        {/* Quick Screening Banner for Parents */}
        {onNavigateToAssessments && (
          <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-sky-600/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/40 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs transition">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm shadow-blue-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                  فحص مؤشرات الطفل السريع (10 بنود)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                  تأخر لغة • طيف توحد • صعوبات تعلم • تلعثم
                </span>
              </div>
            </div>

            <button
              id="gateway-quick-assess-btn"
              onClick={onNavigateToAssessments}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 shadow-sm shadow-blue-600/20 transition cursor-pointer flex items-center gap-1"
            >
              <span>ابدأ الآن</span>
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-slate-500 dark:text-slate-400 z-10 pb-2 font-medium">
        <span>أفق (Ofoq) • المنصة التعليمية المتكاملة لمتابعة الجلسات والطلاب</span>
      </footer>
    </div>
  );
};

