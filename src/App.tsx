import React, { useState, useEffect } from 'react';
import { 
  TeacherProfile, Student, SessionRecord, TimelineMilestone, 
  EnrollmentLead, CurrentUser 
} from './types';
import { storage } from './storage';
import { LoginGateway } from './components/LoginGateway';
import { TeacherProfileView } from './components/TeacherProfileView';
import { EnrollmentFormView } from './components/EnrollmentFormView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentPortal } from './components/ParentPortal';
import { SessionModal } from './components/SessionModal';
import { StudentModal } from './components/StudentModal';
import { ShareReportModal } from './components/ShareReportModal';

export default function App() {
  // Navigation & View Mode
  const [currentView, setCurrentView] = useState<'login' | 'profile' | 'enroll' | 'dashboard'>('login');

  // App Data State with LocalStorage Persistence
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => storage.getCurrentUser());
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => storage.getTeacherProfile());
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [sessions, setSessions] = useState<SessionRecord[]>(() => storage.getSessions());
  const [timelines, setTimelines] = useState<TimelineMilestone[]>(() => storage.getTimelines());
  const [leads, setLeads] = useState<EnrollmentLead[]>(() => storage.getLeads());

  // Modal States
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionModalStudentId, setSessionModalStudentId] = useState<string | undefined>();
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [shareSessionData, setShareSessionData] = useState<{ session: SessionRecord; student: Student } | null>(null);

  // Sync with persistent storage
  useEffect(() => {
    storage.saveCurrentUser(currentUser);
    if (currentUser) {
      setCurrentView('dashboard');
    }
  }, [currentUser]);

  useEffect(() => {
    storage.saveStudents(students);
  }, [students]);

  useEffect(() => {
    storage.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    storage.saveTimelines(timelines);
  }, [timelines]);

  useEffect(() => {
    storage.saveLeads(leads);
  }, [leads]);

  // Auth Handlers
  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  // Student Handlers
  const handleSaveStudent = (savedStudent: Student) => {
    const existingIndex = students.findIndex((s) => s.id === savedStudent.id);
    if (existingIndex >= 0) {
      const updated = [...students];
      updated[existingIndex] = savedStudent;
      setStudents(updated);
    } else {
      setStudents([savedStudent, ...students]);
      
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
      setTimelines([newMilestone, ...timelines]);
    }
    setIsStudentModalOpen(false);
    setStudentToEdit(null);
  };

  // Session Handlers
  const handleSaveSession = (newSessionData: Omit<SessionRecord, 'id' | 'createdAt'>) => {
    const newSession: SessionRecord = {
      ...newSessionData,
      id: `ses-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setSessions([newSession, ...sessions]);

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

      setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));

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
        setTimelines([milestone, ...timelines]);
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
    setLeads([newLead, ...leads]);
  };

  const handleAcceptLead = (lead: EnrollmentLead) => {
    const randomCode = Math.floor(100 + Math.random() * 900);
    // Convert Lead directly to a Student
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: lead.studentName,
      grade: lead.studentAge,
      subject: lead.subjectNeeded,
      parentName: lead.parentName,
      parentPhone: lead.phone,
      parentUsername: `${lead.parentName.split(' ')[0]}_${randomCode}`.toLowerCase(),
      parentPassword: Math.floor(100000 + Math.random() * 900000).toString(),
      parentAccessCode: `OFQ-${randomCode}`,
      currentLevel: 'المستوى الأول (تأسيسي)',
      levelScore: 75,
      totalSessions: 12,
      completedSessions: 0,
      remainingSessions: 12,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
      notes: lead.notes,
    };

    setStudents([newStudent, ...students]);
    setLeads(leads.map((l) => (l.id === lead.id ? { ...l, status: 'converted' } : l)));
  };

  // RENDER CURRENT VIEW
  return (
    <div className="min-h-screen bg-[#f0f7fc] text-slate-800 font-sans antialiased selection:bg-sky-100 selection:text-sky-800">
      {/* 1. Direct Login Gateway View */}
      {currentView === 'login' && (
        <LoginGateway
          teacherProfile={teacherProfile}
          students={students}
          onLoginSuccess={handleLoginSuccess}
          onNavigateToProfile={() => setCurrentView('profile')}
          onNavigateToEnroll={() => setCurrentView('enroll')}
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
              onShareSession={(session, student) => {
                setShareSessionData({ session, student });
              }}
              onAcceptLead={handleAcceptLead}
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
                  teacherProfile={teacherProfile}
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

