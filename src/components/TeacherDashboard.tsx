import React, { useState } from 'react';
import { Student, SessionRecord, EnrollmentLead, TeacherProfile, TeacherCredentials } from '../types';
import { 
  Users, Calendar, Plus, Share2, BookOpen, Clock, Award, TrendingUp, 
  MessageCircle, Phone, Search, Filter, CheckCircle2, XCircle, Bell, 
  ChevronDown, LogOut, Check, Sparkles, ExternalLink, ShieldCheck, FileText,
  Copy, Key, User, Lock, Send, KeyRound, HeartPulse, MapPin, Baby, Cloud, CloudCheck,
  RefreshCw, Trash2
} from 'lucide-react';
import { getWhatsAppUrl, formatDateArabic } from '../utils';
import { AccountSettingsModal } from './AccountSettingsModal';
import { calculateAgeArabic } from '../studentOptions';
import { CloudSyncStatus, cloudAuth, cloudService } from '../cloudFirestore';
import { ThemeToggle } from './ThemeToggle';
import { AssessmentScreeningView } from './AssessmentScreeningView';

interface TeacherDashboardProps {
  profile: TeacherProfile;
  students: Student[];
  sessions: SessionRecord[];
  leads: EnrollmentLead[];
  teacherCredentials: TeacherCredentials;
  cloudSyncStatus?: CloudSyncStatus;
  cloudStatusMessage?: string;
  onForceSync?: () => Promise<{ success: boolean; count: number; error?: string } | boolean>;
  onUpdateCredentials: (creds: TeacherCredentials) => void;
  onOpenNewSession: (studentId?: string) => void;
  onOpenNewStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
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
  cloudSyncStatus = 'synced',
  cloudStatusMessage,
  onForceSync,
  onUpdateCredentials,
  onOpenNewSession,
  onOpenNewStudent,
  onEditStudent,
  onDeleteStudent,
  onShareSession,
  onAcceptLead,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'students' | 'leads' | 'assessments'>('sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

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
    <div id="teacher-dashboard-view" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f0f7fc] dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full max-w-full bg-white/95 dark:bg-[#0b1326]/95 backdrop-blur-md border-b border-sky-100 dark:border-blue-900/40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 w-full">
          {/* Brand & Teacher Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-initial">
            <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-base sm:text-xl shadow-sm shadow-blue-600/20">
              أ
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[280px]">
                  {profile.name}
                </h1>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-[9px] sm:text-[11px] font-bold shrink-0">
                  الأخصائي
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
                إدارة الجلسات والطلاب وحسابات أولياء الأمور
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Cloud Firestore Status Badge */}
            <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/40 text-[10px] sm:text-[11px] font-bold">
              {cloudSyncStatus === 'synced' ? (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400" title="قاعدة بيانات Firestore متصلة ومحمية">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline">سحابي متصل</span>
                </span>
              ) : cloudSyncStatus === 'syncing' || isSyncingNow ? (
                <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                  <RefreshCw className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="hidden md:inline">مزامنة...</span>
                </span>
              ) : cloudSyncStatus === 'connecting' ? (
                <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                  <RefreshCw className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="hidden md:inline">اتصال...</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    if (onForceSync) {
                      setIsSyncingNow(true);
                      setSyncFeedback('جاري إعادة الاتصال والمزامنة مع Firestore...');
                      const res = await onForceSync();
                      setIsSyncingNow(false);
                      const isOk = typeof res === 'boolean' ? res : res.success;
                      const count = typeof res === 'object' && res.count ? ` (${res.count} عنصر)` : '';
                      const errorMsg = typeof res === 'object' && res.error ? res.error : 'البيانات محفوظة محلياً';
                      setSyncFeedback(isOk ? `تم الاتصال وحفظ البيانات سحابياً بنجاح${count} ✅` : errorMsg);
                      setTimeout(() => setSyncFeedback(null), 4000);
                    }
                  }}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                  title="انقر للمزامنة الفورية مع السحابة"
                >
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline">مزامنة السحابة</span>
                </button>
              )}

              {onForceSync && (
                <button
                  type="button"
                  onClick={async () => {
                    if (isSyncingNow) return;
                    setIsSyncingNow(true);
                    setSyncFeedback('جاري نسخ البيانات سحابياً إلى Firestore...');
                    const res = await onForceSync();
                    setIsSyncingNow(false);
                    const isOk = typeof res === 'boolean' ? res : res.success;
                    const count = typeof res === 'object' && res.count ? ` (${res.count} عنصر)` : '';
                    const errorMsg = typeof res === 'object' && res.error ? res.error : 'تعذر الاتصال بالسحابة، البيانات محفوظة محلياً';
                    setSyncFeedback(isOk ? `تمت المزامنة السحابية وتأمين البيانات بنجاح${count} ✅` : errorMsg);
                    setTimeout(() => setSyncFeedback(null), 4000);
                  }}
                  disabled={isSyncingNow}
                  title="مزامنة فورية مع قاعدة بيانات Firestore"
                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-[#152244] rounded text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingNow ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
                </button>
              )}
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle size="sm" />

            {/* Add Session Button */}
            <button
              id="quick-add-session-top-btn"
              onClick={() => onOpenNewSession()}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition cursor-pointer"
              title="تسجيل جلسة جديدة"
            >
              <Plus className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="hidden sm:inline">جلسة جديدة</span>
            </button>

            {/* Account Settings Button */}
            <button
              id="teacher-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              title="إعدادات الحساب وكلمة المرور وقاعدة البيانات"
              className="p-2 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-blue-50 dark:hover:bg-[#152244] text-slate-700 dark:text-slate-200 hover:text-blue-800 dark:hover:text-blue-300 border border-slate-200 dark:border-blue-900/40 text-xs font-bold transition shadow-2xs relative"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {teacherCredentials.googleAccount?.linked && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-[#0f172a]" title="حساب Google مربوط" />
              )}
            </button>

            {/* Logout Button */}
            <button
              id="teacher-logout-btn"
              onClick={onLogout}
              title="تسجيل الخروج"
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#0f172a] hover:bg-slate-200 dark:hover:bg-[#152244] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-blue-900/40 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="bg-blue-600 text-white text-xs font-bold px-4 py-2 text-center animate-in slide-in-from-top duration-200 flex items-center justify-center gap-2">
          <Cloud className="w-4 h-4 text-blue-200" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 space-y-6 w-full">
        {/* Firestore Direct Connection Alert if not authenticated with Google */}
        {!cloudAuth.getCurrentUser() && (
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  تأمين وحفظ البيانات في قاعدة Firestore السحابية
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 block truncate">
                  قم بتسجيل الدخول بحساب Google المعتمد (mfekry225@gmail.com) لتفعيل الحفظ السحابي التلقائي
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setIsSyncingNow(true);
                setSyncFeedback('جاري فتح نافذة تسجيل الدخول بحساب Google...');
                const res = await cloudAuth.loginWithGoogle();
                if (res.success && res.user) {
                  setSyncFeedback('تمت المصادقة بنجاح! جاري رفع البيانات إلى Firestore...');
                  const syncRes = await cloudService.backupAllToCloud();
                  setSyncFeedback(syncRes.success ? `تم الاتصال وحفظ ${syncRes.count} سجلاً في Firestore بنجاح ✅` : syncRes.error || 'تم الربط بنجاح');
                } else {
                  setSyncFeedback(res.error || 'تم إلغاء تسجيل الدخول');
                }
                setIsSyncingNow(false);
                setTimeout(() => setSyncFeedback(null), 5000);
              }}
              disabled={isSyncingNow}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shrink-0 transition flex items-center gap-2 shadow-sm shadow-blue-600/20 active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z"/>
                <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>ربط ومزامنة Firestore الآن</span>
            </button>
          </div>
        )}

        {/* KPI Quick Stats - Responsive 4 Column Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-2xl p-3.5 sm:p-5 shadow-xs transition-colors min-w-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block truncate">إجمالي الطلاب المقيدين</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{students.length} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">طالب</span></div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-2xl p-3.5 sm:p-5 shadow-xs transition-colors min-w-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block truncate">الجلسات المنجزة</span>
            <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{sessions.length} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">جلسة مسجلة</span></div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-2xl p-3.5 sm:p-5 shadow-xs transition-colors min-w-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block truncate">متوسط الاستيعاب</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {sessions.length > 0 
                ? (sessions.reduce((acc, s) => acc + (s.understandingScore || 0), 0) / sessions.length).toFixed(1) 
                : '5.0'} 
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500"> / 5.0</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('leads')}
            className={`bg-white dark:bg-[#0f172a] border rounded-2xl p-3.5 sm:p-5 shadow-xs cursor-pointer transition-colors min-w-0 ${
              newLeadsCount > 0 ? 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20' : 'border-sky-100 dark:border-blue-900/40'
            }`}
          >
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between truncate">
              <span className="truncate">طلبات جديدة واردة</span>
              {newLeadsCount > 0 && <span className="w-2 h-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />}
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{newLeadsCount} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">طلب تقييم</span></div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100/80 dark:bg-[#0b1326] rounded-2xl border border-slate-200/70 dark:border-blue-900/40 overflow-x-auto no-scrollbar w-full">
          <button
            id="tab-teacher-sessions"
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'sessions'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#152244]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>الجلسات ({sessions.length})</span>
          </button>

          <button
            id="tab-teacher-students"
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#152244]'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>الطلاب ({students.length})</span>
          </button>

          <button
            id="tab-teacher-leads"
            onClick={() => setActiveTab('leads')}
            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#152244]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>الطلبات ({leads.length})</span>
            {newLeadsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] sm:text-[10px] flex items-center justify-center font-bold">
                {newLeadsCount}
              </span>
            )}
          </button>

          <button
            id="tab-teacher-assessments"
            onClick={() => setActiveTab('assessments')}
            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'assessments'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#152244]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>المقاييس (10 بنود)</span>
          </button>
        </div>

        {/* TAB 1: SESSIONS RECORD & WHATSAPP SHARING */}
        {activeTab === 'sessions' && (
          <div className="space-y-3">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white dark:bg-[#0f172a] p-2.5 rounded-2xl border border-sky-100 dark:border-blue-900/40 shadow-xs transition-colors">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث باسم الطالب أو موضوع الجلسة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326]"
                />
              </div>

              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326]"
              >
                <option value="all">جميع الطلاب</option>
                {students.map((std) => (
                  <option key={std.id} value={std.id}>{std.name}</option>
                ))}
              </select>

              <button
                id="add-session-btn-filterbar"
                onClick={() => onOpenNewSession()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>تسجيل جلسة</span>
              </button>
            </div>

            {/* Sessions List */}
            {filteredSessions.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-xs transition-colors">
                <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">لا توجد جلسات مسجلة حالياً</p>
                <button
                  onClick={() => onOpenNewSession()}
                  className="px-5 py-2.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  تسجيل جلسة جديدة الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {filteredSessions.map((session) => {
                  const student = students.find((s) => s.id === session.studentId);
                  return (
                    <div
                      key={session.id}
                      className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-4 sm:p-5 transition shadow-xs space-y-3"
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{session.studentName}</span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800/40">
                              جلسة #{session.sessionNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              {session.date} • {session.time}
                            </span>
                          </div>
                          <h2 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                            {session.topic}
                          </h2>
                        </div>

                        {/* WhatsApp Report Share CTA Button */}
                        {student && (
                          <button
                            id={`share-report-btn-${session.id}`}
                            onClick={() => onShareSession(session, student)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20 shrink-0 transition transform active:scale-95 cursor-pointer"
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
                            className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                            {act.title}
                          </span>
                        ))}
                      </div>

                      {/* Summary Metrics & Plan */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-blue-900/30 text-[11px]">
                        <div className="bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold">مستوى الاستيعاب والتجاوب</span>
                          <span className="font-bold text-blue-700 dark:text-blue-300">{'⭐'.repeat(session.understandingScore)} ({session.understandingScore}/5)</span>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#080d1a] p-2.5 rounded-xl border border-slate-100 dark:border-blue-900/40">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold">الهدف القادم</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">{session.nextPlan || 'متابعة البرنامج الفردي'}</span>
                        </div>

                        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                          <span className="text-amber-800 dark:text-amber-300 block text-[10px] font-bold">التوجيه المنزلي</span>
                          <span className="text-amber-900 dark:text-amber-200 font-medium truncate block">{session.homeworkAssigned || 'متابعة جدول الأنشطة'}</span>
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
            <div className="flex items-center justify-between bg-white dark:bg-[#0f172a] p-2.5 rounded-2xl border border-sky-100 dark:border-blue-900/40 shadow-xs transition-colors">
              <div className="relative flex-1 w-full max-w-xs">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث عن طالب أو ولي أمر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326]"
                />
              </div>

              <button
                id="add-student-btn-list"
                onClick={onOpenNewStudent}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>إضافة طالب جديد</span>
              </button>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-8 text-center space-y-3 shadow-xs transition-colors">
                <Users className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">لا يوجد طلاب مسجلون حالياً</p>
                <button
                  onClick={onOpenNewStudent}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  إضافة أول طالب وتوليد حساب ولي الأمر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredStudents.map((std) => (
                  <div
                    key={std.id}
                    className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{std.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{std.grade} • {std.subject}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800/40">
                          {std.currentLevel}
                        </span>
                      </div>

                      {/* Clinical Badges & Info: Diagnosis, Age, Address */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {std.diagnosis && (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-[10px] font-bold flex items-center gap-1">
                            <HeartPulse className="w-3 h-3 text-rose-500" />
                            <span>{std.diagnosis}</span>
                          </span>
                        )}

                        {std.birthDate && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-bold flex items-center gap-1">
                            <Baby className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{calculateAgeArabic(std.birthDate) || std.birthDate}</span>
                          </span>
                        )}

                        {std.address && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#080d1a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 text-[10px] font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{std.address}</span>
                          </span>
                        )}
                      </div>

                      {/* Dedicated Parent Account Credentials Card */}
                      <div className="mt-3 p-3 bg-blue-50/40 dark:bg-[#0b1326] rounded-xl border border-blue-200/80 dark:border-blue-900/50 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span>ولي الأمر: <strong className="text-slate-900 dark:text-white">{std.parentName}</strong></span>
                          <a
                            href={`https://wa.me/${std.parentPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{std.parentPhone}</span>
                          </a>
                        </div>

                        {/* Account Access Details */}
                        <div className="p-2 bg-white dark:bg-[#080d1a] rounded-lg border border-blue-100 dark:border-blue-900/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                              <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span>اسم المستخدم:</span>
                            </span>
                            <span className="font-mono font-bold text-blue-900 dark:text-blue-300 text-[11px]">
                              {std.parentUsername || std.parentPhone}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>كلمة المرور:</span>
                            </span>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                              {std.parentPassword || '123456'}
                            </span>
                          </div>
                        </div>

                        {/* Quick Action to Share or Copy credentials */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(std)}
                            className="flex-1 py-1 px-2 rounded-lg bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#152244] text-slate-700 dark:text-slate-200 text-[10px] font-bold border border-slate-200 dark:border-blue-900/40 flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            {copiedId === std.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                            <span>{copiedId === std.id ? 'تم النسخ' : 'نسخ الحساب'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendCredentialsWhatsApp(std)}
                            className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>إرسال بالواتساب</span>
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>الجلسات المنجزة: {std.completedSessions} من {std.totalSessions}</span>
                          <span className="text-blue-700 dark:text-blue-400 font-bold">
                            {std.totalSessions > 0 ? Math.round((std.completedSessions / std.totalSessions) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-[#080d1a] rounded-full overflow-hidden border border-slate-200/60 dark:border-blue-900/40">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                            style={{ width: `${std.totalSessions > 0 ? Math.min(100, (std.completedSessions / std.totalSessions) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-blue-900/30">
                      <button
                        onClick={() => onOpenNewSession(std.id)}
                        className="flex-1 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>تسجيل جلسة</span>
                      </button>

                      <button
                        onClick={() => onEditStudent(std)}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-[#080d1a] hover:bg-slate-200 dark:hover:bg-[#152244] text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-blue-900/40 transition cursor-pointer"
                      >
                        تعديل
                      </button>

                      {onDeleteStudent && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من رغبتك في حذف ملف الطالب (${std.name})؟ سيتم حذفه من المنصة وقاعدة البيانات السحابية.`)) {
                              onDeleteStudent(std.id);
                            }
                          }}
                          title="حذف ملف الطالب"
                          className="p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
            <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-sky-100 dark:border-blue-900/40 shadow-xs flex items-center justify-between transition-colors">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">طلبات التقييم والانضمام الواردة</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">يمكنك تحويل أي طلب إلى ملف طالب نشط وتوليد حسابه بضغطة واحدة</p>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
                لا توجد طلبات تقييم جديدة حالياً
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{lead.studentName} ({lead.studentAge})</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-900/50">
                          {lead.subjectNeeded}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        ولي الأمر: <strong className="text-slate-900 dark:text-white">{lead.parentName}</strong> • هاتف: <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-700 dark:text-emerald-400 font-bold underline">{lead.phone}</a>
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">الفترة المفضلة: {lead.preferredTime} {lead.notes && `• ملاحظات: ${lead.notes}`}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={getWhatsAppUrl(lead.phone, `مرحباً بك يا ${lead.parentName}، يسعدنا تواصلكم بخصوص تدريب الطالب ${lead.studentName}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800/50 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>محادثة واتساب</span>
                      </a>

                      <button
                        onClick={() => onAcceptLead(lead)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-1.5 transition cursor-pointer"
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

        {/* TAB 4: RAPID ASSESSMENT SCALES (10 ITEMS EACH) */}
        {activeTab === 'assessments' && (
          <div className="space-y-4">
            <AssessmentScreeningView
              embeddedMode={true}
              teacherPhone={profile.whatsapp}
              teacherName={profile.name}
            />
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

