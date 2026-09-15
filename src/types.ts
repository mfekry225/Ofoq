export type Role = 'teacher' | 'parent';

export interface TeacherCredentials {
  email: string;
  password: string;
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

export interface Student {
  id: string;
  name: string;
  grade: string;
  subject: string;
  parentName: string;
  parentPhone: string;
  parentUsername: string; // Unique username for parent login
  parentPassword: string; // Password for parent login
  parentAccessCode?: string; // Optional access code reference
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
  phone?: string;
}
