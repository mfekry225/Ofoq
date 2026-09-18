import { TeacherProfile, Student, SessionRecord, TimelineMilestone, EnrollmentLead, CurrentUser, TeacherCredentials } from './types';
import { INITIAL_TEACHER_PROFILE, INITIAL_STUDENTS, INITIAL_SESSIONS, INITIAL_TIMELINES, INITIAL_LEADS, DEFAULT_TEACHER_CREDENTIALS } from './mockData';

const STORAGE_KEYS = {
  TEACHER_PROFILE: 'ofoq_v1_teacher_profile',
  TEACHER_CREDS: 'ofoq_v1_teacher_credentials',
  STUDENTS: 'ofoq_v1_students',
  SESSIONS: 'ofoq_v1_sessions',
  TIMELINES: 'ofoq_v1_timelines',
  LEADS: 'ofoq_v1_leads',
  AUTH: 'ofoq_v1_current_user',
  THEME: 'ofoq_v1_theme'
};

export const storage = {
  getTeacherCredentials: (): TeacherCredentials => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHER_CREDS);
      if (data) {
        const parsed = JSON.parse(data);
        // Automatically migrate legacy default password '123' to 'Mh882018'
        if (parsed.password === '123') {
          parsed.password = 'Mh882018';
          localStorage.setItem(STORAGE_KEYS.TEACHER_CREDS, JSON.stringify(parsed));
        }
        if (!parsed.googleAccount) {
          parsed.googleAccount = DEFAULT_TEACHER_CREDENTIALS.googleAccount;
          localStorage.setItem(STORAGE_KEYS.TEACHER_CREDS, JSON.stringify(parsed));
        }
        return parsed;
      }
      return DEFAULT_TEACHER_CREDENTIALS;
    } catch {
      return DEFAULT_TEACHER_CREDENTIALS;
    }
  },
  saveTeacherCredentials: (creds: TeacherCredentials) => {
    localStorage.setItem(STORAGE_KEYS.TEACHER_CREDS, JSON.stringify(creds));
  },

  getTeacherProfile: (): TeacherProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHER_PROFILE);
      return data ? JSON.parse(data) : INITIAL_TEACHER_PROFILE;
    } catch {
      return INITIAL_TEACHER_PROFILE;
    }
  },
  saveTeacherProfile: (profile: TeacherProfile) => {
    localStorage.setItem(STORAGE_KEYS.TEACHER_PROFILE, JSON.stringify(profile));
  },

  getStudents: (): Student[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  },
  saveStudents: (students: Student[]) => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getSessions: (): SessionRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  },
  saveSessions: (sessions: SessionRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getTimelines: (): TimelineMilestone[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMELINES);
      return data ? JSON.parse(data) : INITIAL_TIMELINES;
    } catch {
      return INITIAL_TIMELINES;
    }
  },
  saveTimelines: (timelines: TimelineMilestone[]) => {
    localStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(timelines));
  },

  getLeads: (): EnrollmentLead[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADS);
      return data ? JSON.parse(data) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  },
  saveLeads: (leads: EnrollmentLead[]) => {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  },

  getCurrentUser: (): CurrentUser | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveCurrentUser: (user: CurrentUser | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  },

  getTheme: (): 'light' | 'dark' => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  },
  saveTheme: (theme: 'light' | 'dark') => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {}
  }
};

