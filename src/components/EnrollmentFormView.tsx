import React, { useState } from 'react';
import { TeacherProfile, EnrollmentLead } from '../types';
import { 
  Send, MessageCircle, ArrowRight, CheckCircle2, Phone, User, 
  Sparkles, ShieldCheck, HeartPulse, Clock, Star, Award
} from 'lucide-react';
import { getWhatsAppUrl } from '../utils';
import { ThemeToggle } from './ThemeToggle';

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
    subjectNeeded: teacherProfile.subjects[0] || 'تأهيل تخاطب وتنمية لغوية',
    phone: '',
    preferredTime: 'مساءً (من 4 إلى 7 م)',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

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
    const message = `*طلب حجز واستفسار جديد من منصة أُفق:*
👤 *اسم ولي الأمر:* ${formData.parentName || 'غير محدد'}
👦 *اسم الطالب:* ${formData.studentName || 'غير محدد'}
🎂 *العمر / الصف:* ${formData.studentAge || 'غير محدد'}
📚 *المسار المطلوب:* ${formData.subjectNeeded}
📱 *رقم الهاتف للتواصل:* ${formData.phone || 'غير محدد'}
⏰ *الموعد المفضل:* ${formData.preferredTime}
📝 *ملاحظات:* ${formData.notes || 'لا توجد'}`;

    window.open(getWhatsAppUrl(teacherProfile.whatsapp, message), '_blank');
  };

  return (
    <div id="enrollment-form-view" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f0f7fc] dark:bg-[#060a12] text-slate-800 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full max-w-full bg-white/95 dark:bg-[#0b1326]/95 backdrop-blur-md border-b border-sky-100 dark:border-blue-900/40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 w-full">
          <button
            id="enroll-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 transition cursor-pointer shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>

          <div className="text-right min-w-0">
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate">حجز جلسة تقييم ومتابعة مع</span>
            <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 truncate block">{teacherProfile.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={onNavigateToLogin}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#152244] text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-blue-900/40 transition cursor-pointer"
            >
              <span>تسجيل الدخول</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Responsive 2-Column Desktop Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
        {submitted ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-6 sm:p-10 text-center shadow-xl shadow-blue-900/5 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">تم استلام طلبكم بنجاح! 🎉</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed font-medium">
                شكراً لتواصلك يا <strong className="text-blue-700 dark:text-blue-400 font-bold">{formData.parentName}</strong>. لقد تم حفظ بيانات الطالب <strong className="text-blue-700 dark:text-blue-400 font-bold">{formData.studentName}</strong> في نظام المتابعة السحابي لدينا، وسيقوم {teacherProfile.name} بالتواصل معكم لتأكيد موعد جلسة التقييم وتزويدكم برمز دخول البوابة لمتابعة تقارير ابنكم فوراً.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="submitted-whatsapp-confirm-btn"
                onClick={handleWhatsAppDirect}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 hover:bg-emerald-700 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تأكيد ومراسلة الأخصائي عبر الواتساب فوراً</span>
              </button>

              <button
                id="submitted-back-login-btn"
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-50 dark:bg-[#152244] hover:bg-blue-100 dark:hover:bg-[#1e2f5c] text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-bold border border-blue-200 dark:border-blue-800/40 transition cursor-pointer"
              >
                الذهاب لصفحة تسجيل الدخول
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* RIGHT COLUMN (DESKTOP): Reassurance, Benefits & Specialist Credentials */}
            <div className="lg:col-span-5 space-y-6">
              {/* Specialist Trust Card */}
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-sky-100 dark:border-blue-900/40 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/20 shrink-0">
                    أ
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-base text-slate-900 dark:text-white">{teacherProfile.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800/40">
                        أخصائي معتمد
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">{teacherProfile.title}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {teacherProfile.bio}
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-blue-900/30">
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100/60 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">الخبرة العملية</span>
                    <span className="text-sm font-black text-blue-700 dark:text-blue-300">+{teacherProfile.experienceYears} سنوات</span>
                  </div>
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100/60 dark:border-emerald-900/40">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">تقارير الجلسات</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">فورية لولي الأمر</span>
                  </div>
                </div>
              </div>

              {/* What Happens Next Card */}
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-sky-100 dark:border-blue-900/40 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>ماذا يحدث بعد إرسال الطلب؟</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block">دراسة مبدئية لبيانات الطفل</strong>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">يقوم الأخصائي بمراجعة بيانات الحالة والتشخيص لتجهيز خطة الجلسة الأولى.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block">تواصل وتأكيد الموعد عبر الواتساب</strong>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">يتم التواصل مع ولي الأمر هاتفياً أو عبر الواتساب لتأكيد الموعد الأنسب.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block">تفعيل حساب ولي الأمر بالبوابة</strong>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">استلام اسم مستخدم وكلمة مرور سرية لمتابعة تقارير ابنكم فور انتهاء كل جلسة.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LEFT COLUMN (DESKTOP): The Enrollment Form */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 space-y-6">
              <div className="space-y-1.5 border-b border-slate-100 dark:border-blue-900/30 pb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800/40 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>انضمام مستفيد جديد وحجز تقييم</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">نموذج حجز جلسة تقييم ومتابعة</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  يرجى تدوين البيانات بدقة لنتمكن من تخصيص خطة مناسبة لمستوى ابنكم وإرسال بيانات حسابه
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Parent Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم ولي الأمر الكريم <span className="text-orange-600 dark:text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                    <input
                      id="input-parent-name"
                      type="text"
                      required
                      placeholder="مثال: أ. أحمد علي أو د. منى عبد الرحمن"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-10 pl-3.5 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                    />
                  </div>
                </div>

                {/* Student Name & Age in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      اسم الطالب/ة <span className="text-orange-600 dark:text-orange-400">*</span>
                    </label>
                    <input
                      id="input-student-name"
                      type="text"
                      required
                      placeholder="اسم الابن أو الابنة"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      العمر أو المرحلة العمرية
                    </label>
                    <input
                      id="input-student-age"
                      type="text"
                      placeholder="مثال: 5 سنوات و 3 أشهر"
                      value={formData.studentAge}
                      onChange={(e) => setFormData({ ...formData, studentAge: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    رقم الهاتف (الواتساب للتواصل واستلام التقارير) <span className="text-orange-600 dark:text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                    <input
                      id="input-parent-phone"
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="+973 3XXXXXXX أو رقم الهاتف"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-10 pl-3.5 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-right focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                    />
                  </div>
                </div>

                {/* Subject Needed */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    المجال أو المسار التأهيلي المطلوب
                  </label>
                  <select
                    id="select-subject"
                    value={formData.subjectNeeded}
                    onChange={(e) => setFormData({ ...formData, subjectNeeded: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition cursor-pointer"
                  >
                    {teacherProfile.subjects.map((sub, idx) => (
                      <option key={idx} value={sub} className="dark:bg-[#0b1326]">{sub}</option>
                    ))}
                    <option value="تأهيل وتقييم شامل" className="dark:bg-[#0b1326]">تأهيل وتقييم شامل</option>
                  </select>
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الفترة الزمنية المفضلة للجلسات
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {['صباحاً (من 9 إلى 12 ظ)', 'عصراً (من 1 إلى 4 م)', 'مساءً (من 4 إلى 7 م)', 'أيام العطلات الأسبوعية'].map((timeOption) => (
                      <button
                        key={timeOption}
                        type="button"
                        onClick={() => setFormData({ ...formData, preferredTime: timeOption })}
                        className={`p-2.5 sm:p-3 rounded-xl text-[11px] sm:text-xs font-semibold text-center border transition cursor-pointer ${
                          formData.preferredTime === timeOption
                            ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-800 dark:text-blue-300 font-bold shadow-2xs'
                            : 'bg-slate-50 dark:bg-[#080d1a] border-slate-200 dark:border-blue-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {timeOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ملاحظات إضافية أو تشخيص أو تطلعات تود مشاركتها
                  </label>
                  <textarea
                    id="textarea-notes"
                    rows={2}
                    placeholder="أي معلومات عن شخصية الطالب، الصعوبات، أو تطلعاتك من الجلسات..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 space-y-3">
                  <button
                    id="submit-enroll-form-btn"
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-blue-200" />
                    <span>إرسال طلب الحجز وحفظه في النظام</span>
                  </button>

                  <button
                    id="direct-whatsapp-send-btn"
                    type="button"
                    onClick={handleWhatsAppDirect}
                    className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>أو إرسال مباشر وسريع عبر الواتساب الآن</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
