import React, { useState } from 'react';
import { Student, SessionRecord, EnrollmentLead, TeacherProfile, TeacherCredentials } from '../types';
import { 
  Users, Calendar, Plus, Share2, BookOpen, Clock, Award, TrendingUp, 
  MessageCircle, Phone, Search, Filter, CheckCircle2, XCircle, Bell, 
  ChevronDown, LogOut, Check, Sparkles, ExternalLink, ShieldCheck, FileText,
  Copy, Key, User, Lock, Send, KeyRound, HeartPulse, MapPin, Baby
} from 'lucide-react';
import { getWhatsAppUrl, formatDateArabic } from '../utils';
import { AccountSettingsModal } from './AccountSettingsModal';
import { calculateAgeArabic } from '../studentOptions';

interface TeacherDashboardProps {
  profile: TeacherProfile;
  students: Student[];
  sessions: SessionRecord[];
  leads: EnrollmentLead[];
  teacherCredentials: TeacherCredentials;
  onUpdateCredentials: (creds: TeacherCredentials) => void;
  onOpenNewSession: (studentId?: string) => void;
  onOpenNewStudent: () => void;
  onEditStudent: (student: Student) => void;
  onShareSession: (session: SessionRecord, student: Student) => void;
  onAcceptLead: (lead: EnrollmentLead) => void;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  profile,
  students,
  sessions,
  leads,
  teacherCredentials,
  onUpdateCredentials,
  onOpenNewSession,
  onOpenNewStudent,
  onEditStudent,
  onShareSession,
  onAcceptLead,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'students' | 'leads'>('sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.studentName.includes(searchQuery) || s.topic.includes(searchQuery);
    const matchesStudent = selectedStudentFilter === 'all' || s.studentId === selectedStudentFilter;
    return matchesSearch && matchesStudent;
  });

  // Filtered Students
  const filteredStudents = students.filter((std) => 
    std.name.includes(searchQuery) || std.parentName.includes(searchQuery) || std.subject.includes(searchQuery)
  );

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;

  const handleCopyCredentials = (std: Student) => {
    const text = `مرحباً ${std.parentName}،\nبيانات دخولكم لمتابعة تقارير وجلسات الطالب (${std.name}) في منصة أُفق (Ofoq):\n• اسم المستخدم: ${std.parentUsername || std.parentPhone}\n• كلمة المرور: ${std.parentPassword || '123456'}\nرابط الدخول للمنصة:\n${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(std.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendCredentialsWhatsApp = (std: Student) => {
    const text = `مرحباً ${std.parentName}،\nبيانات دخولكم لمتابعة تقارير وجلسات الطالب (${std.name}) في منصة أُفق (Ofoq):\n• اسم المستخدم: ${std.parentUsername || std.parentPhone}\n• كلمة المرور: ${std.parentPassword || '123456'}\nرابط الدخول للمنصة:\n${window.location.origin}`;
    const url = getWhatsAppUrl(std.parentPhone, text);
    window.open(url, '_blank');
  };

  return (
    <div id="teacher-dashboard-view" className="min-h-screen bg-[#f0f7fc] text-slate-800 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-sky-500/20">
            أ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm text-slate-900">{profile.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                أُفق • لوحة الأخصائي
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">إدارة الجلسات والطلاب وحسابات أولياء الأمور</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="quick-add-session-top-btn"
            onClick={() => onOpenNewSession()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs shadow-sm shadow-sky-500/20 transition"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">تسجيل جلسة جديدة</span>
            <span className="sm:hidden">جلسة</span>
          </button>

          <button
            id="teacher-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="إعدادات الحساب وكلمة المرور وربط Google"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-200 text-xs font-bold transition shadow-2xs relative"
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">الإعدادات وكلمة المرور</span>
            <span className="sm:hidden">الإعدادات</span>
            {teacherCredentials.googleAccount?.linked && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white" title="حساب Google مربوط" />
            )}
          </button>

          <button
            id="teacher-logout-btn"
            onClick={onLogout}
            title="تسجيل الخروج"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* KPI Quick Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white border border-sky-100 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي الطلاب</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{students.length} <span className="text-xs font-normal text-slate-400">طالب</span></div>
          </div>

          <div className="bg-white border border-sky-100 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 block">الجلسات المنجزة</span>
            <div className="text-xl font-black text-sky-700 mt-0.5">{sessions.length} <span className="text-xs font-normal text-slate-400">جلسة</span></div>
          </div>

          <div 
            onClick={() => setActiveTab('leads')}
            className={`bg-white border rounded-2xl p-3.5 shadow-xs cursor-pointer transition ${
              newLeadsCount > 0 ? 'border-orange-300 bg-orange-50/50' : 'border-sky-100'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
              <span>طلبات تقييم جديدة</span>
              {newLeadsCount > 0 && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
            </span>
            <div className="text-xl font-black text-orange-700 mt-0.5">{newLeadsCount} <span className="text-xs font-normal text-slate-400">طلب</span></div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto">
          <button
            id="tab-teacher-sessions"
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>سجل الجلسات والتقارير ({sessions.length})</span>
          </button>

          <button
            id="tab-teacher-students"
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>قائمة الطلاب وحسابات الأسر ({students.length})</span>
          </button>

          <button
            id="tab-teacher-leads"
            onClick={() => setActiveTab('leads')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'leads'
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>طلبات الحجز ({leads.length})</span>
            {newLeadsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-400 text-white text-[10px] flex items-center justify-center font-bold">
                {newLeadsCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: SESSIONS RECORD & WHATSAPP SHARING */}
        {activeTab === 'sessions' && (
          <div className="space-y-3">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-2xl border border-sky-100 shadow-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث باسم الطالب أو موضوع الجلسة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
              >
                <option value="all">جميع الطلاب</option>
                {students.map((std) => (
                  <option key={std.id} value={std.id}>{std.name}</option>
                ))}
              </select>

              <button
                id="add-session-btn-filterbar"
                onClick={() => onOpenNewSession()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs shadow-sm shadow-sky-500/20 flex items-center justify-center gap-1.5 shrink-0 transition"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>تسجيل جلسة</span>
              </button>
            </div>

            {/* Sessions List */}
            {filteredSessions.length === 0 ? (
              <div className="bg-white border border-sky-100 rounded-3xl p-8 text-center space-y-3 shadow-xs">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">لا توجد جلسات مسجلة حالياً</p>
                <button
                  onClick={() => onOpenNewSession()}
                  className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition"
                >
                  تسجيل جلسة جديدة الآن
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => {
                  const student = students.find((s) => s.id === session.studentId);
                  return (
                    <div
                      key={session.id}
                      className="bg-white border border-sky-100 hover:border-sky-300 rounded-2xl p-4 sm:p-5 transition shadow-xs space-y-3"
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{session.studentName}</span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
                              جلسة #{session.sessionNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {session.date} • {session.time}
                            </span>
                          </div>
                          <h2 className="text-xs sm:text-sm font-semibold text-slate-800 mt-1.5">
                            {session.topic}
                          </h2>
                        </div>

                        {/* WhatsApp Report Share CTA Button */}
                        {student && (
                          <button
                            id={`share-report-btn-${session.id}`}
                            onClick={() => onShareSession(session, student)}
                            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-sky-500/20 shrink-0 transition transform active:scale-95"
                          >
                            <Share2 className="w-3.5 h-3.5 text-white" />
                            <span className="hidden sm:inline">تقرير ولي الأمر</span>
                            <span className="sm:hidden">إرسال</span>
                          </button>
                        )}
                      </div>

                      {/* Activities Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {session.activities.map((act) => (
                          <span
                            key={act.id}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                            {act.title}
                          </span>
                        ))}
                      </div>

                      {/* Summary Metrics & Plan */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100 text-[11px]">
                        <div className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                          <span className="text-slate-500 block text-[10px] font-bold">مستوى الاستيعاب والتجاوب</span>
                          <span className="font-bold text-sky-700">{'⭐'.repeat(session.understandingScore)} ({session.understandingScore}/5)</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-500 block text-[10px] font-bold">الهدف القادم</span>
                          <span className="text-slate-800 font-medium truncate block">{session.nextPlan || 'متابعة البرنامج الفردي'}</span>
                        </div>

                        <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-100">
                          <span className="text-orange-900 block text-[10px] font-bold">التوجيه المنزلي</span>
                          <span className="text-orange-900 font-medium truncate block">{session.homeworkAssigned || 'متابعة جدول الأنشطة'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENTS LIST & PARENT ACCOUNT MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-sky-100 shadow-xs">
              <div className="relative flex-1 w-full max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث عن طالب أو ولي أمر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <button
                id="add-student-btn-list"
                onClick={onOpenNewStudent}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs shadow-sm shadow-sky-500/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>إضافة طالب جديد</span>
              </button>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white border border-sky-100 rounded-3xl p-8 text-center space-y-3 shadow-xs">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">لا يوجد طلاب مسجلون حالياً</p>
                <button
                  onClick={onOpenNewStudent}
                  className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition"
                >
                  إضافة أول طالب وتوليد حساب ولي الأمر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredStudents.map((std) => (
                  <div
                    key={std.id}
                    className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{std.name}</h3>
                          <p className="text-xs text-slate-500">{std.grade} • {std.subject}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200">
                          {std.currentLevel}
                        </span>
                      </div>

                      {/* Clinical Badges & Info: Diagnosis, Age, Address */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {std.diagnosis && (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                            <HeartPulse className="w-3 h-3 text-rose-500" />
                            <span>{std.diagnosis}</span>
                          </span>
                        )}

                        {std.birthDate && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                            <Baby className="w-3 h-3 text-emerald-600" />
                            <span>{calculateAgeArabic(std.birthDate) || std.birthDate}</span>
                          </span>
                        )}

                        {std.address && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{std.address}</span>
                          </span>
                        )}
                      </div>

                      {/* Dedicated Parent Account Credentials Card */}
                      <div className="mt-3 p-3 bg-sky-50/40 rounded-xl border border-sky-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-700">
                          <span>ولي الأمر: <strong className="text-slate-900">{std.parentName}</strong></span>
                          <a
                            href={`https://wa.me/${std.parentPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{std.parentPhone}</span>
                          </a>
                        </div>

                        {/* Account Access Details */}
                        <div className="p-2 bg-white rounded-lg border border-sky-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              <User className="w-3 h-3 text-sky-600" />
                              <span>اسم المستخدم:</span>
                            </span>
                            <span className="font-mono font-bold text-sky-900 text-[11px]">
                              {std.parentUsername || std.parentPhone}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-orange-600" />
                              <span>كلمة المرور:</span>
                            </span>
                            <span className="font-mono font-bold text-orange-950 text-[11px]">
                              {std.parentPassword || '123456'}
                            </span>
                          </div>
                        </div>

                        {/* Quick Action to Share or Copy credentials */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(std)}
                            className="flex-1 py-1 px-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200 flex items-center justify-center gap-1 transition"
                          >
                            {copiedId === std.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                            <span>{copiedId === std.id ? 'تم النسخ' : 'نسخ الحساب'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendCredentialsWhatsApp(std)}
                            className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center justify-center gap-1 transition"
                          >
                            <Send className="w-3 h-3 text-emerald-600" />
                            <span>إرسال بالواتساب</span>
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>الجلسات المنجزة: {std.completedSessions} من {std.totalSessions}</span>
                          <span className="text-sky-700 font-bold">
                            {std.totalSessions > 0 ? Math.round((std.completedSessions / std.totalSessions) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full"
                            style={{ width: `${std.totalSessions > 0 ? Math.min(100, (std.completedSessions / std.totalSessions) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => onOpenNewSession(std.id)}
                        className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>تسجيل جلسة</span>
                      </button>

                      <button
                        onClick={() => onEditStudent(std)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
                      >
                        تعديل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ENROLLMENT LEADS / REQUESTS */}
        {activeTab === 'leads' && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">طلبات التقييم والانضمام الواردة</h3>
                <p className="text-xs text-slate-500 font-medium">يمكنك تحويل أي طلب إلى ملف طالب نشط وتوليد حسابه بضغطة واحدة</p>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="bg-white border border-sky-100 rounded-3xl p-8 text-center text-xs text-slate-500">
                لا توجد طلبات تقييم جديدة حالياً
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{lead.studentName} ({lead.studentAge})</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-900 text-[10px] font-bold border border-orange-200">
                          {lead.subjectNeeded}
                        </span>
                      </div>
                      <p className="text-slate-700">
                        ولي الأمر: <strong className="text-slate-900">{lead.parentName}</strong> • هاتف: <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">{lead.phone}</a>
                      </p>
                      <p className="text-slate-500 text-[11px]">الفترة المفضلة: {lead.preferredTime} {lead.notes && `• ملاحظات: ${lead.notes}`}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={getWhatsAppUrl(lead.phone, `مرحباً بك يا ${lead.parentName}، يسعدنا تواصلكم بخصوص تدريب الطالب ${lead.studentName}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>محادثة واتساب</span>
                      </a>

                      <button
                        onClick={() => onAcceptLead(lead)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 hover:from-sky-600 hover:to-sky-700 flex items-center gap-1.5 transition"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>قبول وتفعيل كطالب</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Settings Modal */}
      {isSettingsOpen && (
        <AccountSettingsModal
          currentCredentials={teacherCredentials}
          onSave={(creds) => {
            onUpdateCredentials(creds);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

