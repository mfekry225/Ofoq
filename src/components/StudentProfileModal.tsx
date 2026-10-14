import React, { useState } from 'react';
import { Student, SessionRecord, TimelineMilestone, TeacherProfile, CompletedAssessmentRecord } from '../types';
import { 
  X, User, Calendar, MapPin, Baby, HeartPulse, Phone, Lock, 
  Copy, Check, FileText, Plus, Edit3, MessageCircle, 
  Sparkles, Award, ArrowRight, Printer, AlertTriangle, AlertCircle, 
  CheckCircle2, Clock, ChevronDown, ChevronUp, Share2, Trash2
} from 'lucide-react';
import { calculateAgeArabic } from '../studentOptions';
import { getWhatsAppUrl, formatDateArabic } from '../utils';

interface StudentProfileModalProps {
  student: Student;
  sessions: SessionRecord[];
  timelines: TimelineMilestone[];
  assessments: CompletedAssessmentRecord[];
  teacherProfile: TeacherProfile;
  onClose: () => void;
  onOpenNewSession: (studentId: string) => void;
  onStartAssessment: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  sessions,
  timelines,
  assessments,
  teacherProfile,
  onClose,
  onOpenNewSession,
  onStartAssessment,
  onEditStudent,
  onDeleteStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'sessions' | 'timeline'>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);

  // Filter student-specific records
  const studentSessions = sessions
    .filter((s) => s.studentId === student.id)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const studentTimelines = timelines
    .filter((t) => t.studentId === student.id)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Merge direct student.assessments and global assessments matching studentId or childName
  const studentAssessments = (() => {
    const list: CompletedAssessmentRecord[] = [];
    const seen = new Set<string>();

    if (student.assessments && Array.isArray(student.assessments)) {
      student.assessments.forEach((a) => {
        if (!seen.has(a.id)) {
          seen.add(a.id);
          list.push(a);
        }
      });
    }

    assessments.forEach((a) => {
      const isMatch = a.studentId === student.id || (a.childName && a.childName.trim().toLowerCase() === student.name.trim().toLowerCase());
      if (isMatch && !seen.has(a.id)) {
        seen.add(a.id);
        list.push(a);
      }
    });

    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  })();

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const parentPassword = student.parentPassword || (student.parentAccessCode ? `OFQ-${student.parentAccessCode}` : `OFQ${student.id.slice(-4)}`);
  const parentUsername = student.parentUsername || student.parentPhone;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-sky-100 dark:border-blue-900/50 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* TOP MODAL HEADER */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 p-5 sm:p-6 text-white shrink-0">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer backdrop-blur-xs"
            title="إغلاق الملف"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-inner border border-white/30 shrink-0">
                {student.name.slice(0, 1)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black">{student.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
                    {student.currentLevel || 'المستوى التأسيسي'}
                  </span>
                  {studentAssessments.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/90 text-slate-900 text-[11px] font-black flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3 text-slate-900" />
                      <span>{studentAssessments.length} تقييم مسجل</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-2 flex-wrap">
                  <span>{student.grade}</span>
                  <span>•</span>
                  <span>{student.subject}</span>
                  {student.birthDate && (
                    <>
                      <span>•</span>
                      <span>{calculateAgeArabic(student.birthDate) || student.birthDate}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons in Header */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewSession(student.id);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>جلسة جديدة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartAssessment(student);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 backdrop-blur-xs transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>إجراء مقياس</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditStudent(student);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="تعديل بيانات الطالب"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs navigation */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/20 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              الملف والبيانات الأساسية
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assessments')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'assessments'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>المقاييس والتقييمات</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'assessments' ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white'
              }`}>
                {studentAssessments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'sessions'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>الجلسات العلاجية</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'sessions' ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white'
              }`}>
                {studentSessions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>المحطات والإنجازات</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'timeline' ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white'
              }`}>
                {studentTimelines.length}
              </span>
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-100 flex-1">
          {/* TAB 1: OVERVIEW & CLINICAL INFO */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Clinical & Diagnosis Card */}
              <div className="bg-slate-50 dark:bg-[#080d1a] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span>التشخيص والحالة التأهيلية</span>
                  </h3>
                  {student.diagnosis && (
                    <span className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900/50">
                      {student.diagnosis}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-blue-900/40 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium block">المسار التأهيلي</span>
                    <strong className="text-xs text-slate-900 dark:text-white">{student.subject}</strong>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-blue-900/40 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium block">تاريخ الميلاد والعمر</span>
                    <strong className="text-xs text-slate-900 dark:text-white">
                      {student.birthDate ? `${calculateAgeArabic(student.birthDate)} (${student.birthDate})` : student.grade}
                    </strong>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-blue-900/40 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium block">العنوان السكني</span>
                    <strong className="text-xs text-slate-900 dark:text-white truncate block">
                      {student.address || 'غير محدد'}
                    </strong>
                  </div>
                </div>

                {student.notes && (
                  <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-blue-900/40 space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold block">ملاحظات الأخصائي الفردية:</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {student.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress & Sessions Status */}
              <div className="bg-slate-50 dark:bg-[#080d1a] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>موقف الجلسات المعتمدة</span>
                  </h3>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    {student.completedSessions} من {student.totalSessions} جلسة ({student.totalSessions > 0 ? Math.round((student.completedSessions / student.totalSessions) * 100) : 0}%)
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${student.totalSessions > 0 ? Math.min(100, (student.completedSessions / student.totalSessions) * 100) : 0}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-400 font-bold block">الجلسات المنجزة</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{student.completedSessions}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-400 font-bold block">الجلسات المتبقية</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">{student.remainingSessions ?? Math.max(0, student.totalSessions - student.completedSessions)}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-400 font-bold block">إجمالي الباقة</span>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">{student.totalSessions}</span>
                  </div>
                </div>
              </div>

              {/* Guardian Contact & Portal Account Credentials */}
              <div className="bg-blue-50/50 dark:bg-[#0b1326] rounded-2xl p-4 sm:p-5 border border-blue-200 dark:border-blue-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>بيانات ولي الأمر وحساب بوابة المتابعة</span>
                  </h3>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    {student.parentName}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white dark:bg-[#080d1a] rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">هاتف الأب / الأساسي</span>
                      <strong className="text-xs text-slate-900 dark:text-white">{student.parentPhone}</strong>
                    </div>
                    <a
                      href={`https://wa.me/${student.parentPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>واتساب</span>
                    </a>
                  </div>

                  {student.motherPhone && (
                    <div className="p-3 bg-white dark:bg-[#080d1a] rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">هاتف الأم</span>
                        <strong className="text-xs text-slate-900 dark:text-white">{student.motherPhone}</strong>
                      </div>
                      <a
                        href={`https://wa.me/${student.motherPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>واتساب</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Login Credentials Box */}
                <div className="p-3.5 bg-white dark:bg-[#080d1a] rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">بيانات دخول ولي الأمر للمنصة:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`بيانات دخول بوابة متابعة الطالب (${student.name}):\nاسم المستخدم: ${parentUsername}\nكلمة المرور: ${parentPassword}\nالرابط: ${window.location.origin}`, 'all')}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'all' ? 'تم نسخ الرسالة!' : 'نسخ الرسالة كاملة لولي الأمر'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/30">
                      <span className="text-slate-500 text-[11px]">اسم المستخدم:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-blue-900 dark:text-blue-300">
                        <span>{parentUsername}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(parentUsername, 'u')}
                          className="text-slate-400 hover:text-blue-600"
                          title="نسخ"
                        >
                          {copiedField === 'u' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/30">
                      <span className="text-slate-500 text-[11px]">كلمة المرور:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-amber-700 dark:text-amber-300">
                        <span>{parentPassword}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(parentPassword, 'p')}
                          className="text-slate-400 hover:text-amber-600"
                          title="نسخ"
                        >
                          {copiedField === 'p' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSESSMENTS LIST */}
          {activeTab === 'assessments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>سجل المقاييس والتقييمات المقننة ({studentAssessments.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    نتائج المقاييس الـ 10 بنود التي أجراها الأخصائي أو ولي الأمر عبر المنصة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartAssessment(student);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إجراء مقياس للطفل</span>
                </button>
              </div>

              {studentAssessments.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 rounded-2xl p-8 text-center space-y-3">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">لا توجد تقييمات مسجلة بعد لهذا الطالب</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    يمكنك كأخصائي تطبيق أي مقياس من المقاييس المعتمدة (لغوي، توحد، صعوبات نمائية، طلاقة كلام) وتسجيله مباشرة في ملف الطالب.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartAssessment(student);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>بدء المقياس التقييمي الأول</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentAssessments.map((rec) => {
                    const isExpanded = expandedAssessmentId === rec.id;
                    return (
                      <div
                        key={rec.id}
                        className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                {rec.scaleTitle}
                              </h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                rec.riskLevel === 'low'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                                  : rec.riskLevel === 'moderate'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200'
                              }`}>
                                {rec.riskLabel || (rec.riskLevel === 'low' ? 'مؤشرات منخفضة' : rec.riskLevel === 'moderate' ? 'مؤشرات متوسطة' : 'مؤشرات مرتفعة')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              تاريخ الإجراء: <strong className="text-slate-600 dark:text-slate-300">{rec.date}</strong> {rec.evaluatorName ? `• المُقيّم: ${rec.evaluatorName}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/50 text-xs font-black text-purple-700 dark:text-purple-300 tabular-nums">
                              الدرجة: {rec.totalScore} / 20
                            </div>

                            <button
                              type="button"
                              onClick={() => setExpandedAssessmentId(isExpanded ? null : rec.id)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition cursor-pointer text-xs font-bold flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Summary */}
                        {rec.summary && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-blue-900/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {rec.summary}
                          </div>
                        )}

                        {/* Recommendations */}
                        {rec.advice && rec.advice.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">
                              توصيات الخطة العلاجية والمنزلية:
                            </span>
                            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                              {rec.advice.map((adv, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-blue-500 font-bold shrink-0">•</span>
                                  <span>{adv}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Expanded Question Scores */}
                        {isExpanded && rec.scores && (
                          <div className="pt-3 border-t border-slate-100 dark:border-blue-900/30 space-y-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                              تفاصيل درجات البنود الـ 10:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                              {Object.entries(rec.scores).map(([qId, val]) => (
                                <div key={qId} className="p-2 rounded-lg bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/30 text-center">
                                  <span className="text-[10px] text-slate-400 block">بند {qId}</span>
                                  <strong className={`text-xs ${Number(val) === 2 ? 'text-rose-600' : Number(val) === 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {Number(val) === 2 ? 'نعم (2)' : Number(val) === 1 ? 'أحياناً (1)' : 'لا (0)'}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SESSIONS HISTORY */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>سجل الجلسات التأهيلية المنفذة ({studentSessions.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تقارير وملاحظات الحصص التدريبية المسجلة للطالب.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewSession(student.id);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسجيل جلسة جديدة</span>
                </button>
              </div>

              {studentSessions.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 rounded-2xl p-8 text-center space-y-3">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">لا توجد جلسات مسجلة بعد لهذا الطالب</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    قم بتوثيق الجلسة الأولى لتتبع أداء الطالب وتزويد ولي الأمر بتقرير الإنجاز الفوري عبر الواتساب.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewSession(student.id);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل أول جلسة الآن</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentSessions.map((ses) => (
                    <div
                      key={ses.id}
                      className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">{ses.date}</span>
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{ses.topic}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-900/50">
                            استيعاب: {ses.understandingScore} / 5 ⭐
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-blue-900/30 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">ملاحظات الأخصائي ومستوى الاستجابة:</span>
                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{ses.teacherNotes || 'لا توجد ملاحظات إضافية'}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-blue-900/30 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">التوجيهات المنزلية الموصى بها للأسرة:</span>
                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{ses.homework || 'الاستمرار في التدريبات المعطاة'}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">توثيق مباشر عبر المنصة</span>
                        <a
                          href={`https://wa.me/${student.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `تقرير جلسة تخاطب وتأهيل (${student.name})\nالتاريخ: ${ses.date}\nموضوع الجلسة: ${ses.topic}\nدرجة الاستيعاب: ${ses.understandingScore}/5\nالملاحظات: ${ses.teacherNotes}\nالمطلوب من الأسرة: ${ses.homework}\nالأخصائي: ${teacherProfile.name}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>إرسال التقرير لولي الأمر واتساب</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TIMELINE & MILESTONES */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>لوحة المحطات والإنجازات ({studentTimelines.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  المراحل التطورية والأوسمة التي حققها الطالب خلال مساره التأهيلي.
                </p>
              </div>

              {studentTimelines.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 rounded-2xl p-8 text-center space-y-2">
                  <Award className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">لا توجد أوسمة أو محطات مضافة للطالب بعد.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentTimelines.map((tml) => (
                    <div
                      key={tml.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 flex items-start gap-3.5 shadow-xs"
                    >
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/30">
                            {tml.levelBadge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{tml.date}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{tml.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{tml.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#0b1326] border-t border-slate-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>تاريخ الانضمام: <strong>{student.joinedAt || 'بداية العام'}</strong></span>
            <span>•</span>
            <span>الأخصائي المشرف: <strong>{teacherProfile.name}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onDeleteStudent && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف ملف الطالب (${student.name}) نهائياً؟`)) {
                    onClose();
                    onDeleteStudent(student.id);
                  }
                }}
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold transition cursor-pointer"
                title="حذف ملف الطالب"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-[#152244] hover:bg-slate-300 dark:hover:bg-[#1e2f5c] text-slate-800 dark:text-slate-100 text-xs font-bold transition cursor-pointer"
            >
              إغلاق الملف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
