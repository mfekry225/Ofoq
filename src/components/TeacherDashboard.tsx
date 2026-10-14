import React, { useState, useEffect } from 'react';
import { Student, SessionRecord, EnrollmentLead, TeacherProfile, TeacherCredentials, TimelineMilestone, CompletedAssessmentRecord } from '../types';
import { 
  Users, Calendar, Plus, Share2, BookOpen, Clock, Award, TrendingUp, 
  MessageCircle, Phone, Search, Filter, CheckCircle2, XCircle, Bell, 
  ChevronDown, LogOut, Check, Sparkles, ExternalLink, ShieldCheck, FileText,
  Copy, Key, User, Lock, Send, KeyRound, HeartPulse, MapPin, Baby, Cloud, CloudOff,
  RefreshCw, Trash2, AlertTriangle, ShieldAlert, ArrowRight, Eye
} from 'lucide-react';
import { getWhatsAppUrl, formatDateArabic } from '../utils';
import { AccountSettingsModal } from './AccountSettingsModal';
import { StudentProfileModal } from './StudentProfileModal';
import { calculateAgeArabic } from '../studentOptions';
import { CloudSyncStatus, cloudAuth, cloudService } from '../cloudFirestore';
import { ThemeToggle } from './ThemeToggle';
import { AssessmentScreeningView } from './AssessmentScreeningView';

interface TeacherDashboardProps {
  profile: TeacherProfile;
  students: Student[];
  sessions: SessionRecord[];
  leads: EnrollmentLead[];
  timelines?: TimelineMilestone[];
  assessments?: CompletedAssessmentRecord[];
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
  onSaveAssessment?: (record: CompletedAssessmentRecord) => void;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  profile,
  students,
  sessions,
  leads,
  timelines = [],
  assessments = [],
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
  onSaveAssessment,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'students' | 'leads' | 'assessments'>('sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'password' | 'google' | 'cloud'>('password');
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<Student | null>(null);
  const [assessmentViewMode, setAssessmentViewMode] = useState<'records' | 'runner'>('records');
  const [assessmentStudentForRunner, setAssessmentStudentForRunner] = useState<Student | null>(null);
  const [assessmentSearchQuery, setAssessmentSearchQuery] = useState('');
  const [assessmentScaleFilter, setAssessmentScaleFilter] = useState<string>('all');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState(() => cloudAuth.getCurrentUser());

  useEffect(() => {
    const unsub = cloudAuth.onAuthChange((u) => {
      setFirebaseUser(u);
    });
    return () => unsub();
  }, []);

  const handleDirectSync = async () => {
    if (isSyncingNow) return;
    setIsSyncingNow(true);
    setSyncFeedback('جاري مزامنة وتأمين كافة بيانات الطلاب في Firestore...');
    try {
      if (onForceSync) {
        const syncRes = await onForceSync();
        const isOk = typeof syncRes === 'boolean' ? syncRes : syncRes.success;
        const count = typeof syncRes === 'object' && syncRes.count ? ` (${syncRes.count} عنصر)` : '';
        const errorMsg = typeof syncRes === 'object' && syncRes.error ? syncRes.error : 'فشلت المزامنة';
        setSyncFeedback(isOk ? `تمت المزامنة السحابية وتأمين البيانات في Firestore بنجاح${count} 🟢` : errorMsg);
      }
    } catch (e: any) {
      setSyncFeedback(e?.message || 'حدث خطأ في المزامنة');
    } finally {
      setIsSyncingNow(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

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
  const avgUnderstandingScore = sessions.length > 0 
    ? (sessions.reduce((acc, s) => acc + (s.understandingScore || 0), 0) / sessions.length).toFixed(1) 
    : '5.0';

  const handleCopyCredentials = (std: Student) => {
    const pass = std.parentPassword || (std.parentAccessCode ? `OFQ-${std.parentAccessCode}` : `OFQ${std.id.slice(-4)}`);
    const text = `مرحباً ${std.parentName}،\nبيانات دخولكم لمتابعة تقارير وجلسات الطالب (${std.name}) في منصة أُفق (Ofoq):\n• اسم المستخدم: ${std.parentUsername || std.parentPhone}\n• كلمة المرور: ${pass}\nرابط الدخول للمنصة:\n${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(std.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendCredentialsWhatsApp = (std: Student) => {
    const pass = std.parentPassword || (std.parentAccessCode ? `OFQ-${std.parentAccessCode}` : `OFQ${std.id.slice(-4)}`);
    const text = `مرحباً ${std.parentName}،\nبيانات دخولكم لمتابعة تقارير وجلسات الطالب (${std.name}) في منصة أُفق (Ofoq):\n• اسم المستخدم: ${std.parentUsername || std.parentPhone}\n• كلمة المرور: ${pass}\nرابط الدخول للمنصة:\n${window.location.origin}`;
    const targetPhone = std.parentPhone || std.motherPhone || '';
    const url = getWhatsAppUrl(targetPhone, text);
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
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/40 text-[10px] sm:text-[11px] font-bold">
              {isSyncingNow ? (
                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="hidden md:inline">جاري المزامنة...</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleDirectSync}
                  className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition cursor-pointer"
                  title="سحابة Firestore متصلة ومباشرة - انقر للمزامنة الفورية الآن"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline">سحابي متصل</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDirectSync}
                disabled={isSyncingNow}
                title="مزامنة فورية مع قاعدة بيانات Firestore"
                className="p-0.5 hover:bg-slate-200 dark:hover:bg-[#152244] rounded text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingNow ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
              </button>
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
              onClick={() => {
                setSettingsInitialTab('password');
                setIsSettingsOpen(true);
              }}
              title="إعدادات الحساب وكلمة المرور وقاعدة البيانات"
              className="p-2 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-blue-50 dark:hover:bg-[#152244] text-slate-700 dark:text-slate-200 hover:text-blue-800 dark:hover:text-blue-300 border border-slate-200 dark:border-blue-900/40 text-xs font-bold transition shadow-2xs relative"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 text-center animate-in slide-in-from-top duration-200 flex items-center justify-center gap-2 shadow-md">
          <Cloud className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 space-y-6 w-full">
        {/* Top Interactive Metric & Section Containers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
          {/* Container 1: الجلسات */}
          <button
            id="tab-teacher-sessions"
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`relative text-right rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between border text-start group ${
              activeTab === 'sessions'
                ? 'bg-gradient-to-br from-blue-50/95 via-white to-indigo-50/80 dark:from-[#0f1d38] dark:via-[#0f172a] dark:to-[#141b36] border-blue-500 dark:border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/30'
                : 'bg-white dark:bg-[#0f172a] hover:bg-slate-50/80 dark:hover:bg-[#131d36] border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm'
            }`}
          >
            {/* Active Top Glow Line */}
            {activeTab === 'sessions' && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
            )}

            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'sessions'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'
                }`}>
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate">
                    الجلسات ({sessions.length})
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    سجل المتابعة اليومي
                  </span>
                </div>
              </div>
              {activeTab === 'sessions' && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  معروض الآن
                </span>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between w-full">
              <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 tabular-nums">
                {sessions.length}
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1.5">
                  جلسة مسجلة
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400" title="متوسط الاستيعاب">
                ★ {avgUnderstandingScore}/5
              </span>
            </div>
          </button>

          {/* Container 2: الطلاب */}
          <button
            id="tab-teacher-students"
            type="button"
            onClick={() => setActiveTab('students')}
            className={`relative text-right rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between border text-start group ${
              activeTab === 'students'
                ? 'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/80 dark:from-[#0d2822] dark:via-[#0f172a] dark:to-[#0f2420] border-emerald-500 dark:border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-[#0f172a] hover:bg-slate-50/80 dark:hover:bg-[#131d36] border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-sm'
            }`}
          >
            {activeTab === 'students' && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            )}

            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'students'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
                }`}>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate">
                    الطلاب ({students.length})
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    الملفات والخطط الفردية
                  </span>
                </div>
              </div>
              {activeTab === 'students' && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  معروض الآن
                </span>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between w-full">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {students.length}
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1.5">
                  طالب مقيد
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500">
                متابعة فردية
              </span>
            </div>
          </button>

          {/* Container 3: الطلبات */}
          <button
            id="tab-teacher-leads"
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`relative text-right rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between border text-start group ${
              activeTab === 'leads'
                ? 'bg-gradient-to-br from-amber-50/95 via-white to-orange-50/80 dark:from-[#2e1d0d] dark:via-[#0f172a] dark:to-[#24170b] border-amber-500 dark:border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/30'
                : 'bg-white dark:bg-[#0f172a] hover:bg-slate-50/80 dark:hover:bg-[#131d36] border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-sm'
            }`}
          >
            {activeTab === 'leads' && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            )}

            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'leads'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50'
                }`}>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate">
                    الطلبات ({leads.length})
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    طلبات التقييم والحجز
                  </span>
                </div>
              </div>
              {newLeadsCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {newLeadsCount} جديد
                </span>
              ) : activeTab === 'leads' ? (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  معروض الآن
                </span>
              ) : null}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between w-full">
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {leads.length}
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1.5">
                  طلب وارد
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {newLeadsCount > 0 ? `${newLeadsCount} بانتظار المراجعة` : 'مكتمل المراجعة'}
              </span>
            </div>
          </button>

          {/* Container 4: المقاييس */}
          <button
            id="tab-teacher-assessments"
            type="button"
            onClick={() => setActiveTab('assessments')}
            className={`relative text-right rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between border text-start group ${
              activeTab === 'assessments'
                ? 'bg-gradient-to-br from-purple-50/95 via-white to-violet-50/80 dark:from-[#271038] dark:via-[#0f172a] dark:to-[#1f0d2e] border-purple-500 dark:border-purple-500 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/30'
                : 'bg-white dark:bg-[#0f172a] hover:bg-slate-50/80 dark:hover:bg-[#131d36] border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-sm'
            }`}
          >
            {activeTab === 'assessments' && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600" />
            )}

            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'assessments'
                    ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50'
                }`}>
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate">
                    المقاييس ({assessments.length > 0 ? `${assessments.length} تقييم` : '10 بنود'})
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    سجل التقييمات والاختبارات
                  </span>
                </div>
              </div>
              {activeTab === 'assessments' ? (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                  معروض الآن
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  {assessments.length > 0 ? `${assessments.length} نتائج مسجلة` : '4 مقاييس (10 بنود)'}
                </span>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between w-full">
              <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                {assessments.length}
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1.5">
                  تقييم مسجل
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500">
                4 مقاييس (10 بنود)
              </span>
            </div>
          </button>
        </div>

        {/* TAB 1: SESSIONS RECORD & WHATSAPP SHARING */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {/* Filters Bar Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-sky-100 dark:border-blue-900/40 shadow-xs transition-colors items-center">
              <div className="relative sm:col-span-6 md:col-span-6 lg:col-span-7">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="بحث باسم الطالب أو موضوع الجلسة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326]"
                />
              </div>

              <div className="sm:col-span-3 md:col-span-3 lg:col-span-3">
                <select
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326]"
                >
                  <option value="all">جميع الطلاب</option>
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>{std.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 md:col-span-3 lg:col-span-2">
                <button
                  id="add-session-btn-filterbar"
                  onClick={() => onOpenNewSession()}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>تسجيل جلسة</span>
                </button>
              </div>
            </div>

            {/* Sessions Responsive Multi-Column Grid */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {filteredSessions.map((session) => {
                  const student = students.find((s) => s.id === session.studentId);
                  return (
                    <div
                      key={session.id}
                      className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-4 sm:p-5 transition shadow-xs flex flex-col justify-between space-y-3.5"
                    >
                      <div className="space-y-3">
                        {/* Top Header of Card */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{session.studentName}</span>
                              <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] sm:text-[11px] font-bold border border-blue-200 dark:border-blue-800/40">
                                جلسة #{session.sessionNumber}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                {session.date} • {session.time}
                              </span>
                            </div>
                            <h2 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-snug">
                              {session.topic}
                            </h2>
                          </div>

                          {/* WhatsApp Report Share CTA Button */}
                          {student && (
                            <button
                              id={`share-report-btn-${session.id}`}
                              onClick={() => onShareSession(session, student)}
                              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20 shrink-0 transition transform active:scale-95 cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 text-white" />
                              <span className="hidden sm:inline">تقرير ولي الأمر</span>
                              <span className="sm:hidden">تقرير</span>
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
                      </div>

                      {/* Summary Metrics & Plan */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-blue-900/30 text-[11px]">
                        <div className="bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold">مستوى الاستيعاب</span>
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
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-sky-100 dark:border-blue-900/40 shadow-xs transition-colors">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="بحث عن طالب، ولي أمر، مسار تأهيلي..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326]"
                />
              </div>

              <button
                id="add-student-btn-list"
                onClick={onOpenNewStudent}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>إضافة طالب جديد</span>
              </button>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-xs transition-colors">
                <Users className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">لا يوجد طلاب مسجلون حالياً</p>
                <button
                  onClick={onOpenNewStudent}
                  className="px-5 py-2.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  إضافة أول طالب وتوليد حساب ولي الأمر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {filteredStudents.map((std) => (
                  <div
                    key={std.id}
                    className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs flex flex-col justify-between transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Clickable Header Area */}
                      <div
                        onClick={() => setSelectedProfileStudent(std)}
                        className="cursor-pointer group/title p-1.5 -m-1.5 rounded-xl hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition flex items-start justify-between gap-2 border border-transparent hover:border-blue-200/60 dark:hover:border-blue-900/40"
                        title="اضغط لفتح الملف الشامل وسجل التقييمات والجلسات للطالب"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors flex items-center gap-1">
                              <span>{std.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover/title:opacity-100 text-blue-600 dark:text-blue-400 transition" />
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{std.grade} • {std.subject}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800/40 shrink-0">
                          {std.currentLevel}
                        </span>
                      </div>

                      {/* Clinical Badges & Info */}
                      <div className="flex flex-wrap items-center gap-1.5">
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

                        {(() => {
                          const stdAssessments = assessments.filter(a => a.studentId === std.id || (a.childName && a.childName.trim().toLowerCase() === std.name.trim().toLowerCase()));
                          if (stdAssessments.length > 0) {
                            return (
                              <button
                                type="button"
                                onClick={() => setSelectedProfileStudent(std)}
                                className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 text-[10px] font-black flex items-center gap-1 hover:bg-purple-100 transition cursor-pointer"
                                title="عرض تقييمات الطالب"
                              >
                                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <span>{stdAssessments.length} تقييم مسجل</span>
                              </button>
                            );
                          }
                          return null;
                        })()}

                        {std.address && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#080d1a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 text-[10px] font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{std.address}</span>
                          </span>
                        )}
                      </div>

                      {/* Parent Account Credentials Card */}
                      <div className="p-3 bg-blue-50/40 dark:bg-[#0b1326] rounded-xl border border-blue-200/80 dark:border-blue-900/50 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="truncate">ولي الأمر: <strong className="text-slate-900 dark:text-white">{std.parentName}</strong></span>
                          <a
                            href={`https://wa.me/${std.parentPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px] shrink-0"
                            title="هاتف الأب / الأساسي"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{std.parentPhone}</span>
                          </a>
                        </div>

                        {std.motherPhone && (
                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-blue-100/60 dark:border-blue-900/40">
                            <span className="text-[11px]">رقم الأم:</span>
                            <a
                              href={`https://wa.me/${std.motherPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px] shrink-0"
                              title="هاتف الأم"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{std.motherPhone}</span>
                            </a>
                          </div>
                        )}

                        {/* Account Access Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-white dark:bg-[#080d1a] rounded-lg border border-blue-100 dark:border-blue-900/40">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-slate-500 dark:text-slate-400 text-[10px] flex items-center gap-1">
                              <User className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>المستخدم:</span>
                            </span>
                            <span className="font-mono font-bold text-blue-900 dark:text-blue-300 text-[11px] truncate">
                              {std.parentUsername || std.parentPhone}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <span className="text-slate-500 dark:text-slate-400 text-[10px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>السر:</span>
                            </span>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                              {std.parentPassword || (std.parentAccessCode ? `OFQ-${std.parentAccessCode}` : `OFQ${std.id.slice(-4)}`)}
                            </span>
                          </div>
                        </div>

                        {/* Actions Grid for Copy/WhatsApp */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(std)}
                            className="py-1.5 px-2 rounded-lg bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#152244] text-slate-700 dark:text-slate-200 text-[10px] font-bold border border-slate-200 dark:border-blue-900/40 flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            {copiedId === std.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                            <span>{copiedId === std.id ? 'تم النسخ' : 'نسخ الحساب'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendCredentialsWhatsApp(std)}
                            className="py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>إرسال بالواتساب</span>
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>الجلسات المنجزة: {std.completedSessions} من {std.totalSessions}</span>
                          <span className="text-blue-700 dark:text-blue-400 font-bold tabular-nums">
                            {std.totalSessions > 0 ? Math.round((std.completedSessions / std.totalSessions) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-[#080d1a] rounded-full overflow-hidden border border-slate-200/60 dark:border-blue-900/40">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                            style={{ width: `${std.totalSessions > 0 ? Math.min(100, (std.completedSessions / std.totalSessions) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Grid */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-blue-900/30">
                      <button
                        type="button"
                        onClick={() => setSelectedProfileStudent(std)}
                        className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                        title="عرض الملف السريري والتقييمات والجلسات"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>الملف الشامل</span>
                      </button>

                      <button
                        onClick={() => onOpenNewSession(std.id)}
                        className="py-2 px-3 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        title="تسجيل جلسة جديدة"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>جلسة</span>
                      </button>

                      <button
                        onClick={() => onEditStudent(std)}
                        className="px-3 py-2 bg-slate-100 dark:bg-[#080d1a] hover:bg-slate-200 dark:hover:bg-[#152244] text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-blue-900/40 transition cursor-pointer"
                        title="تعديل بيانات الطالب"
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
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-sky-100 dark:border-blue-900/40 shadow-xs flex items-center justify-between transition-colors">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">طلبات التقييم والانضمام الواردة</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">يمكنك تحويل أي طلب إلى ملف طالب نشط وتوليد حسابه بضغطة واحدة</p>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-8 sm:p-12 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
                لا توجد طلبات تقييم جديدة حالياً
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-blue-900/30">
                      <a
                        href={getWhatsAppUrl(lead.phone, `مرحباً بك يا ${lead.parentName}، يسعدنا تواصلكم بخصوص تدريب الطالب ${lead.studentName}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800/50 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>واتساب</span>
                      </a>

                      <button
                        onClick={() => onAcceptLead(lead)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>قبول كطالب</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RAPID ASSESSMENT SCALES (10 ITEMS EACH) & STUDENT RECORDS */}
        {activeTab === 'assessments' && (
          <div className="space-y-4">
            {/* Top Sub-Bar: Switch between Records List and Assessment Runner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-sky-100 dark:border-blue-900/40 shadow-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setAssessmentViewMode('records')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    assessmentViewMode === 'records'
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : 'bg-slate-100 dark:bg-[#080d1a] hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>سجل تقييمات الطلاب ({assessments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAssessmentStudentForRunner(null);
                    setAssessmentViewMode('runner');
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    assessmentViewMode === 'runner'
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : 'bg-slate-100 dark:bg-[#080d1a] hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>إجراء مقياس جديد</span>
                </button>
              </div>

              {assessmentViewMode === 'records' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="بحث باسم الطالب أو المقياس..."
                      value={assessmentSearchQuery}
                      onChange={(e) => setAssessmentSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  <select
                    value={assessmentScaleFilter}
                    onChange={(e) => setAssessmentScaleFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">كافة المقاييس</option>
                    <option value="language">التأخر اللغوي</option>
                    <option value="autism">طيف التوحد</option>
                    <option value="developmental_learning">صعوبات التعلم النمائية</option>
                    <option value="stuttering">طلاقة الكلام والتلعثم</option>
                  </select>
                </div>
              )}
            </div>

            {/* VIEW MODE 1: RECORDS LIST */}
            {assessmentViewMode === 'records' && (
              <div className="space-y-4">
                {(() => {
                  const filtered = assessments.filter((rec) => {
                    const matchesSearch = 
                      (rec.childName && rec.childName.toLowerCase().includes(assessmentSearchQuery.toLowerCase())) ||
                      (rec.scaleTitle && rec.scaleTitle.toLowerCase().includes(assessmentSearchQuery.toLowerCase())) ||
                      (rec.evaluatorName && rec.evaluatorName.toLowerCase().includes(assessmentSearchQuery.toLowerCase()));

                    const matchesScale = assessmentScaleFilter === 'all' || rec.scaleId === assessmentScaleFilter;
                    return matchesSearch && matchesScale;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-xs">
                        <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {assessments.length === 0 ? 'لم يتم تسجيل تقييمات للطلاب بعد' : 'لا توجد نتائج مطابقة لبحثك'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                          عندما يقوم ولي الأمر أو الأخصائي بإجراء أي مقياس عبر المنصة، تظهر النتائج والتوصيات الفورية هنا وترتبط بملف الطالب مباشرة.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAssessmentViewMode('runner')}
                          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>تطبيق أول مقياس تقييمي الآن</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filtered.map((rec) => {
                        const matchedStudent = students.find((s) => s.id === rec.studentId || s.name.trim().toLowerCase() === rec.childName.trim().toLowerCase());

                        return (
                          <div
                            key={rec.id}
                            className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 sm:p-5 border border-sky-100 dark:border-blue-900/40 hover:border-purple-300 dark:hover:border-purple-800/60 transition space-y-3 shadow-xs flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              {/* Header with Student Name & Clickable profile action */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {matchedStudent ? (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedProfileStudent(matchedStudent)}
                                        className="font-bold text-sm sm:text-base text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 text-right cursor-pointer"
                                        title="اضغط لفتح الملف الشامل للطالب"
                                      >
                                        <span>{rec.childName}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <strong className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                        {rec.childName}
                                      </strong>
                                    )}

                                    {matchedStudent && (
                                      <span className="px-2 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200">
                                        طالب مقيد
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                                    {rec.scaleTitle} • {rec.date}
                                  </span>
                                </div>

                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                                  rec.riskLevel === 'low'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                                    : rec.riskLevel === 'moderate'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200'
                                }`}>
                                  {rec.riskLabel || (rec.riskLevel === 'low' ? 'مؤشرات منخفضة' : rec.riskLevel === 'moderate' ? 'مؤشرات متوسطة' : 'مؤشرات مرتفعة')}
                                </span>
                              </div>

                              {/* Evaluator & Score Card */}
                              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#080d1a] border border-slate-100 dark:border-blue-900/40 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-bold">المُقيّم:</span>
                                  <strong className="text-slate-800 dark:text-slate-200 truncate block">
                                    {rec.evaluatorName || 'ولي الأمر'}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-bold">الدرجة الكلية:</span>
                                  <strong className="text-purple-700 dark:text-purple-400 tabular-nums">
                                    {rec.totalScore} / 20
                                  </strong>
                                </div>
                              </div>

                              {/* Clinical Summary */}
                              {rec.summary && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                                  {rec.summary}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="pt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between gap-2 text-xs">
                              {matchedStudent ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedProfileStudent(matchedStudent)}
                                  className="py-1.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/50 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <User className="w-3.5 h-3.5" />
                                  <span>الملف الشامل للطالب</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">تقييم استرشادي وارد</span>
                              )}

                              {matchedStudent && matchedStudent.parentPhone && (
                                <a
                                  href={`https://wa.me/${matchedStudent.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `نتائج المقياس التقييمي (${rec.scaleTitle}) للطفل ${rec.childName}:\nالدرجة: ${rec.totalScore}/20\nالمستوى: ${rec.riskLabel}\nالأخصائي المشرف: ${profile.name}`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>مشاركة عبر واتساب</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* VIEW MODE 2: ASSESSMENT RUNNER */}
            {assessmentViewMode === 'runner' && (
              <div className="space-y-4">
                {/* Student Selector Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      تطبيق المقياس على طالب:
                    </span>
                    <select
                      value={assessmentStudentForRunner?.id || 'none'}
                      onChange={(e) => {
                        const std = students.find((s) => s.id === e.target.value);
                        setAssessmentStudentForRunner(std || null);
                      }}
                      className="bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden w-full sm:w-64"
                    >
                      <option value="none">-- فحص استرشادي عام (بدون ربط) --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.grade} • {s.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAssessmentViewMode('records')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#080d1a] hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>العودة لسجل التقييمات</span>
                  </button>
                </div>

                <AssessmentScreeningView
                  embeddedMode={true}
                  studentId={assessmentStudentForRunner?.id}
                  initialChildName={assessmentStudentForRunner?.name || ''}
                  initialParentName={assessmentStudentForRunner?.parentName || profile.name}
                  teacherPhone={profile.whatsapp}
                  teacherName={profile.name}
                  onSaveAssessment={(record) => {
                    if (onSaveAssessment) onSaveAssessment(record);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comprehensive Student Profile Modal */}
      {selectedProfileStudent && (
        <StudentProfileModal
          student={selectedProfileStudent}
          sessions={sessions}
          timelines={timelines}
          assessments={assessments}
          teacherProfile={profile}
          onClose={() => setSelectedProfileStudent(null)}
          onOpenNewSession={(stdId) => {
            setSelectedProfileStudent(null);
            onOpenNewSession(stdId);
          }}
          onStartAssessment={(std) => {
            setSelectedProfileStudent(null);
            setAssessmentStudentForRunner(std);
            setActiveTab('assessments');
            setAssessmentViewMode('runner');
          }}
          onEditStudent={(std) => {
            setSelectedProfileStudent(null);
            onEditStudent(std);
          }}
          onDeleteStudent={onDeleteStudent}
        />
      )}

      {/* Account Settings Modal */}
      {isSettingsOpen && (
        <AccountSettingsModal
          currentCredentials={teacherCredentials}
          initialTab={settingsInitialTab}
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

