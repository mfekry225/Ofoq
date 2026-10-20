import React, { useState, useEffect } from 'react';
import { 
  TeacherProfile, Student, SessionRecord, TimelineMilestone, 
  EnrollmentLead, CurrentUser, CompletedAssessmentRecord 
} from './types';
import { storage } from './storage';
import { INITIAL_TEACHER_PROFILE } from './mockData';
import { cloudService, cloudAuth, CloudSyncStatus } from './cloudFirestore';
import { LoginGateway } from './components/LoginGateway';
import { TeacherProfileView } from './components/TeacherProfileView';
import { EnrollmentFormView } from './components/EnrollmentFormView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentPortal } from './components/ParentPortal';
import { SessionModal } from './components/SessionModal';
import { StudentModal } from './components/StudentModal';
import { ShareReportModal } from './components/ShareReportModal';
import { ThemeProvider } from './themeContext';

function MainAppContent() {
  // Navigation & View Mode
  const [currentView, setCurrentView] = useState<'login' | 'profile' | 'enroll' | 'dashboard'>('login');

  // Cloud Sync Status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('connecting');
  const [cloudStatusMessage, setCloudStatusMessage] = useState<string>('جاري الاتصال...');

  // الجلسة تُحدَّد من Firebase Auth فقط (لا تُخزَّن في المتصفح)
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // الملف العام للأخصائي (بيانات علنية) — البيانات الحساسة تبقى في الذاكرة فقط
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => storage.getTeacherProfile());
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [timelines, setTimelines] = useState<TimelineMilestone[]>([]);
  const [leads, setLeads] = useState<EnrollmentLead[]>([]);
  const [assessments, setAssessments] = useState<CompletedAssessmentRecord[]>([]);

  // Modal States
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionModalStudentId, setSessionModalStudentId] = useState<string | undefined>();
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [shareSessionData, setShareSessionData] = useState<{ session: SessionRecord; student: Student } | null>(null);

  // 0. مسح أي بيانات حساسة خزّنتها النسخ القديمة محلياً على هذا الجهاز
  useEffect(() => {
    storage.purgeLegacy();
  }, []);

  // 1. الملف العام للأخصائي (متاح للزوار)
  useEffect(() => {
    return cloudService.subscribePublicProfile((profile) => {
      const isLegacy = profile.title?.includes('برمجيات') || profile.bio?.includes('برمج') || !profile.title?.includes('نطق');
      if (isLegacy) return;
      const merged: TeacherProfile = {
        ...INITIAL_TEACHER_PROFILE,
        ...profile,
        specialistDuties: profile.specialistDuties?.length ? profile.specialistDuties : INITIAL_TEACHER_PROFILE.specialistDuties,
        familySupport: profile.familySupport?.length ? profile.familySupport : INITIAL_TEACHER_PROFILE.familySupport,
      };
      setTeacherProfile(merged);
      storage.saveTeacherProfile(merged);
    });
  }, []);

  // 2. حالة الدخول: الدور (أخصائي / ولي أمر) يحدده الخادم عبر مستندات admins و parents
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = cloudAuth.onAuthChange(async (fbUser) => {
      if (!fbUser) {
        if (cancelled) return;
        setCurrentUser(null);
        setCurrentView((v) => (v === 'dashboard' ? 'login' : v));
        setAuthReady(true);
        return;
      }
      const resolved = await cloudAuth.resolveRole(fbUser);
      if (cancelled) return;
      if (!resolved) {
        // حساب Firebase غير مرتبط بأخصائي أو ولي أمر: لا نمنحه أي وصول
        await cloudAuth.logout();
        setCurrentUser(null);
        setAuthReady(true);
        return;
      }
      if (resolved.role === 'teacher') {
        setCurrentUser({
          role: 'teacher',
          name: fbUser.displayName || storage.getTeacherProfile().name,
          email: fbUser.email || undefined,
        });
      } else {
        setCurrentUser({
          role: 'parent',
          studentId: resolved.studentId,
          name: resolved.username || 'ولي الأمر',
        });
      }
      setCurrentView('dashboard');
      setAuthReady(true);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // 3. اشتراك البيانات حسب الدور: الأخصائي يرى كل شيء، وولي الأمر يرى طفله فقط
  useEffect(() => {
    setStudents([]);
    setSessions([]);
    setTimelines([]);
    setLeads([]);
    setAssessments([]);

    if (!currentUser) {
      setCloudSyncStatus('connecting');
      return;
    }

    const onStatusChange = (status: CloudSyncStatus, msg?: string) => {
      setCloudSyncStatus(status);
      if (msg) setCloudStatusMessage(msg);
    };

    if (currentUser.role === 'teacher') {
      return cloudService.subscribeOwner({
        onStudents: setStudents,
        onSessions: setSessions,
        onTimelines: setTimelines,
        onLeads: setLeads,
        onAssessments: setAssessments,
        onStatusChange,
      });
    }

    if (currentUser.studentId) {
      return cloudService.subscribeParent(currentUser.studentId, {
        onStudent: (student) => setStudents(student ? [student] : []),
        onSessions: setSessions,
        onTimelines: setTimelines,
        onAssessments: setAssessments,
        onStatusChange,
      });
    }
  }, [currentUser?.role, currentUser?.studentId]);

  // Assessment Handlers
  const handleSaveAssessment = (record: CompletedAssessmentRecord) => {
    // ولي الأمر: يحفظ التقييم لطفله فقط (والقواعد تفرض ذلك)، دون تعديل ملف الطالب
    if (currentUser?.role === 'parent') {
      if (!currentUser.studentId) return;
      const parentRecord: CompletedAssessmentRecord = { ...record, studentId: currentUser.studentId };
      cloudService.saveAssessment(parentRecord).catch(() => {});
      return;
    }

    cloudService.saveAssessment(record).catch(() => {});

    // Match with student
    const target = students.find((s) => s.id === record.studentId || (record.childName && s.name.trim().toLowerCase() === record.childName.trim().toLowerCase()));
    if (target) {
      const linkedRecord: CompletedAssessmentRecord = { ...record, studentId: target.id, studentName: target.name };
      cloudService.saveAssessment(linkedRecord).catch(() => {});
      const updatedStudent: Student = {
        ...target,
        assessments: [linkedRecord, ...(target.assessments || []).filter((a) => a.id !== record.id)],
        hasNewAssessment: true,
        lastAssessmentDate: record.date
      };
      cloudService.saveStudent(updatedStudent).catch(() => {});

      // Add timeline milestone
      const milestone: TimelineMilestone = {
        id: `tm-${Date.now()}`,
        studentId: target.id,
        date: record.date,
        title: `إجراء ${record.scaleTitle}`,
        description: `النتيجة: ${record.totalScore}/20 (${record.riskLabel}) - تم حفظ وتحديث السجل التقييمي.`,
        levelBadge: 'تقييم مقنن 📋',
        type: 'achievement'
      };
      cloudService.saveTimeline(milestone).catch(() => {});
    }
  };

  const handleLogout = () => {
    cloudAuth.logout().catch(() => {});
    setCurrentUser(null);
    setCurrentView('login');
  };

  // Student Handlers (الأخصائي فقط؛ القواعد ترفض أي كتابة من غيره)
  const handleSaveStudent = async (savedStudent: Student) => {
    const isNew = !students.some((s) => s.id === savedStudent.id);
    if (isNew) {
      // Auto-create initial milestone
      const newMilestone: TimelineMilestone = {
        id: `tm-${Date.now()}`,
        studentId: savedStudent.id,
        date: savedStudent.joinedAt,
        title: 'الانضمام وتحديد المستوى التأسيسي',
        description: `انضمام الطالب لمسار ${savedStudent.subject} وتخصيص خطة التدريب.`,
        levelBadge: 'بداية الانطلاق 🚀',
        type: 'achievement'
      };
      cloudService.saveTimeline(newMilestone).catch(() => {});
    }
    await cloudService.saveStudent(savedStudent);

    setIsStudentModalOpen(false);
    setStudentToEdit(null);
  };

  const handleDeleteStudent = async (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (target?.parentUid) await cloudAuth.revokeParentAccess(target);
    cloudService.deleteStudent(studentId);
  };

  // Session Handlers
  const handleSaveSession = (newSessionData: Omit<SessionRecord, 'id' | 'createdAt'>) => {
    const newSession: SessionRecord = {
      ...newSessionData,
      id: `ses-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    cloudService.saveSession(newSession);

    // Update student's completed sessions count
    const targetStudent = students.find((s) => s.id === newSession.studentId);
    if (targetStudent) {
      const updatedCompleted = (targetStudent.completedSessions || 0) + 1;
      const updatedTotal = targetStudent.totalSessions || 12;
      const updatedRemaining = Math.max(0, updatedTotal - updatedCompleted);

      const updatedStudent: Student = {
        ...targetStudent,
        completedSessions: updatedCompleted,
        remainingSessions: updatedRemaining,
        levelScore: Math.min(100, targetStudent.levelScore + 2),
      };

      cloudService.saveStudent(updatedStudent);

      // If milestone worthy
      if (newSession.understandingScore === 5) {
        const milestone: TimelineMilestone = {
          id: `tm-${Date.now()}`,
          studentId: targetStudent.id,
          date: newSession.date,
          title: `إتقان متميز: ${newSession.topic}`,
          description: `حقق الطالب درجة استيعاب كاملة 5/5 في تطبيق أنشطة الحصة.`,
          levelBadge: 'إتقان فائق ⭐',
          type: 'milestone'
        };
        cloudService.saveTimeline(milestone);
      }

      // Automatically pop up the share modal for immediate WhatsApp send
      setShareSessionData({ session: newSession, student: updatedStudent });
    }

    setIsSessionModalOpen(false);
  };

  // Lead Enrollment Handlers
  const handleAddLead = (leadData: Omit<EnrollmentLead, 'id' | 'createdAt' | 'status'>) => {
    const newLead: EnrollmentLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    // الزائر يستطيع الإرسال فقط؛ الأخصائي هو من يقرأ الطلبات
    cloudService.saveLead(newLead);
  };

  const handleAcceptLead = (lead: EnrollmentLead) => {
    // تحويل الطلب إلى طالب. حساب ولي الأمر يُنشأ لاحقاً من ملف الطالب بيد الأخصائي.
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: lead.studentName,
      grade: lead.studentAge,
      subject: lead.subjectNeeded,
      parentName: lead.parentName,
      parentPhone: lead.phone,
      motherPhone: lead.motherPhone,
      currentLevel: 'المستوى الأول (تأسيسي)',
      levelScore: 75,
      totalSessions: 12,
      completedSessions: 0,
      remainingSessions: 12,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
      notes: lead.notes,
    };

    cloudService.saveStudent(newStudent);
    cloudService.saveLead({ ...lead, status: 'converted' });
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7fc] dark:bg-[#080d1a] text-slate-500 dark:text-slate-300 text-sm font-bold">
        جاري التحميل...
      </div>
    );
  }

  // RENDER CURRENT VIEW
  return (
    <div className="min-h-screen bg-[#f0f7fc] dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200 relative">
      {/* 1. Direct Secure Login Gateway View */}
      {currentView === 'login' && (
        <LoginGateway
          teacherProfile={teacherProfile}
          onNavigateToProfile={() => setCurrentView('profile')}
        />
      )}

      {/* 2. Teacher Biography & Profile View */}
      {currentView === 'profile' && (
        <TeacherProfileView
          profile={teacherProfile}
          onNavigateToEnroll={() => setCurrentView('enroll')}
          onNavigateToLogin={() => setCurrentView('login')}
        />
      )}

      {/* 3. Enrollment & Trial Booking Form View */}
      {currentView === 'enroll' && (
        <EnrollmentFormView
          teacherProfile={teacherProfile}
          onAddLead={handleAddLead}
          onBack={() => setCurrentView('login')}
          onNavigateToLogin={() => setCurrentView('login')}
        />
      )}

      {/* 4. Active Dashboard View (Teacher or Parent Portal) */}
      {currentView === 'dashboard' && currentUser && (
        <>
          {currentUser.role === 'teacher' ? (
            <TeacherDashboard
              profile={teacherProfile}
              students={students}
              sessions={sessions}
              leads={leads}
              timelines={timelines}
              assessments={assessments}
              cloudSyncStatus={cloudSyncStatus}
              cloudStatusMessage={cloudStatusMessage}
              onOpenNewSession={(studentId) => {
                setSessionModalStudentId(studentId);
                setIsSessionModalOpen(true);
              }}
              onOpenNewStudent={() => {
                setStudentToEdit(null);
                setIsStudentModalOpen(true);
              }}
              onEditStudent={(std) => {
                setStudentToEdit(std);
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onShareSession={(session, student) => {
                setShareSessionData({ session, student });
              }}
              onAcceptLead={handleAcceptLead}
              onSaveAssessment={handleSaveAssessment}
              onLogout={handleLogout}
            />
          ) : (
            (() => {
              const currentStudent = students.find((s) => s.id === currentUser.studentId);
              if (!currentStudent) {
                return (
                  <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-3">
                    <p className="text-sm text-rose-500 font-bold">لم يتم العثور على حساب الطالب المرتبط</p>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      تسجيل الخروج والعودة
                    </button>
                  </div>
                );
              }
              return (
                <ParentPortal
                  student={currentStudent}
                  sessions={sessions}
                  timelines={timelines}
                  assessments={assessments}
                  teacherProfile={teacherProfile}
                  onSaveAssessment={handleSaveAssessment}
                  onLogout={handleLogout}
                />
              );
            })()
          )}
        </>
      )}

      {/* MODALS */}
      {/* Session Logger Modal */}
      {isSessionModalOpen && (
        <SessionModal
          students={students}
          preselectedStudentId={sessionModalStudentId}
          onSaveSession={handleSaveSession}
          onClose={() => setIsSessionModalOpen(false)}
        />
      )}

      {/* Student Add/Edit Modal */}
      {isStudentModalOpen && (
        <StudentModal
          studentToEdit={studentToEdit}
          onSaveStudent={handleSaveStudent}
          onClose={() => {
            setIsStudentModalOpen(false);
            setStudentToEdit(null);
          }}
        />
      )}

      {/* Share Report Modal */}
      {shareSessionData && (
        <ShareReportModal
          session={shareSessionData.session}
          student={shareSessionData.student}
          teacherName={teacherProfile.name}
          onClose={() => setShareSessionData(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}

