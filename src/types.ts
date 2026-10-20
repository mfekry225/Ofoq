export type Role = 'teacher' | 'parent';

export interface SpecialistDuty {
  title: string;
  description: string;
  icon?: string;
}

export interface FamilySupportItem {
  title: string;
  description: string;
  icon?: string;
}

export interface TeacherProfile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  experienceYears: number;
  location?: string;
  portfolioUrl?: string;
  phone: string;
  email: string;
  whatsapp: string;
  subjects: string[];
  certifications?: string[];
  specialistDuties?: SpecialistDuty[];
  familySupport?: FamilySupportItem[];
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  stats: {
    label: string;
    value: string;
  }[];
}

export interface CompletedAssessmentRecord {
  id: string;
  studentId?: string;
  studentName?: string;
  scaleId: 'language' | 'autism' | 'developmental_learning' | 'stuttering';
  scaleTitle: string;
  childName: string;
  childAge?: string;
  evaluatorName?: string; // ولي الأمر أو الأخصائي
  evaluatorRole?: 'parent' | 'teacher';
  scores: Record<number, number>; // questionId -> 0 | 1 | 2
  totalScore: number; // 0 to 20
  riskLevel: 'low' | 'moderate' | 'high';
  riskLabel: string;
  summary?: string;
  advice?: string[];
  date: string;
  createdAt?: string;
  notes?: string;
  viewedByTeacher?: boolean;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  subject: string;
  birthDate?: string; // تاريخ الميلاد YYYY-MM-DD
  address?: string; // العنوان أو المنطقة السكنية
  diagnosis?: string; // التشخيص الطبي / التأهيلي
  parentName: string;
  parentPhone: string;
  motherPhone?: string; // رقم الأم (واتساب / اتصال)
  parentUsername?: string; // اسم مستخدم حساب ولي الأمر (للعرض فقط، كلمة المرور لا تُحفظ إطلاقاً)
  parentUid?: string; // معرّف حساب ولي الأمر في Firebase Auth
  currentLevel: string; // e.g. 'مبتدئ متميز', 'متوسط متقدم', 'مستوى 4 - ممتاز'
  levelScore: number; // 0 - 100
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  nextSessionDate?: string;
  nextSessionTime?: string;
  notes?: string;
  assessments?: CompletedAssessmentRecord[];
  hasNewAssessment?: boolean;
  lastAssessmentDate?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  durationMinutes: number;
  status: 'mastered' | 'practicing' | 'needs_review';
  category: string;
}

export interface SessionRecord {
  id: string;
  studentId: string;
  studentName: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: 'attended' | 'absent' | 'excused' | 'scheduled';
  
  // 1. قبل الجلسة (Pre-session)
  preSessionNotes: string;
  previousHomeworkStatus: 'completed' | 'partial' | 'not_done' | 'not_assigned';
  
  // 2. أثناء الجلسة (During-session)
  topic: string;
  activities: ActivityItem[];
  studentEngagementScore: number; // 1 to 5
  
  // 3. بعد الجلسة والتقييم (Post-session)
  understandingScore: number; // 1 to 5
  studentStrengths: string;
  areasToImprove: string;
  nextPlan: string; // ما يجب تدريبه لاحقاً
  homeworkAssigned: string;
  teacherNoteToParent: string;
  
  createdAt: string;
}

export interface TimelineMilestone {
  id: string;
  studentId: string;
  date: string;
  title: string;
  description: string;
  levelBadge: string;
  type: 'achievement' | 'level_up' | 'assessment' | 'milestone';
}

export interface EnrollmentLead {
  id: string;
  parentName: string;
  studentName: string;
  studentAge: string;
  subjectNeeded: string;
  phone: string;
  motherPhone?: string; // رقم الأم
  preferredTime: string;
  notes: string;
  status: 'new' | 'contacted' | 'converted' | 'cancelled';
  createdAt: string;
}

export interface AbsenceExcuseRequest {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  sessionDate: string;
  reason: string;
  suggestedAlternativeDate?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface CurrentUser {
  role: Role;
  studentId?: string; // If role is parent, holds the studentId
  name: string;
  email?: string;
  phone?: string;
  student?: Student;
}
