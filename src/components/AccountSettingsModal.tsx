import React, { useState } from 'react';
import { Lock, Check, X, Eye, EyeOff, KeyRound } from 'lucide-react';
import { cloudAuth, MIN_PARENT_PASSWORD } from '../cloudFirestore';

interface AccountSettingsModalProps {
  onClose: () => void;
}

// إعدادات حساب الأخصائي: تغيير كلمة المرور فقط.
// كلمة المرور تُدار بالكامل في Firebase Authentication ولا تُحفظ في أي مكان آخر.
export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ onClose }) => {
  const email = cloudAuth.getCurrentUser()?.email || '';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PARENT_PASSWORD) {
      setError(`كلمة المرور الجديدة يجب ألا تقل عن ${MIN_PARENT_PASSWORD} خانات`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSaving(true);
    const res = await cloudAuth.changePassword(currentPassword, newPassword);
    setIsSaving(false);

    if (!res.success) {
      setError(res.error || 'تعذر تغيير كلمة المرور');
      return;
    }
    setSaved(true);
    setTimeout(onClose, 1800);
  };

  const inputClass =
    'w-full bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl w-full max-w-md shadow-2xl text-slate-800 dark:text-slate-100">
        <div className="p-4 border-b border-sky-100 dark:border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-base">إعدادات الحساب</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {email && (
            <p className="text-slate-500 dark:text-slate-400">
              الحساب: <span dir="ltr" className="font-mono font-bold text-slate-700 dark:text-slate-200">{email}</span>
            </p>
          )}

          <div>
            <label htmlFor="acc-current-pass" className="block font-bold mb-1">كلمة المرور الحالية</label>
            <input
              id="acc-current-pass"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="acc-new-pass" className="block font-bold mb-1">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                id="acc-new-pass"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="acc-confirm-pass" className="block font-bold mb-1">تأكيد كلمة المرور الجديدة</label>
            <input
              id="acc-confirm-pass"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {error && <p className="text-rose-600 dark:text-rose-400 font-bold">{error}</p>}
          {saved && (
            <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> تم تغيير كلمة المرور
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving || saved}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold flex items-center justify-center gap-2 transition"
          >
            <Lock className="w-4 h-4" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  );
};
