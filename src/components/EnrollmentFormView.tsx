import React, { useState } from 'react';
import { TeacherProfile, EnrollmentLead } from '../types';
import { UserPlus, Send, MessageCircle, ArrowRight, CheckCircle2, Phone, User, Calendar, BookOpen, Sparkles } from 'lucide-react';
import { getWhatsAppUrl } from '../utils';

interface EnrollmentFormViewProps {
  teacherProfile: TeacherProfile;
  onAddLead: (lead: Omit<EnrollmentLead, 'id' | 'createdAt' | 'status'>) => void;
  onBack: () => void;
  onNavigateToLogin: () => void;
}

export const EnrollmentFormView: React.FC<EnrollmentFormViewProps> = ({
  teacherProfile,
  onAddLead,
  onBack,
  onNavigateToLogin,
}) => {
  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    studentAge: '',
    subjectNeeded: teacherProfile.subjects[0] || '',
    phone: '',
    preferredTime: 'مساءً (من 5 إلى 8 م)',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [directWhatsAppRequested, setDirectWhatsAppRequested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentName || !formData.studentName || !formData.phone) return;

    onAddLead({
      parentName: formData.parentName,
      studentName: formData.studentName,
      studentAge: formData.studentAge,
      subjectNeeded: formData.subjectNeeded,
      phone: formData.phone,
      preferredTime: formData.preferredTime,
      notes: formData.notes,
    });

    setSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const message = `*طلب حجز واستفسار جديد من الموقع:*
👤 *اسم ولي الأمر:* ${formData.parentName || 'غير محدد'}
👦 *اسم الطالب:* ${formData.studentName || 'غير محدد'}
🎂 *العمر / الصف:* ${formData.studentAge || 'غير محدد'}
📚 *المادة المطلوبة:* ${formData.subjectNeeded}
📱 *رقم الهاتف للتواصل:* ${formData.phone || 'غير محدد'}
⏰ *الموعد المفضل:* ${formData.preferredTime}
📝 *ملاحظات:* ${formData.notes || 'لا توجد'}`;

    window.open(getWhatsAppUrl(teacherProfile.whatsapp, message), '_blank');
  };

  return (
    <div id="enrollment-form-view" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f0f7fc] dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full max-w-full bg-white/95 dark:bg-[#0b1326]/95 backdrop-blur-md border-b border-sky-100 dark:border-blue-900/40 px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 w-full">
          <button
            id="enroll-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 transition cursor-pointer shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>

          <div className="text-right min-w-0">
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">حجز جلسة ومتابعة مع</span>
            <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 truncate block">{teacherProfile.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-6">
        {submitted ? (
          <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 text-center shadow-xl shadow-sky-900/5 space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto border border-sky-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">تم استلام طلبكم بنجاح! 🎉</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
                شكراً لتواصلك يا <strong className="text-sky-700 font-bold">{formData.parentName}</strong>. لقد تم حفظ بيانات الطالب <strong className="text-sky-700 font-bold">{formData.studentName}</strong> في نظام المتابعة لدينا، وسيقوم {teacherProfile.name} بالتواصل معكم لتأكيد موعد جلسة التقييم وتزويدكم برمز دخول البوابة.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                id="submitted-whatsapp-confirm-btn"
                onClick={handleWhatsAppDirect}
                className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 hover:bg-emerald-700 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تأكيد الطلب عبر الواتساب فوراً</span>
              </button>

              <button
                id="submitted-back-login-btn"
                onClick={onNavigateToLogin}
                className="w-full py-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition"
              >
                الذهاب لصفحة تسجيل الدخول
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-sky-900/5 space-y-6">
            <div className="text-center space-y-1.5 border-b border-sky-100 pb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-[11px] font-bold border border-orange-200 mb-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span>انضمام طالب جديد</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">نموذج حجز جلسة تقييم ومتابعة</h1>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                يرجى تدوين البيانات بدقة لنتمكن من تخصيص خطة مناسبة لمستوى ابنكم وإرسال بيانات حسابه
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Parent Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم ولي الأمر الكريم <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    id="input-parent-name"
                    type="text"
                    required
                    placeholder="مثال: أ. أحمد علي أو د. منى عبد الرحمن"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Student Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم الطالب/ة <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="input-student-name"
                    type="text"
                    required
                    placeholder="اسم الابن أو الابنة"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    العمر أو المرحلة العمرية
                  </label>
                  <input
                    id="input-student-age"
                    type="text"
                    placeholder="مثال: 9 سنوات"
                    value={formData.studentAge}
                    onChange={(e) => setFormData({ ...formData, studentAge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم الهاتف (الواتساب للتواصل واستلام التقارير) <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    id="input-parent-phone"
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="+973 3XXXXXXX أو رقم الهاتف"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 text-right focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Subject Needed */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المجال أو المسار المطلوب
                </label>
                <select
                  id="select-subject"
                  value={formData.subjectNeeded}
                  onChange={(e) => setFormData({ ...formData, subjectNeeded: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                >
                  {teacherProfile.subjects.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                  <option value="تأهيل وتقييم شامل">تأهيل وتقييم شامل</option>
                </select>
              </div>

              {/* Preferred Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الفترة الزمنية المفضلة للجلسات
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['صباحاً (من 9 إلى 12 ظ)', 'عصراً (من 1 إلى 4 م)', 'مساءً (من 4 إلى 7 م)', 'أيام العطلات الأسبوعية'].map((timeOption) => (
                    <button
                      key={timeOption}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredTime: timeOption })}
                      className={`p-2.5 rounded-xl text-[11px] font-semibold text-center border transition ${
                        formData.preferredTime === timeOption
                          ? 'bg-sky-50 border-sky-500 text-sky-800 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {timeOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات إضافية أو تشخيص أو تطلعات تود مشاركتها
                </label>
                <textarea
                  id="textarea-notes"
                  rows={2}
                  placeholder="أي معلومات عن شخصية الطالب، الصعوبات، أو تطلعاتك من الجلسات..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 space-y-2.5">
                <button
                  id="submit-enroll-form-btn"
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white font-bold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition transform active:scale-95"
                >
                  <Send className="w-4 h-4 text-orange-200" />
                  <span>إرسال طلب الحجز وحفظه في النظام</span>
                </button>

                <button
                  id="direct-whatsapp-send-btn"
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>أو إرسال مباشر وسريع عبر الواتساب الآن</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
