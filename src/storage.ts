import { TeacherProfile } from './types';
import { INITIAL_TEACHER_PROFILE } from './mockData';

// لا تُخزَّن هنا أي بيانات طلاب أو جلسات أو تقييمات أو بيانات دخول.
// يُحفظ فقط: الملف العام للأخصائي (بيانات علنية) وتفضيل المظهر.
const KEYS = {
  TEACHER_PROFILE: 'ofoq_v3_public_profile',
  THEME: 'ofoq_v2_daylight_theme',
};

// مفاتيح قديمة كانت تحتفظ ببيانات الأطفال وكلمات المرور محلياً في المتصفح.
const LEGACY_KEYS = [
  'ofoq_v1_teacher_credentials',
  'ofoq_v1_students',
  'ofoq_v1_sessions',
  'ofoq_v1_timelines',
  'ofoq_v1_leads',
  'ofoq_v1_assessments',
  'ofoq_v1_current_user',
  'ofoq_v2_teacher_profile',
  'ofoq_owner_pass_hash',
];

export const storage = {
  // يمسح البيانات الحساسة التي خزّنتها النسخ القديمة من التطبيق على هذا الجهاز.
  purgeLegacy: () => {
    try {
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      // تجاهل
    }
  },

  getTeacherProfile: (): TeacherProfile => {
    try {
      const data = localStorage.getItem(KEYS.TEACHER_PROFILE);
      return data ? { ...INITIAL_TEACHER_PROFILE, ...JSON.parse(data) } : INITIAL_TEACHER_PROFILE;
    } catch {
      return INITIAL_TEACHER_PROFILE;
    }
  },
  saveTeacherProfile: (profile: TeacherProfile) => {
    try {
      localStorage.setItem(KEYS.TEACHER_PROFILE, JSON.stringify(profile));
    } catch {
      // تجاهل
    }
  },

  getTheme: (): 'light' | 'dark' => {
    try {
      return localStorage.getItem(KEYS.THEME) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },
  saveTheme: (theme: 'light' | 'dark') => {
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch {
      // تجاهل
    }
  },
};
