import React, { useState } from 'react';
import { Student, SessionRecord, TimelineMilestone, ActivityItem } from '../types';
import { X, CheckCircle2, Clock, Star, Sparkles, BookOpen, User, Plus, Trash2, Calendar, Send, ShieldCheck, Award } from 'lucide-react';

interface SessionModalProps {
  students: Student[];
  preselectedStudentId?: string;
  onSaveSession: (session: Omit<SessionRecord, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  students,
  preselectedStudentId,
  onSaveSession,
  onClose,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudentId || (students[0]?.id ?? '')
  );

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('05:00 م');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [status, setStatus] = useState<'attended' | 'absent' | 'excused'>('attended');

  // 1. Pre-session
  const [preSessionNotes, setPreSessionNotes] = useState<string>('مراجعة الواجب السابق والتأكد من إتقان المفاهيم.');
  const [previousHomeworkStatus, setPreviousHomeworkStatus] = useState<'completed' | 'partial' | 'not_done' | 'not_assigned'>('completed');

  // 2. During session
  const [topic, setTopic] = useState<string>('');
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 'act-1', title: 'تهيئة ومراجعة سريعة', durationMinutes: 10, status: 'mastered', category: 'تهيئة' },
    { id: 'act-2', title: 'شرح وتطبيق عملي تفاعلي', durationMinutes: 35, status: 'mastered', category: 'تطبيق عملي' },
    { id: 'act-3', title: 'تحدي واختبار استيعاب ختامي', durationMinutes: 15, status: 'mastered', category: 'تقييم' }
  ]);
  const [newActivityTitle, setNewActivityTitle] = useState<string>('');
  const [newActivityMinutes, setNewActivityMinutes] = useState<number>(15);

  const [studentEngagementScore, setStudentEngagementScore] = useState<number>(5);

  // 3. Post session
  const [understandingScore, setUnderstandingScore] = useState<number>(5);
  const [studentStrengths, setStudentStrengths] = useState<string>('تركيز ممتاز، وسرعة بديهة في حل التمارين بمفرده.');
  const [areasToImprove, setAreasToImprove] = useState<string>('مزيد من الدقة وتنظيم خطوات الحل.');
  const [nextPlan, setNextPlan] = useState<string>('الانتقال للجزء المتقدم وتكثيف التطبيقات العملية.');
  const [homeworkAssigned, setHomeworkAssigned] = useState<string>('حل التمرين العملي 3 و 4 في ورقة التدريب.');
  const [teacherNoteToParent, setTeacherNoteToParent] = useState<string>('ما شاء الله، أداء رائع ومبشر اليوم، ونشكركم على حرصكم ومتابعتكم المستمرة.');

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleAddActivity = () => {
    if (!newActivityTitle.trim()) return;
    setActivities([
      ...activities,
      {
        id: `act-${Date.now()}`,
        title: newActivityTitle.trim(),
        durationMinutes: newActivityMinutes,
        status: 'mastered',
        category: 'تطبيق'
      }
    ]);
    setNewActivityTitle('');
  };

  const handleRemoveActivity = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const handleActivityStatusChange = (id: string, newStatus: 'mastered' | 'practicing' | 'needs_review') => {
    setActivities(activities.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    onSaveSession({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      sessionNumber: (selectedStudent.completedSessions || 0) + 1,
      date,
      time,
      durationMinutes,
      status,
      preSessionNotes,
      previousHomeworkStatus,
      topic: topic || `حصة تدريبية مخصصة - ${selectedStudent.subject}`,
      activities,
      studentEngagementScore,
      understandingScore,
      studentStrengths,
      areasToImprove,
      nextPlan,
      homeworkAssigned,
      teacherNoteToParent,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-sky-100 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold border border-sky-200">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">تسجيل جلسة تأهيلية وتدوين التقدم</h3>
              <p className="text-[11px] text-slate-500 font-medium">تدوين ما حدث قبل، أثناء، وبعد الجلسة لإرسال التقرير لولي الأمر</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-2 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeStep === 1
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>1. أساسيات وتجهيز</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeStep === 2
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>2. أثناء الجلسة والأنشطة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeStep === 3
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>3. التقييم والتقرير</span>
          </button>
        </div>

        {/* Form Body with Smooth Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* STEP 1: Student Selection & Pre-session */}
          {activeStep === 1 && (
            <div className="space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر الطالب / المستفيد <span className="text-orange-600">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-medium transition"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.subject}) - ولي الأمر: {s.parentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ الجلسة</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">وقت الجلسة</label>
                  <input
                    type="text"
                    value={time}
                    placeholder="مثال: 05:00 م"
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">المدة (بالدقائق)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة الحضور</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'attended', label: 'حضر وأتم الجلسة ✅' },
                    { val: 'absent', label: 'غائب ❌' },
                    { val: 'excused', label: 'اعتذار مسبق 🗓️' },
                  ].map((st) => (
                    <button
                      key={st.val}
                      type="button"
                      onClick={() => setStatus(st.val as any)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                        status === st.val
                          ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre-session Homework Status */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-sky-800 block">
                  📌 ما قبل الجلسة (متابعة التوجيهات والتكليفات السابقة)
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    حالة أداء النشاط أو التدريب المنزلي السابق:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { val: 'completed', label: 'أنجز بالكامل ⭐' },
                      { val: 'partial', label: 'أنجز جزئياً ⏳' },
                      { val: 'not_done', label: 'لم ينجز ❌' },
                      { val: 'not_assigned', label: 'لا يوجد تكليف' },
                    ].map((hw) => (
                      <button
                        key={hw.val}
                        type="button"
                        onClick={() => setPreviousHomeworkStatus(hw.val as any)}
                        className={`p-2 rounded-xl text-[11px] font-semibold border transition ${
                          previousHomeworkStatus === hw.val
                            ? 'bg-white border-sky-500 text-sky-800 shadow-2xs'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {hw.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ملاحظات التحضير والتجهيز لما قبل الجلسة:
                  </label>
                  <textarea
                    rows={2}
                    value={preSessionNotes}
                    onChange={(e) => setPreSessionNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
                    placeholder="ملاحظات حول استعداد الطالب أو ما تم مراجعته سريعاً..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: During-Session Activities */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عنوان وموضوع الجلسة الرئيسي <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: التدريب على التواصل البصري، تمييز الحروف، أو التفاعل الحركي"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              {/* Dynamic Activities List */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800">
                    🎯 الأنشطة والمهام التي تدرب عليها البطل في الجلسة:
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    الإجمالي: {activities.reduce((sum, a) => sum + a.durationMinutes, 0)} دقيقة
                  </span>
                </div>

                {/* List of current activities */}
                <div className="space-y-2">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        <span className="font-semibold text-slate-800">{act.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({act.durationMinutes} دقيقة)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={act.status}
                          onChange={(e) => handleActivityStatusChange(act.id, e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 font-medium"
                        >
                          <option value="mastered">أتقنه باقتدار 🌟</option>
                          <option value="practicing">قيد التدريب والتكرار ⏳</option>
                          <option value="needs_review">يحتاج مراجعة إضافية 🔍</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveActivity(act.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new activity quick input */}
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="إضافة نشاط / مهمة جديدة..."
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddActivity(); } }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={newActivityMinutes}
                    onChange={(e) => setNewActivityMinutes(Number(e.target.value))}
                    className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-center text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold rounded-xl transition"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* Engagement Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  حماس وتفاعل الطالب أثناء الجلسة (من 1 إلى 5):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStudentEngagementScore(star)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1 ${
                        studentEngagementScore >= star
                          ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${studentEngagementScore >= star ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Post-session & Parent Report */}
          {activeStep === 3 && (
            <div className="space-y-4">
              {/* Understanding Score */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مستوى استيعاب الطالب للهدف وتطبيقه العملي (من 1 إلى 5) <span className="text-orange-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUnderstandingScore(star)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1 ${
                        understandingScore >= star
                          ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${understandingScore >= star ? 'fill-sky-500 text-sky-500' : ''}`} />
                      <span>{star} / 5</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Strengths & Areas to Improve */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    💪 نقاط القوة والتميز اليوم
                  </label>
                  <textarea
                    rows={2}
                    value={studentStrengths}
                    onChange={(e) => setStudentStrengths(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    placeholder="ما أبدع فيه الطالب اليوم..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    🌱 ما سنركز على تطويره
                  </label>
                  <textarea
                    rows={2}
                    value={areasToImprove}
                    onChange={(e) => setAreasToImprove(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    placeholder="المهارات التي تحتاج لتكرار وتثبيت..."
                  />
                </div>
              </div>

              {/* Next Plan & Homework */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    🚀 خطة ما يجب تدريبه لاحقاً (الجلسة القادمة)
                  </label>
                  <textarea
                    rows={2}
                    value={nextPlan}
                    onChange={(e) => setNextPlan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    placeholder="الموضوع أو التدريب التالي..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    📝 التوجيه أو النشاط المنزلي المطلوب
                  </label>
                  <textarea
                    rows={2}
                    value={homeworkAssigned}
                    onChange={(e) => setHomeworkAssigned(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    placeholder="المهمة المنزلية المحددة..."
                  />
                </div>
              </div>

              {/* Note to Parent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  💌 رسالة وكلمة خاصة لولي الأمر
                </label>
                <textarea
                  rows={2}
                  value={teacherNoteToParent}
                  onChange={(e) => setTeacherNoteToParent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  placeholder="كلمة تشجيعية أو ملاحظة هامة لولي الأمر..."
                />
              </div>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                السابق
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold transition"
              >
                إلغاء
              </button>
            )}

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold shadow-xs transition"
              >
                التالي: {activeStep === 1 ? 'الأنشطة' : 'التقييم والتقرير'}
              </button>
            ) : (
              <button
                id="save-session-btn"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>حفظ الجلسة وتوليد التقرير</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
