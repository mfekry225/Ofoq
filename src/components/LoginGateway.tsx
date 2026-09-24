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
    setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات أو مراجعة المعلم.');
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await cloudAuth.loginWithGoogle();
      setIsSubmitting(false);
      if (res.success && res.user) {
        const email = res.user.email?.toLowerCase();
        if (email === 'mfekry225@gmail.com' || email === teacherProfile.email.toLowerCase()) {
          onLoginSuccess({
            role: 'teacher',
            name: res.user.displayName || teacherProfile.name,
          });
        } else {
          // If logged in with another google account
          onLoginSuccess({
            role: 'teacher',
            name: res.user.displayName || teacherProfile.name,
          });
        }
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (e: any) {
      setIsSubmitting(false);
      setErrorMsg(e?.message || 'تعذر تسجيل الدخول بحساب Google');
    }
  };

  return (
    <div id="login-gateway-view" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f0f7fc] dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 flex flex-col justify-between p-3 sm:p-6 relative transition-colors duration-200">
      {/* Background subtle ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-300/20 dark:bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand & Navigation */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-3 z-10 pt-2 sm:pt-4 px-2 sm:px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-md shadow-blue-600/20 shrink-0">
            أ
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">أُفُق</span>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">Ofoq</span>
            </div>
            <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold block truncate max-w-[140px] sm:max-w-none">{teacherProfile.name}</span>
          </div>
        </div>

        {/* Action Links & Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle size="sm" />

          {onNavigateToAssessments && (
            <button
              id="nav-to-assessments-btn"
              onClick={onNavigateToAssessments}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              title="المقاييس السريعة وفحص مؤشرات الطفل"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>المقاييس (10 بنود)</span>
            </button>
          )}

          <button
            id="nav-to-profile-btn"
            onClick={onNavigateToProfile}
            className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-blue-50 dark:hover:bg-[#152244] text-xs font-bold text-slate-700 dark:text-slate-200 border border-sky-100 dark:border-blue-900/40 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            title="نبذة وخبرات الأخصائي"
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden xs:inline">النبذة</span>
          </button>

          <button
            id="nav-to-enroll-btn"
            onClick={onNavigateToEnroll}
            className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            title="طلب حجز وتقييم"
          >
            <UserPlus className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>انضمام</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Container: 2 Columns on Desktop, Single Column on Mobile */}
      <div className="max-w-6xl w-full mx-auto my-auto py-6 sm:py-10 z-10 px-2 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Right Hero Presentation (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800/50 w-fit">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>المنصة التأهيلية الرائدة لمتابعة التخاطب والنمو اللغوي</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl xl:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                رعاية متكاملة ومتابعة دقيقة لكل طفل
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                نظام رقمي سحابي متطور يجمع بين الأخصائي وأولياء الأمور؛ لتوثيق الجلسات التأهيلية، قياس التطور، ومشاركة التقارير الدورية فورياً عبر الواتساب.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4 مقاييس مقننة (10 بنود)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  فحص سريع لتأخر اللغة، التوحد، صعوبات التعلم، والتلعثم بنتائج فورية.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تقارير واتساب فورية</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  إرسال ملخص الجلسة والتوجيهات المنزلية مباشرة لولي الأمر بضغطة زر.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>بوابة مخصصة لكل ولي أمر</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  متابعة إنجاز الجلسات، التقييمات، والخط الزمني لمحطات التميز.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تخزين سحابي مباشر ومحمي</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  ربط وتأمين كامل للبيانات عبر خوادم Google Firestore المشفرة.
                </p>
              </div>
            </div>

            {/* Quick Action Button for Screening */}
            {onNavigateToAssessments && (
              <div className="pt-2">
                <button
                  onClick={onNavigateToAssessments}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 flex items-center gap-2 transition cursor-pointer w-fit"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>بدء فحص مؤشرات الطفل الآن (مجاناً)</span>
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Left Column (5 cols on desktop, full width on mobile): Login Card */}
          <div className="lg:col-span-5 w-full space-y-4">
            <div className="bg-white dark:bg-[#0f172a] border border-blue-100/80 dark:border-blue-900/40 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-950/5 dark:shadow-blue-950/40 space-y-5 sm:space-y-6 transition-colors">
              {/* Header */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-1 border border-blue-100 dark:border-blue-900/40">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">تسجيل الدخول</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  أدخل بيانات الحساب أو اختر الدخول السحابي المباشر
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

              {/* Google Teacher Login Button */}
              <div className="pt-1">
                <div className="relative flex py-2 items-center">
                  <div className="grow border-t border-slate-200 dark:border-blue-900/40"></div>
                  <span className="shrink mx-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">أو دخول الأخصائي السحابي المباشر</span>
                  <div className="grow border-t border-slate-200 dark:border-blue-900/40"></div>
                </div>

                <button
                  id="google-login-btn"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full mt-1.5 py-3 px-4 rounded-xl bg-white dark:bg-[#0b1326] hover:bg-slate-50 dark:hover:bg-[#121c38] border border-slate-300 dark:border-blue-800/60 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
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
                  <span>تسجيل الدخول السحابي بحساب Google</span>
                </button>
                <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  مخصص لإدارة وحفظ بيانات السحابة Firestore (mfekry225@gmail.com)
                </p>
              </div>

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

            {/* Quick Screening Banner for Mobile Only (since desktop has it in the hero) */}
            {onNavigateToAssessments && (
              <div className="lg:hidden bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-sky-600/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/40 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs transition">
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
                  id="gateway-quick-assess-btn-mobile"
                  onClick={onNavigateToAssessments}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 shadow-sm shadow-blue-600/20 transition cursor-pointer flex items-center gap-1"
                >
                  <span>ابدأ</span>
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-slate-500 dark:text-slate-400 z-10 pb-2 font-medium">
        <span>أفق (Ofoq) • المنصة التعليمية المتكاملة لمتابعة الجلسات والطلاب</span>
      </footer>
    </div>
  );
};

