import React, { useState } from 'react';
import { Student, TeacherProfile, CurrentUser, TeacherCredentials } from '../types';
import { LogIn, Key, User, Lock, Eye, EyeOff, BookOpen, ShieldAlert, UserPlus, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { storage } from '../storage';
import { cloudAuth } from '../cloudFirestore';

interface LoginGatewayProps {
  teacherProfile: TeacherProfile;
  students: Student[];
  onLoginSuccess: (user: CurrentUser) => void;
  onNavigateToProfile: () => void;
  onNavigateToEnroll: () => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({
  teacherProfile,
  students,
  onLoginSuccess,
  onNavigateToProfile,
  onNavigateToEnroll,
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
    <div id="login-gateway-view" className="min-h-screen bg-[#f0f7fc] text-slate-800 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background subtle ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand & Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-sky-500/20">
            أ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-slate-900 tracking-tight">أُفُق</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">Ofoq</span>
            </div>
            <span className="text-[11px] text-sky-700 font-semibold block">{teacherProfile.name}</span>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-1.5">
          <button
            id="nav-to-profile-btn"
            onClick={onNavigateToProfile}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-[11px] font-bold text-slate-700 border border-sky-100 shadow-xs flex items-center gap-1.5 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>نبذة وخبرات</span>
          </button>

          <button
            id="nav-to-enroll-btn"
            onClick={onNavigateToEnroll}
            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[11px] font-bold text-orange-700 border border-orange-200 shadow-xs flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-3.5 h-3.5 text-orange-600" />
            <span>طلب انضمام</span>
          </button>
        </div>
      </div>

      {/* Unified Single Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6 z-10">
        <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-sky-900/5 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mb-1 border border-sky-100">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">تسجيل الدخول</h1>
            <p className="text-xs text-slate-500 font-medium">
              أدخل اسم المستخدم أو البريد الإلكتروني وكلمة المرور للمتابعة
            </p>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Unified Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  id="input-login-username"
                  type="text"
                  required
                  autoFocus
                  placeholder="اسم المستخدم أو البريد الإلكتروني"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-10 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:from-sky-600 hover:to-sky-800 disabled:opacity-60 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <LogIn className="w-4 h-4 text-orange-200" />
              <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          {/* Quick Notice */}
          <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-800">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>نظام الدخول الذكي الموحد:</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              يقوم النظام بتوجيهك تلقائياً إلى لوحة الأخصائي أو لوحة ولي الأمر بحسب بيانات الحساب المسجل.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-slate-500 z-10 pb-2 font-medium">
        <span>أفق (Ofoq) • المنصة التعليمية المتكاملة لمتابعة الجلسات والطلاب</span>
      </footer>
    </div>
  );
};

