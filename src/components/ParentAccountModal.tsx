import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, Send, RefreshCw, ShieldOff, ShieldCheck } from 'lucide-react';
import { Student } from '../types';
import { cloudAuth, MIN_PARENT_PASSWORD, USERNAME_RULE } from '../cloudFirestore';
import { getWhatsAppUrl } from '../utils';

interface ParentAccountModalProps {
  student: Student;
  onClose: () => void;
}

const PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // بدون أحرف متشابهة (0/o و1/l/i)

function randomPassword(length = 10): string {
  const out: string[] = [];
  const limit = 256 - (256 % PASSWORD_ALPHABET.length);
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const b of bytes) {
      if (b < limit && out.length < length) out.push(PASSWORD_ALPHABET[b % PASSWORD_ALPHABET.length]);
    }
  }
  return out.join('');
}

function suggestUsername(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 10000;
  return `ofq-${String(n).padStart(4, '0')}`;
}

// إنشاء حساب ولي الأمر أو إعادة إصدار بياناته أو إلغاء وصوله.
// كلمة المرور تظهر هنا مرة واحدة فقط ولا تُحفظ في أي مكان (Firebase يحتفظ بنسخة مشفرة لا يمكن قراءتها).
export const ParentAccountModal: React.FC<ParentAccountModalProps> = ({ student, onClose }) => {
  const hasAccount = Boolean(student.parentUid);
  const [username, setUsername] = useState(suggestUsername());
  const [password, setPassword] = useState(randomPassword());
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoked, setRevoked] = useState(false);

  const inputClass =
    'w-full bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500 transition text-sm';

  const message = (u: string, p: string) =>
    `مرحباً ${student.parentName}،\nبيانات دخولكم لمتابعة جلسات وتقارير الطالب (${student.name}) في منصة أُفق:\n• اسم المستخدم: ${u}\n• كلمة المرور: ${p}\nرابط الدخول:\n${window.location.origin}`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanUser = username.trim().toLowerCase();
    if (!USERNAME_RULE.test(cleanUser)) {
      setError('اسم المستخدم: من 3 إلى 30 خانة، أحرف إنجليزية صغيرة وأرقام و(-) أو (_) فقط.');
      return;
    }
    if (password.length < MIN_PARENT_PASSWORD) {
      setError(`كلمة المرور يجب ألا تقل عن ${MIN_PARENT_PASSWORD} خانات.`);
      return;
    }
    setIsWorking(true);
    const res = await cloudAuth.createParentAccount(student, cleanUser, password);
    setIsWorking(false);
    if (!res.success) {
      setError(res.error || 'تعذر إنشاء الحساب.');
      return;
    }
    setIssued({ username: cleanUser, password });
  };

  const handleRevoke = async () => {
    if (!window.confirm('سيفقد ولي الأمر الوصول إلى ملف الطالب فوراً. هل أنت متأكد؟')) return;
    setIsWorking(true);
    const ok = await cloudAuth.revokeParentAccess(student);
    setIsWorking(false);
    if (ok) setRevoked(true);
    else setError('تعذر إلغاء الوصول. حاول مرة أخرى.');
  };

  const handleCopy = () => {
    if (!issued) return;
    navigator.clipboard.writeText(message(issued.username, issued.password));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    if (!issued) return;
    const phone = student.parentPhone || student.motherPhone || '';
    window.open(getWhatsAppUrl(phone, message(issued.username, issued.password)), '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl w-full max-w-md shadow-2xl text-slate-800 dark:text-slate-100 my-auto">
        <div className="p-4 border-b border-sky-100 dark:border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="font-bold text-base truncate">حساب ولي الأمر — {student.name}</h2>
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

        <div className="p-5 space-y-4 text-xs">
          {issued ? (
            <>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> تم إنشاء الحساب
                </p>
                <p>اسم المستخدم: <span dir="ltr" className="font-mono font-bold">{issued.username}</span></p>
                <p>كلمة المرور: <span dir="ltr" className="font-mono font-bold">{issued.password}</span></p>
              </div>
              <p className="text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                كلمة المرور تظهر الآن فقط ولا تُحفظ في أي مكان. انسخها أو أرسلها قبل إغلاق النافذة.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-2 rounded-xl border border-slate-200 dark:border-blue-900/40 font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-[#152244] transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'تم النسخ' : 'نسخ البيانات'}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" /> إرسال بالواتساب
                </button>
              </div>
            </>
          ) : revoked ? (
            <p className="font-bold text-emerald-700 dark:text-emerald-400">تم إلغاء وصول ولي الأمر لملف الطالب.</p>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3.5">
              {hasAccount && (
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 leading-relaxed">
                  يوجد حساب فعّال لهذا الطالب{student.parentUsername ? <> (اسم المستخدم: <span dir="ltr" className="font-mono font-bold">{student.parentUsername}</span>)</> : null}.
                  كلمة المرور لا يمكن عرضها لأنها غير محفوظة. لإصدار بيانات جديدة أنشئ حساباً بالاسم الجديد أدناه، وسيُلغى الحساب القديم تلقائياً.
                </div>
              )}

              <div>
                <label htmlFor="pa-username" className="block font-bold mb-1">اسم المستخدم</label>
                <input
                  id="pa-username"
                  type="text"
                  dir="ltr"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="pa-password" className="block font-bold mb-1">كلمة المرور</label>
                <div className="flex gap-2">
                  <input
                    id="pa-password"
                    type="text"
                    dir="ltr"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => { setUsername(suggestUsername()); setPassword(randomPassword()); }}
                    aria-label="توليد بيانات جديدة"
                    title="توليد بيانات جديدة"
                    className="px-3 rounded-xl border border-slate-200 dark:border-blue-900/50 hover:bg-slate-50 dark:hover:bg-[#152244] transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {error && <p className="text-rose-600 dark:text-rose-400 font-bold">{error}</p>}

              <button
                type="submit"
                disabled={isWorking}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold transition"
              >
                {isWorking ? 'جاري التنفيذ...' : hasAccount ? 'إصدار بيانات جديدة' : 'إنشاء الحساب'}
              </button>

              {hasAccount && (
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={isWorking}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 font-bold flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <ShieldOff className="w-4 h-4" /> إلغاء وصول ولي الأمر
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
