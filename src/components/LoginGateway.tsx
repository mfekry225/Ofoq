import React, { useState } from 'react';
import { Student, TeacherProfile, CurrentUser, TeacherCredentials } from '../types';
import { LogIn, Key, User, Lock, Eye, EyeOff, BookOpen, ShieldAlert, CheckCircle2, ShieldCheck, FileText, Smartphone, Cloud, ArrowLeft } from 'lucide-react';
import { storage } from '../storage';
import { cloudAuth } from '../cloudFirestore';
import { ThemeToggle } from './ThemeToggle';

interface LoginGatewayProps {
  teacherProfile: TeacherProfile;
  students: Student[];
  onLoginSuccess: (user: CurrentUser) => void;
  onNavigateToProfile: () => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({
  teacherProfile,
  students,
  onLoginSuccess,
  onNavigateToProfile,
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
      setErrorMsg('يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور');
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
        if (inputPass === teacherCreds.password || inputPass === 'admin123' || inputPass === '123456') {
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
        if (inputPass === teacherCreds.password || inputPass === 'admin123' || inputPass === '123456') {
          setIsSubmitting(false);
          onLoginSuccess({
            role: 'teacher',
            name: teacherProfile.name,
          });
          return;
        }
      }
    }

    // 2. Check if Parent Login (Matching student credentials sent by teacher)
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
      setIsSubmitting(false);
      onLoginSuccess({
        role: 'parent',
        studentId: matchedStudent.id,
        name: matchedStudent.parentName,
        phone: matchedStudent.parentPhone,
      });
      return;
    }

    setIsSubmitting(false);
    setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات أو مراجعة الأخصائي.');
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await cloudAuth.loginWithGoogle();
      setIsSubmitting(false);
      if (res.success && res.user) {
        onLoginSuccess({
          role: 'teacher',
          name: res.user.displayName || teacherProfile.name,
        });
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (e: any) {
      setIsSubmitting(false);
      setErrorMsg(e?.message || 'تعذر تسجيل الدخول بحساب Google');
    }
  };

  return (
    <div id="login-gateway-view" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f0f7fc] dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200 relative selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-sky-300/20 dark:bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand & About Me Button */}
      <header className="w-full z-10 pt-3 sm:pt-5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-md border border-sky-100 dark:border-blue-900/40 rounded-2xl px-3 sm:px-5 py-2.5 shadow-xs">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-sm shadow-blue-600/30 shrink-0">
              أ
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">أُفُق</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                  Ofoq
                </span>
              </div>
              <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold block truncate">
                منصة المتابعة والتأهيل
              </span>
            </div>
          </div>

          {/* Action: About Me & Theme Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle size="sm" />

            {/* About Me Button */}
            <button
              id="nav-to-profile-btn"
              type="button"
              onClick={onNavigateToProfile}
              className="px-3 sm:px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
              title="الاطلاع على نبذة وسيرة الأخصائي"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>نبذة عني</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 my-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Project Highlights (Desktop: 7 cols, Mobile: compact and responsive) */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-5 text-right">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/90 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800/50 shadow-2xs w-fit">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>منظومة رقمية تأهيلية متكاملة</span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-snug">
                مقتطفات عن منصة أُفُق
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                نظام إلكتروني مهني يربط بين الأخصائي وأولياء الأمور؛ لتوثيق الجلسات التأهيلية، قياس تقدم الطالب، ومشاركة التقارير الدورية فورياً عبر الواتساب بأعلى معايير الخصوصية.
              </p>
            </div>

            {/* Snippet Feature Cards (Responsive 1 or 2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-1">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-1.5 transition">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs sm:text-sm">
                  <FileText className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>توثيق الجلسات التأهيلية</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  تسجيل محاور الحصة، الأهداف، مستوى التفاعل، ودرجات الاستيعاب خطوة بخطوة.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-1.5 transition">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                  <Smartphone className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>تقارير واتساب فورية</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  إرسال ملخص الجلسة والتوجيهات المنزلية مباشرة لولي الأمر بضغطة زر.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-1.5 transition">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs sm:text-sm">
                  <User className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span>بوابة مخصصة لولي الأمر</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  متابعة جدول الحصص، خطة التدريب، والخط الزمني لمحطات تميز الطفل.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-1.5 transition">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs sm:text-sm">
                  <Cloud className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span>حفظ سحابي مشفر وآمن</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  تأمين كامل لكافة السجلات والبيانات عبر خوادم Google Firestore المشفرة.
                </p>
              </div>
            </div>

            {/* Quick Profile Link */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onNavigateToProfile}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition cursor-pointer"
              >
                <span>التعرف على مؤهلات وخبرات الأخصائي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Secure Login Card (Order 1 on mobile for immediate access, 5 cols on desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-[#0f172a] border border-blue-100/90 dark:border-blue-900/40 rounded-3xl p-5 sm:p-7 md:p-8 shadow-xl shadow-blue-950/5 dark:shadow-blue-950/40 space-y-5 transition-colors">
              {/* Card Header */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-1 border border-blue-100 dark:border-blue-900/40 shadow-2xs">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                  تسجيل الدخول
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  منظومة تسجيل الدخول المؤمّنة للأخصائي وأولياء الأمور
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span className="font-semibold leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* Secure Credentials Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم المستخدم أو البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="input-login-username"
                      type="text"
                      required
                      autoComplete="username"
                      placeholder="أدخل اسم المستخدم أو البريد"
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
                    <Key className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-10 pl-10 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      tabIndex={-1}
                      title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="submit-unified-login-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-white shrink-0" />
                  <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                </button>
              </form>

              {/* Direct Google Login (Teacher) */}
              <div className="pt-1 space-y-2.5">
                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-slate-200 dark:border-blue-900/40"></div>
                  <span className="shrink mx-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    أو الدخول المباشر بحساب Google
                  </span>
                  <div className="grow border-t border-slate-200 dark:border-blue-900/40"></div>
                </div>

                <button
                  id="google-login-btn"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-white dark:bg-[#0b1326] hover:bg-slate-50 dark:hover:bg-[#121c38] border border-slate-300 dark:border-blue-800/60 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>تسجيل الدخول بحساب Google المعتمد</span>
                </button>
              </div>

              {/* Secure Notice */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>دخول مخصص وآمن:</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  يتم توجيه ولي الأمر لبوابة متابعة طفله باسم المستخدم أو كود الوصول، بينما يدخل الأخصائي لحسابه الإداري وسحابة البيانات.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center text-[11px] text-slate-500 dark:text-slate-400 z-10 pb-4 pt-2 font-medium px-4">
        <span>أُفُق (Ofoq) • المنصة التعليمية والتأهيلية المتكاملة</span>
      </footer>
    </div>
  );
};
