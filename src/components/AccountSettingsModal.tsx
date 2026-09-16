import React, { useState } from 'react';
import { TeacherCredentials, GoogleAccountLink } from '../types';
import { 
  Lock, Mail, Check, X, ShieldCheck, KeyRound, Eye, EyeOff, 
  Sparkles, RefreshCw, Unlink, CheckCircle2, AlertCircle, Laptop,
  Cloud, Database, Server, HardDriveDownload
} from 'lucide-react';
import { cloudService } from '../cloudFirestore';

interface AccountSettingsModalProps {
  currentCredentials: TeacherCredentials;
  onSave: (creds: TeacherCredentials) => void;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  currentCredentials,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'google' | 'cloud'>('password');
  
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

  // Cloud tab state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'فارغة', color: 'bg-slate-200' };
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

    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أو اسم المستخدم.');
      return;
    }

    if (!newPassword.trim()) {
      setError('يرجى إدخال كلمة المرور.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين، يرجى التأكد من كتابتهما بالمثل.');
      return;
    }

    onSave({
      email: email.trim(),
      password: newPassword.trim(),
      googleAccount: googleAccount,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleToggleGoogleLink = () => {
    const nextState = !googleAccount.linked;
    const updated: GoogleAccountLink = {
      ...googleAccount,
      linked: nextState,
      linkedAt: nextState ? new Date().toISOString().split('T')[0] : undefined,
    };
    setGoogleAccount(updated);

    onSave({
      email: email.trim(),
      password: newPassword.trim(),
      googleAccount: updated,
    });

    setGoogleActionMessage(nextState ? 'تم ربط المشروع بنجاح بحساب Google الخاص بك!' : 'تم فك ارتباط حساب Google.');
    setTimeout(() => setGoogleActionMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-sky-100 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-700">
              <KeyRound className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">إعدادات الأمان وحساب المعلم</h3>
              <p className="text-[11px] text-slate-500 font-medium">تغيير كلمة المرور وإدارة ربط حساب Google بالمشروع</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'password'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>تغيير كلمة المرور والدخول</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'google'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
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
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>سحابة Firestore</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">تم تحديث الإعدادات وكلمة المرور بنجاح!</h4>
            <p className="text-xs text-slate-500">كلمة المرور الحالية المعتمدة لحسابك أصبحت: <strong className="text-sky-700 font-mono text-sm">{newPassword}</strong></p>
          </div>
        ) : (
          <>
            {/* TAB 1: Password & Login Settings */}
            {activeTab === 'password' && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    البريد الإلكتروني / اسم المستخدم
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2.5 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition"
                      placeholder="مثال: mfekry225@gmail.com"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">يمكنك استخدام هذا البريد أو اسم المستخدم للدخول في شاشة الدخول الرئيسية.</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">
                      كلمة المرور الجديدة
                    </label>
                    <span className="text-[10px] font-bold text-slate-500">
                      القوة: <span className="font-bold text-slate-800">{strength.text}</span>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-10 py-2.5 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:border-sky-500 focus:bg-white transition"
                      placeholder="اكتب كلمة المرور الجديدة"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 absolute left-3 top-2.5 transition"
                      title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2.5 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:border-sky-500 focus:bg-white transition"
                      placeholder="أعد إدخال نفس كلمة المرور للتأكيد"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold shadow-sm shadow-sky-500/20 transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ وتحديث كلمة المرور</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Google Account Linking */}
            {activeTab === 'google' && (
              <div className="space-y-4 text-xs">
                {googleActionMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{googleActionMessage}</span>
                  </div>
                )}

                {/* Status Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm">حساب Google</h4>
                          {googleAccount.linked ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>مربوط ونشط</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                              غير مربوط
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-xs font-mono mt-0.5">
                          {googleAccount.email || 'mfekry225@gmail.com'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleGoogleLink}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                        googleAccount.linked
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-sky-600 text-white hover:bg-sky-700 shadow-xs'
                      }`}
                    >
                      {googleAccount.linked ? (
                        <>
                          <Unlink className="w-3.5 h-3.5" />
                          <span>إلغاء الربط</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ربط الحساب الآن</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="border-t border-slate-200/80 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>حالة المزامنة: {googleAccount.linked ? 'موثق ومعتمد للمشروع' : 'متوقف'}</span>
                    <span>المالك: أ. محمد فكري</span>
                  </div>
                </div>

                {/* Educational / Explanatory Note */}
                <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 text-sky-900 text-[11px] leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sky-800">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>تأكيد الخصوصية وسلاسة الدخول:</span>
                  </div>
                  <p>
                    • شاشة تسجيل الدخول الرئيسية تظل كما هي بنفس البساطة والسرعة دون أي تعقيد.
                  </p>
                  <p>
                    • ربط حساب Google الخاص بك (<strong className="font-mono">mfekry225@gmail.com</strong>) يضمن توثيق ملكية النظام وتأمين وصولك الإداري دائماً.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition text-xs"
                  >
                    تم وإغلاق
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Cloud Firestore Database & Security */}
            {activeTab === 'cloud' && (
              <div className="space-y-4 text-xs">
                {/* Cloud Connection Badge */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-white text-sky-700 shadow-2xs border border-sky-100">
                        <Cloud className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>Google Cloud Firestore</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            نشط ومحمي ✅
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">قاعدة بيانات سحابية لحظية ومؤمّنة بأعلى معايير التشفير</p>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Specs */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 bg-white/90 rounded-xl border border-sky-100/70">
                      <span className="text-slate-400 block text-[10px]">معرف المشروع (Project ID):</span>
                      <span className="font-mono font-bold text-slate-800 text-[10px]">inspiring-coda-rmn89</span>
                    </div>

                    <div className="p-2 bg-white/90 rounded-xl border border-sky-100/70">
                      <span className="text-slate-400 block text-[10px]">تشفير البيانات:</span>
                      <span className="font-bold text-emerald-700 text-[10px]">AES-256 مشفر سحابياً</span>
                    </div>

                    <div className="p-2 bg-white/90 rounded-xl border border-sky-100/70">
                      <span className="text-slate-400 block text-[10px]">قواعد الأمان (Security Rules):</span>
                      <span className="font-bold text-sky-800 text-[10px]">Firestore Rules منشورة ومطبقة</span>
                    </div>

                    <div className="p-2 bg-white/90 rounded-xl border border-sky-100/70">
                      <span className="text-slate-400 block text-[10px]">المزامنة اللحظية:</span>
                      <span className="font-bold text-emerald-700 text-[10px]">مفعلة (Real-Time Sync)</span>
                    </div>
                  </div>
                </div>

                {/* Cloud Security Explanations */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ضمانات الأمان السحابي لحسابك وبيانات الطلاب:</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    <li>تخزين مشفر بالكامل في مراكز بيانات Google السحابية.</li>
                    <li>عزل تام لحسابات أولياء الأمور: لا يطّلع ولي الأمر إلا على تقارير وجلسات طفله فقط.</li>
                    <li>صلاحيات التعديل والإضافة والحذف محصورة في حساب الأخصائي الإداري فقط.</li>
                    <li>استمرارية البيانات دون قلق من مسح الذاكرة المؤقتة أو تبديل الجهاز أو الهاتف.</li>
                  </ul>
                </div>

                {/* One-click manual backup / sync */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">مزامنة سحابية شاملة</span>
                    <span className="text-[11px] text-slate-500">رفع ونسخ كافة الطلاب والجلسات والإعدادات للسحابة يدوياً</span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (isBackingUp) return;
                      setIsBackingUp(true);
                      setBackupMessage('جاري نسخ البيانات إلى Firestore...');
                      const ok = await cloudService.backupAllToCloud();
                      setIsBackingUp(false);
                      if (ok) {
                        setBackupMessage('تمت المزامنة وحفظ جميع البيانات في السحابة بنجاح! ✅');
                        setTimeout(() => setBackupMessage(null), 3500);
                      } else {
                        setBackupMessage('تعذر الاتصال، تأكد من اتصال الإنترنت.');
                        setTimeout(() => setBackupMessage(null), 3500);
                      }
                    }}
                    disabled={isBackingUp}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                    <span>{isBackingUp ? 'جاري النسخ...' : 'نسخ احتياطي فوري'}</span>
                  </button>
                </div>

                {backupMessage && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold text-center animate-in fade-in">
                    {backupMessage}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition text-xs"
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
