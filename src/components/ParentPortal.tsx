import React, { useState } from 'react';
import { Student, SessionRecord, TimelineMilestone, TeacherProfile } from '../types';
import { 
  Award, TrendingUp, Calendar, Clock, Star, BookOpen, Send, Sparkles, 
  MessageCircle, LogOut, CheckCircle2, AlertCircle, FileText, ChevronDown, 
  CalendarClock, ShieldCheck, Heart, ArrowRight
} from 'lucide-react';
import { getWhatsAppUrl, formatDateArabic } from '../utils';

interface ParentPortalProps {
  student: Student;
  sessions: SessionRecord[];
  timelines: TimelineMilestone[];
  teacherProfile: TeacherProfile;
  onLogout: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  student,
  sessions,
  timelines,
  teacherProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'timeline'>('overview');

  // Filter sessions for this student ONLY (Strict Isolation)
  const studentSessions = sessions.filter((s) => s.studentId === student.id);
  const latestSession = studentSessions[0];
  const studentTimelines = timelines.filter((t) => t.studentId === student.id);

  // Compute stats
  const averageUnderstanding = studentSessions.length
    ? (studentSessions.reduce((acc, s) => acc + s.understandingScore, 0) / studentSessions.length).toFixed(1)
    : '5.0';

  const whatsappDirectTeacher = getWhatsAppUrl(
    teacherProfile.whatsapp,
    `السلام عليكم أستاذنا، أنا ${student.parentName} ولي أمر الطالب ${student.name}. أود الاستفسار عن سير الخطة التدريبية...`
  );

  return (
    <div id="parent-portal-view" className="min-h-screen bg-[#f0f7fc] text-slate-800 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-sky-500/20">
            {student.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm text-slate-900">{student.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200">
                {student.currentLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">أُفق • مرحباً بك يا {student.parentName} في بوابة المتابعة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappDirectTeacher}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">تواصل مع الأخصائي</span>
            <span className="sm:hidden">واتساب</span>
          </a>

          <button
            id="parent-logout-btn"
            onClick={onLogout}
            title="تسجيل الخروج"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Next Session Alert Banner */}
        {student.nextSessionDate && (
          <div className="bg-sky-50/70 border border-sky-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-800">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider block">
                  موعد الجلسة القادمة
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {student.nextSessionDate} • {student.nextSessionTime}
                </span>
              </div>
            </div>

            <a
              href={whatsappDirectTeacher}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200 transition shadow-2xs flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>تنسيق الموعد</span>
            </a>
          </div>
        )}

        {/* Navigation Tabs (Pill Bar for Mobile) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto">
          <button
            id="tab-parent-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظرة عامة ومستواه</span>
          </button>

          <button
            id="tab-parent-sessions"
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>سجل الجلسات ({studentSessions.length})</span>
          </button>

          <button
            id="tab-parent-timeline"
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>الخط الزمني للتطور</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & LATEST SESSION CAPSULE */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Student Progress Card */}
            <div className="bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">المسار التدريبي والتأهيلي</span>
                  <h2 className="text-base font-bold text-slate-900">{student.subject}</h2>
                </div>
                <div className="text-left">
                  <span className="text-xl font-black text-sky-700">{student.levelScore}%</span>
                  <span className="text-[10px] text-slate-400 font-bold block">معدل الإتقان</span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>إنجاز خطة الجلسات ({student.completedSessions} من {student.totalSessions} جلسة)</span>
                  <span className="text-sky-700 font-bold">
                    {student.totalSessions > 0 ? Math.round((student.completedSessions / student.totalSessions) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full transition-all duration-500"
                    style={{ width: `${student.totalSessions > 0 ? Math.min(100, (student.completedSessions / student.totalSessions) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-center">
                <div className="bg-sky-50/50 p-2.5 rounded-2xl border border-sky-100">
                  <span className="text-[10px] text-slate-500 font-bold block">متوسط الاستيعاب</span>
                  <span className="text-sm font-bold text-sky-700">⭐ {averageUnderstanding} / 5</span>
                </div>

                <div className="bg-orange-50/50 p-2.5 rounded-2xl border border-orange-100">
                  <span className="text-[10px] text-slate-500 font-bold block">الجلسات المتبقية</span>
                  <span className="text-sm font-bold text-orange-800">{student.remainingSessions} جلسات</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold block">تاريخ الانضمام</span>
                  <span className="text-xs font-semibold text-slate-700">{student.joinedAt}</span>
                </div>
              </div>
            </div>

            {/* Latest Session Capsule */}
            {latestSession ? (
              <div className="bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">تقرير الجلسة الأخيرة (#{latestSession.sessionNumber})</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{latestSession.date} • {latestSession.time}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
                    استيعاب {latestSession.understandingScore}/5 ⭐
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-1">موضوع الجلسة:</h4>
                  <p className="text-sm font-semibold text-slate-900">{latestSession.topic}</p>
                </div>

                {/* Activities trained */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-sky-800 block">
                    🎯 الأنشطة والمهارات التي تدرب عليها البطل في الجلسة:
                  </span>
                  <div className="space-y-1.5">
                    {latestSession.activities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                          {act.title}
                        </span>
                        <span className="text-sky-700 text-[11px] font-bold">
                          {act.status === 'mastered' ? 'أتقنها باقتدار ✨' : 'قيد التطبيق ⏳'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Next Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-sky-50/40 p-3.5 rounded-xl border border-sky-100">
                    <span className="font-bold text-slate-800 block mb-1">💪 نقاط القوة والتميز:</span>
                    <p className="text-slate-600 leading-relaxed font-medium">{latestSession.studentStrengths}</p>
                  </div>

                  <div className="bg-orange-50/40 p-3.5 rounded-xl border border-orange-100">
                    <span className="font-bold text-orange-800 block mb-1">🚀 ما سنركز عليه لاحقاً:</span>
                    <p className="text-slate-600 leading-relaxed font-medium">{latestSession.nextPlan}</p>
                  </div>
                </div>

                {/* Homework */}
                {latestSession.homeworkAssigned && (
                  <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200/80 text-xs">
                    <span className="font-bold text-orange-900 block mb-1">📝 التوجيه / النشاط المنزلي:</span>
                    <p className="text-slate-800 font-medium">{latestSession.homeworkAssigned}</p>
                  </div>
                )}

                {/* Teacher Note to Parent */}
                {latestSession.teacherNoteToParent && (
                  <div className="bg-sky-50/60 border border-sky-200/80 p-4 rounded-2xl text-slate-800 text-xs">
                    <span className="text-[11px] font-bold text-sky-800 block mb-1">💌 رسالة من الأخصائي إليكم:</span>
                    <p className="italic text-slate-700">"{latestSession.teacherNoteToParent}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-sky-100 rounded-3xl p-8 text-center text-xs text-slate-500">
                لم يتم تسجيل جلسات بعد
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FULL SESSIONS HISTORY */}
        {activeTab === 'sessions' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900">السجل الكامل لجميع الجلسات</h3>
            {studentSessions.length === 0 ? (
              <div className="bg-white border border-sky-100 rounded-3xl p-8 text-center text-xs text-slate-500">
                لا توجد جلسات مسجلة حتى الآن
              </div>
            ) : (
              studentSessions.map((ses) => (
                <div key={ses.id} className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold border border-sky-200">
                        جلسة #{ses.sessionNumber}
                      </span>
                      <span className="text-slate-500 font-medium">{ses.date} • {ses.time}</span>
                    </div>
                    <span className="font-bold text-sky-600">{'⭐'.repeat(ses.understandingScore)}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{ses.topic}</h4>

                  {/* Activities summary */}
                  <div className="flex flex-wrap gap-1.5">
                    {ses.activities.map((act) => (
                      <span key={act.id} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700">
                        • {act.title}
                      </span>
                    ))}
                  </div>

                  {ses.homeworkAssigned && (
                    <p className="text-slate-600 text-[11px] pt-2 border-t border-slate-100">
                      <strong className="text-slate-800">التوجيه المنزلي:</strong> {ses.homeworkAssigned}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: TIMELINE & MILESTONES */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900">الخط الزمني والمحطات التأهيلية الكبرى</h3>
            {studentTimelines.length === 0 ? (
              <div className="bg-white border border-sky-100 rounded-3xl p-8 text-center text-xs text-slate-500">
                سيتم إضافة المحطات التطويرية الكبرى فور إتمام التقييمات الدورية
              </div>
            ) : (
              <div className="relative border-r-2 border-sky-200 mr-3 pr-5 space-y-6">
                {studentTimelines.map((tml) => (
                  <div key={tml.id} className="relative">
                    <span className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-sky-500 ring-4 ring-white" />
                    <div className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-200">
                          {tml.levelBadge}
                        </span>
                        <span className="text-slate-400 font-medium text-[11px]">{tml.date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{tml.title}</h4>
                      <p className="text-slate-600 leading-relaxed font-medium">{tml.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

