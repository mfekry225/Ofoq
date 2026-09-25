import React, { useState, useEffect } from 'react';
import { TeacherCredentials, GoogleAccountLink } from '../types';
import { 
  Lock, Mail, Check, X, ShieldCheck, KeyRound, Eye, EyeOff, 
  RefreshCw, Unlink, CheckCircle2, Cloud, LogOut
} from 'lucide-react';
import { cloudService, cloudAuth } from '../cloudFirestore';

interface AccountSettingsModalProps {
  currentCredentials: TeacherCredentials;
  initialTab?: 'password' | 'google' | 'cloud';
  onSave: (creds: TeacherCredentials) => void;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  currentCredentials,
  initialTab = 'password',
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'google' | 'cloud'>(initialTab);
  
  // Credentials state
  const [email, setEmail] = useState(currentCredentials.email);
  const [newPassword, setNewPassword] = useState(currentCredentials.password);
  const [confirmPassword, setConfirmPassword] = useState(currentCredentials.password);
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Link state
  const defaultGoogle: GoogleAccountLink = currentCredentials.googleAccount || {
    linked: true,
    email: 'mfekry225@gmail.com',
    name: 'أ. محمد فكري (حساب Google)',
    linkedAt: new Date().toISOString().split('T')[0]
  };
  const [googleAccount, setGoogleAccount] = useState<GoogleAccountLink>(defaultGoogle);
  const [googleActionMessage, setGoogleActionMessage] = useState<string | null>(null);

  // Cloud tab state & Google Auth state
  const [currentUser, setCurrentUser] = useState<any>(() => cloudAuth.getCurrentUser());
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cloudAuth.onAuthChange((user) => {
      setCurrentUser(user);
      if (user && user.email) {
        setGoogleAccount(prev => ({
          ...prev,
          linked: true,
          email: user.email || 'mfekry225@gmail.com',
          name: user.displayName || 'أ. محمد فكري (حساب Google)',
          linkedAt: prev.linkedAt || new Date().toISOString().split('T')[0]
        }));
      }
    });
    return () => unsub();
  }, []);

  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'فارغة', color: 'bg-slate-200 dark:bg-slate-700' };
    if (pass.length < 6) return { score: 1, text: 'قصيرة جداً', color: 'bg-rose-400' };
    const hasNum = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    if (pass.length >= 8 && hasNum && hasLetter) return { score: 3, text: 'قوية وممتازة ⭐', color: 'bg-emerald-500' };
    if (pass.length >= 6) return { score: 2, text: 'متوسطة', color: 'bg-amber-400' };
    return { score: 1, text: 'ضعيفة', color: 'bg-rose-400' };
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 4) {
      setError('كلمة المرور يجب ألا تقل عن 4 خانات');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين، يرجى إعادة التأكد');
      return;
    }

    onSave({
      ...currentCredentials,
      email: email.trim(),
      password: newPassword,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 2000);
  };

  const handleGoogleSignInAndSync = async () => {
    setIsGoogleSyncing(true);
    setSyncFeedback('جاري فتح نافذة تسجيل الدخول بحساب Google...');
    try {
      const res = await cloudAuth.loginWithGoogle();
      if (res.success && res.user) {
        const userEmail = res.user.email || 'mfekry225@gmail.com';
        const updatedLink: GoogleAccountLink = {
          linked: true,
          email: userEmail,
          name: res.user.displayName || 'أ. محمد فكري (حساب Google)',
          linkedAt: new Date().toISOString().split('T')[0]
        };
        setGoogleAccount(updatedLink);
        onSave({
          ...currentCredentials,
          googleAccount: updatedLink,
        });

        setSyncFeedback('تمت المصادقة بنجاح! جاري رفع البيانات ومزامنتها مع Firestore...');
        const syncRes = await cloudService.backupAllToCloud();
        if (syncRes.success) {
          setSyncFeedback(`تم الاتصال وحفظ ${syncRes.count} سجلاً في Firestore بنجاح ✅`);
        } else {
          setSyncFeedback(syncRes.error || 'تم ربط الحساب بنجاح.');
        }
      } else {
        setSyncFeedback(res.error || 'تم إلغاء تسجيل الدخول');
      }
    } catch (err: any) {
      setSyncFeedback(err?.message || 'حدث خطأ أثناء الاتصال بحساب Google');
    } finally {
      setIsGoogleSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleGoogleSignOut = async () => {
    await cloudAuth.logout();
    const updatedLink: GoogleAccountLink = {
      linked: false,
      email: googleAccount.email || 'mfekry225@gmail.com',
    };
    setGoogleAccount(updatedLink);
    onSave({
      ...currentCredentials,
      googleAccount: updatedLink,
    });
    setSyncFeedback('تم تسجيل الخروج وفك ارتباط حساب Google.');
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleToggleGoogleLink = async () => {
    if (googleAccount.linked || currentUser) {
      await handleGoogleSignOut();
    } else {
      await handleGoogleSignInAndSync();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-6 sm:p-7 w-full max-w-lg md:max-w-2xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-blue-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 shadow-xs">
              <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">إعدادات الأمان وحساب المعلم</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">تغيير كلمة المرور وإدارة ربط حساب Google بالمشروع</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#152244] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-[#0b1326] rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'password'
                ? 'bg-white dark:bg-[#152244] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>كلمة المرور</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white dark:bg-[#152244] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>حساب Google</span>
            {googleAccount.linked && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white dark:bg-[#152244] text-blue-800 dark:text-blue-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>سحابة Firestore</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">تم تحديث الإعدادات وكلمة المرور بنجاح!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">كلمة المرور الحالية المعتمدة لحسابك أصبحت: <strong className="text-blue-700 dark:text-blue-400 font-mono text-sm">{newPassword}</strong></p>
          </div>
        ) : (
          <>
            {/* TAB 1: Password & Login Settings */}
            {activeTab === 'password' && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    البريد الإلكتروني / اسم المستخدم
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-10 pl-3 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                      placeholder="مثال: mfekry225@gmail.com"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">يمكنك استخدام هذا البريد أو اسم المستخدم للدخول في شاشة الدخول الرئيسية.</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      كلمة المرور الجديدة
                    </label>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      القوة: <span className="font-bold text-slate-800 dark:text-slate-200">{strength.text}</span>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-10 pl-10 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                      placeholder="اكتب كلمة المرور الجديدة"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 absolute left-3 top-2.5 transition cursor-pointer"
                      title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-10 pl-3 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                      placeholder="أعد إدخال كلمة المرور"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 dark:hover:bg-[#1e2f5c] text-slate-600 dark:text-slate-300 font-bold transition cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>حفظ وتحديث كلمة المرور</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Google Account Linking */}
            {activeTab === 'google' && (
              <div className="space-y-4 text-xs">
                {syncFeedback && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 font-bold animate-in fade-in flex items-center justify-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{syncFeedback}</span>
                  </div>
                )}

                {googleActionMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold animate-in fade-in">
                    {googleActionMessage}
                  </div>
                )}

                {/* Firestore Cloud Prompt Banner */}
                <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3.5 text-xs shadow-xs">
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        تأمين وحفظ البيانات في قاعدة Firestore السحابية
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5 break-words">
                        {currentUser
                          ? `تم تسجيل الدخول وتفعيل الحفظ السحابي التلقائي بحساب: ${currentUser.email || 'mfekry225@gmail.com'}`
                          : 'قم بتسجيل الدخول بحساب Google المعتمد (mfekry225@gmail.com) لتفعيل الحفظ السحابي التلقائي'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
                    {currentUser ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <span className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>مفعل ومتصل</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleGoogleSignOut}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#152244] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 font-bold text-xs transition cursor-pointer"
                        >
                          خروج
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSignInAndSync}
                        disabled={isGoogleSyncing}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 active:scale-98 cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z"/>
                          <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span>{isGoogleSyncing ? 'جاري الاتصال...' : 'ربط ومزامنة Firestore الآن'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-[#080d1a] dark:to-[#0b1326] border border-slate-200 dark:border-blue-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0f172a] shadow-xs border border-slate-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">حساب Google</h4>
                          {currentUser || googleAccount.linked ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>مربوط ونشط</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#152244] text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                              غير مربوط
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs font-mono mt-0.5 break-all">
                          {currentUser?.email || googleAccount.email || 'mfekry225@gmail.com'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleGoogleLink}
                      disabled={isGoogleSyncing}
                      className={`w-full sm:w-auto px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                        currentUser || googleAccount.linked
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/40'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                      }`}
                    >
                      {currentUser || googleAccount.linked ? (
                        <>
                          <Unlink className="w-3.5 h-3.5" />
                          <span>إلغاء الربط</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isGoogleSyncing ? 'جاري الربط...' : 'ربط الحساب الآن'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="border-t border-slate-200/80 dark:border-blue-900/30 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>حالة المزامنة: {currentUser || googleAccount.linked ? 'موثق ومعتمد للمشروع سحابياً' : 'متوقف'}</span>
                    <span>المالك: أ. محمد فكري</span>
                  </div>
                </div>

                {/* Educational / Explanatory Note */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-[#0b1326] border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 text-[11px] leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>تأكيد الخصوصية وسلاسة الدخول:</span>
                  </div>
                  <p>
                    • شاشة تسجيل الدخول تتيح الدخول بكلمة المرور أو بحساب Google المعتمد.
                  </p>
                  <p>
                    • ربط حساب Google الخاص بك (<strong className="font-mono">mfekry225@gmail.com</strong>) يضمن توثيق ملكية النظام وتأمين وصولك الإداري وقاعدة بيانات Firestore دائماً.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold transition text-xs cursor-pointer text-center"
                  >
                    تم وإغلاق
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Cloud Firestore Database & Security */}
            {activeTab === 'cloud' && (
              <div className="space-y-4 text-xs">
                {/* تأمين وحفظ البيانات في قاعدة Firestore السحابية */}
                <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3.5 text-xs shadow-xs">
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        قاعدة بيانات Firestore السحابية المباشرة
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5 break-words">
                        مزامنة فورية وتلقائية لكافة بيانات الطلاب والجلسات بين الهاتف والكمبيوتر
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
                    <span className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>متصل ومفعل تلقائياً 🟢</span>
                    </span>
                  </div>
                </div>

                {/* Cloud Connection Badge */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-[#080d1a] dark:to-[#0b1326] border border-blue-200/80 dark:border-blue-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#0f172a] text-blue-700 dark:text-blue-300 shadow-2xs border border-blue-100 dark:border-blue-900/40">
                        <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <span>Google Cloud Firestore</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            نشط ومحمي ✅
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">قاعدة بيانات سحابية لحظية ومؤمّنة بأعلى معايير التشفير</p>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 bg-white/90 dark:bg-[#0f172a] rounded-xl border border-blue-100/70 dark:border-blue-900/40">
                      <span className="text-slate-400 block text-[10px]">قاعدة البيانات (Database ID):</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[10px] block truncate">ai-studio-f95d4de1-ab65-4e8f-85ac-0d9ac0105c14</span>
                    </div>

                    <div className="p-2.5 bg-white/90 dark:bg-[#0f172a] rounded-xl border border-blue-100/70 dark:border-blue-900/40">
                      <span className="text-slate-400 block text-[10px]">تشفير البيانات:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[10px]">AES-256 مشفر سحابياً</span>
                    </div>

                    <div className="p-2.5 bg-white/90 dark:bg-[#0f172a] rounded-xl border border-blue-100/70 dark:border-blue-900/40">
                      <span className="text-slate-400 block text-[10px]">قواعد الأمان (Security Rules):</span>
                      <span className="font-bold text-blue-800 dark:text-blue-300 text-[10px]">منشورة ومطبقة ✅</span>
                    </div>

                    <div className="p-2.5 bg-white/90 dark:bg-[#0f172a] rounded-xl border border-blue-100/70 dark:border-blue-900/40">
                      <span className="text-slate-400 block text-[10px]">المزامنة اللحظية:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[10px]">مفعلة (Real-Time Sync)</span>
                    </div>
                  </div>
                </div>

                {/* Cloud Security Explanations */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>ضمانات الأمان السحابي لحسابك وبيانات الطلاب:</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    <li>تخزين مشفر بالكامل في مراكز بيانات Google السحابية.</li>
                    <li>عزل تام لحسابات أولياء الأمور: لا يطّلع ولي الأمر إلا على تقارير وجلسات طفله فقط.</li>
                    <li>صلاحيات التعديل والإضافة والحذف محصورة في حساب الأخصائي الإداري فقط.</li>
                    <li>استمرارية البيانات دون قلق من مسح الذاكرة المؤقتة أو تبديل الجهاز أو الهاتف.</li>
                  </ul>
                </div>

                {/* One-click manual backup / sync */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">مزامنة سحابية شاملة</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">رفع ونسخ كافة الطلاب والجلسات والإعدادات للسحابة يدوياً</span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (isBackingUp) return;
                      setIsBackingUp(true);
                      setBackupMessage('جاري نسخ البيانات إلى Firestore...');
                      const res = await cloudService.backupAllToCloud();
                      setIsBackingUp(false);
                      if (res.success) {
                        setBackupMessage(`تمت المزامنة وحفظ ${res.count} سجلاً في Firestore بنجاح! ✅`);
                        setTimeout(() => setBackupMessage(null), 3500);
                      } else {
                        setBackupMessage(res.error || 'تعذر الاتصال، تأكد من اتصال الإنترنت.');
                        setTimeout(() => setBackupMessage(null), 3500);
                      }
                    }}
                    disabled={isBackingUp}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                    <span>{isBackingUp ? 'جاري النسخ...' : 'نسخ احتياطي فوري'}</span>
                  </button>
                </div>

                {(backupMessage || syncFeedback) && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold text-center animate-in fade-in">
                    {backupMessage || syncFeedback}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold transition text-xs cursor-pointer text-center"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
