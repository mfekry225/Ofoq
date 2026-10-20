import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  deleteField,
  onSnapshot,
  query,
  where,
  writeBatch,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { db, auth, getProvisioningAuth } from './firebase';
import {
  Student,
  SessionRecord,
  TimelineMilestone,
  EnrollmentLead,
  TeacherProfile,
  CompletedAssessmentRecord,
} from './types';

// ---------------------------------------------------------------------------
// أدوات عامة
// ---------------------------------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const info = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    uid: auth.currentUser?.uid ?? null,
  };
  console.warn('Firestore error:', JSON.stringify(info));
  return info;
}

// Firestore لا يقبل القيم undefined
function sanitize<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    clean[key] = value && typeof value === 'object' && !Array.isArray(value) ? sanitize(value) : value;
  }
  return clean;
}

export type CloudSyncStatus = 'connecting' | 'synced' | 'syncing' | 'offline' | 'error';

// حسابات أولياء الأمور تُنشأ باسم مستخدم فقط. داخلياً يُحوَّل الاسم إلى بريد وهمي
// لا يُرسَل إليه أي شيء ولا يراه أحد. غيّر النطاق هنا فقط إن احتجت (لا يؤثر على الأمان).
const PARENT_EMAIL_DOMAIN = 'ofoq-parents.invalid';
export const USERNAME_RULE = /^[a-z0-9][a-z0-9_-]{2,29}$/;
export const MIN_PARENT_PASSWORD = 8;

function identifierToEmail(identifier: string): string {
  const v = identifier.trim().toLowerCase();
  return v.includes('@') ? v : `${v}@${PARENT_EMAIL_DOMAIN}`;
}

const byDateDesc = <T extends Record<string, any>>(key: string) => (a: T, b: T) =>
  String(b[key] || '').localeCompare(String(a[key] || ''));

function toList<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => d.data() as T);
}

// ---------------------------------------------------------------------------
// الخدمة السحابية
// ---------------------------------------------------------------------------
export interface OwnerCallbacks {
  onStudents: (list: Student[]) => void;
  onSessions: (list: SessionRecord[]) => void;
  onTimelines: (list: TimelineMilestone[]) => void;
  onLeads: (list: EnrollmentLead[]) => void;
  onAssessments: (list: CompletedAssessmentRecord[]) => void;
  onStatusChange: (status: CloudSyncStatus, message?: string) => void;
}

export interface ParentCallbacks {
  onStudent: (student: Student | null) => void;
  onSessions: (list: SessionRecord[]) => void;
  onTimelines: (list: TimelineMilestone[]) => void;
  onAssessments: (list: CompletedAssessmentRecord[]) => void;
  onStatusChange: (status: CloudSyncStatus, message?: string) => void;
}

async function write(path: string, fn: () => Promise<unknown>, op: OperationType = OperationType.WRITE): Promise<boolean> {
  try {
    await fn();
    return true;
  } catch (err) {
    handleFirestoreError(err, op, path);
    return false;
  }
}

export const cloudService = {
  // ----- كتابة (الأخصائي فقط، باستثناء طلبات التسجيل والتقييمات كما تحددها القواعد) -----
  saveStudent: (student: Student) =>
    write(`students/${student.id}`, () => setDoc(doc(db, 'students', student.id), sanitize(student), { merge: true })),

  deleteStudent: (studentId: string) =>
    write(`students/${studentId}`, () => deleteDoc(doc(db, 'students', studentId)), OperationType.DELETE),

  saveSession: (session: SessionRecord) =>
    write(`sessions/${session.id}`, () => setDoc(doc(db, 'sessions', session.id), sanitize(session), { merge: true })),

  saveTimeline: (timeline: TimelineMilestone) =>
    write(`timelines/${timeline.id}`, () => setDoc(doc(db, 'timelines', timeline.id), sanitize(timeline), { merge: true })),

  saveLead: (lead: EnrollmentLead) =>
    write(`leads/${lead.id}`, () => setDoc(doc(db, 'leads', lead.id), sanitize(lead), { merge: true })),

  saveAssessment: (assessment: CompletedAssessmentRecord) =>
    write(`assessments/${assessment.id}`, () => setDoc(doc(db, 'assessments', assessment.id), sanitize(assessment), { merge: true })),

  deleteAssessment: (assessmentId: string) =>
    write(`assessments/${assessmentId}`, () => deleteDoc(doc(db, 'assessments', assessmentId)), OperationType.DELETE),

  saveProfile: (profile: TeacherProfile) =>
    write('app_settings/profile', () => setDoc(doc(db, 'app_settings', 'profile'), sanitize(profile), { merge: true })),

  // ----- الملف العام للأخصائي (متاح للزوار) -----
  subscribePublicProfile: (onProfile: (profile: TeacherProfile) => void): (() => void) =>
    onSnapshot(
      doc(db, 'app_settings', 'profile'),
      (snap) => {
        if (snap.exists()) onProfile(snap.data() as TeacherProfile);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'app_settings/profile')
    ),

  // ----- اشتراك الأخصائي: كل البيانات -----
  subscribeOwner: (cb: OwnerCallbacks): (() => void) => {
    cb.onStatusChange('syncing', 'جاري المزامنة...');
    const purged = new Set<string>();
    const fail = (path: string) => (err: Error) => {
      handleFirestoreError(err, OperationType.LIST, path);
      cb.onStatusChange('error', 'تعذر تحميل البيانات. تأكد من تسجيل الدخول ومن نشر قواعد Firestore.');
    };

    const unsubs = [
      onSnapshot(collection(db, 'students'), (snap) => {
        // تنظيف تلقائي لأي كلمات مرور قديمة كانت محفوظة نصاً داخل مستندات الطلاب
        snap.docs.forEach((d) => {
          const data = d.data();
          if (!purged.has(d.id) && ('parentPassword' in data || 'parentAccessCode' in data)) {
            purged.add(d.id);
            updateDoc(d.ref, { parentPassword: deleteField(), parentAccessCode: deleteField() }).catch(() => {});
          }
        });
        const list = toList<Student>(snap).map((s) => {
          const { parentPassword, parentAccessCode, ...safe } = s as Student & { parentPassword?: string; parentAccessCode?: string };
          return safe as Student;
        });
        cb.onStudents(list.sort(byDateDesc('joinedAt')));
        cb.onStatusChange('synced', 'متصل ومزامَن مع Firebase');
      }, fail('students')),
      onSnapshot(collection(db, 'sessions'), (snap) => cb.onSessions(toList<SessionRecord>(snap).sort(byDateDesc('date'))), fail('sessions')),
      onSnapshot(collection(db, 'timelines'), (snap) => cb.onTimelines(toList<TimelineMilestone>(snap).sort(byDateDesc('date'))), fail('timelines')),
      onSnapshot(collection(db, 'leads'), (snap) => cb.onLeads(toList<EnrollmentLead>(snap).sort(byDateDesc('createdAt'))), fail('leads')),
      onSnapshot(collection(db, 'assessments'), (snap) => cb.onAssessments(toList<CompletedAssessmentRecord>(snap).sort(byDateDesc('date'))), fail('assessments')),
    ];
    return () => unsubs.forEach((u) => u());
  },

  // ----- اشتراك ولي الأمر: ملف طفله فقط -----
  subscribeParent: (studentId: string, cb: ParentCallbacks): (() => void) => {
    cb.onStatusChange('syncing', 'جاري التحميل...');
    const fail = (path: string) => (err: Error) => {
      handleFirestoreError(err, OperationType.GET, path);
      cb.onStatusChange('error', 'تعذر تحميل البيانات. تواصل مع الأخصائي.');
    };
    const forStudent = (name: string) => query(collection(db, name), where('studentId', '==', studentId));

    const unsubs = [
      onSnapshot(doc(db, 'students', studentId), (snap) => {
        cb.onStudent(snap.exists() ? (snap.data() as Student) : null);
        cb.onStatusChange('synced', 'متصل');
      }, fail(`students/${studentId}`)),
      onSnapshot(forStudent('sessions'), (snap) => cb.onSessions(toList<SessionRecord>(snap).sort(byDateDesc('date'))), fail('sessions')),
      onSnapshot(forStudent('timelines'), (snap) => cb.onTimelines(toList<TimelineMilestone>(snap).sort(byDateDesc('date'))), fail('timelines')),
      onSnapshot(forStudent('assessments'), (snap) => cb.onAssessments(toList<CompletedAssessmentRecord>(snap).sort(byDateDesc('date'))), fail('assessments')),
    ];
    return () => unsubs.forEach((u) => u());
  },
};

// ---------------------------------------------------------------------------
// المصادقة
// ---------------------------------------------------------------------------
export type ResolvedRole =
  | { role: 'teacher'; user: FirebaseUser }
  | { role: 'parent'; user: FirebaseUser; studentId: string; username?: string };

const GENERIC_LOGIN_ERROR = 'اسم المستخدم أو كلمة المرور غير صحيحة.';

function authErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return GENERIC_LOGIN_ERROR;
    case 'auth/too-many-requests':
      return 'تم تعليق المحاولات مؤقتاً بسبب تكرار الخطأ. حاول لاحقاً.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالإنترنت.';
    case 'auth/operation-not-allowed':
      return 'تسجيل الدخول بالبريد وكلمة المرور غير مفعّل في Firebase Authentication.';
    default:
      return 'تعذر تسجيل الدخول. حاول مرة أخرى.';
  }
}

// الدور يُحدَّد من الخادم (مستندات admins و parents)، وليس من نص البريد ولا من المتصفح.
async function resolveRole(user: FirebaseUser): Promise<ResolvedRole | null> {
  try {
    const admin = await getDoc(doc(db, 'admins', user.uid));
    if (admin.exists()) return { role: 'teacher', user };
  } catch {
    // لا صلاحية = ليس أخصائياً
  }
  try {
    const parent = await getDoc(doc(db, 'parents', user.uid));
    const studentId = parent.exists() ? (parent.data().studentId as string | undefined) : undefined;
    if (studentId) return { role: 'parent', user, studentId, username: parent.data()?.username };
  } catch {
    // لا صلاحية = ليس ولي أمر
  }
  return null;
}

export const cloudAuth = {
  resolveRole,

  login: async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const id = identifier.trim();
    if (!id || !password) return { success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور.' };
    try {
      const cred = await signInWithEmailAndPassword(auth, identifierToEmail(id), password);
      const role = await resolveRole(cred.user);
      if (!role) {
        await signOut(auth);
        return { success: false, error: 'هذا الحساب غير مفعّل في المنصة. تواصل مع الأخصائي.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: authErrorMessage(err?.code) };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  },

  onAuthChange: (callback: (user: FirebaseUser | null) => void): (() => void) => onAuthStateChanged(auth, callback),

  getCurrentUser: (): FirebaseUser | null => auth.currentUser,

  // استعادة كلمة مرور الأخصائي عبر بريده الحقيقي فقط
  sendPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // لا نكشف إن كان البريد موجوداً أم لا
    }
    return { success: true, message: 'إن كان البريد مسجلاً فسيصله رابط إعادة التعيين.' };
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const user = auth.currentUser;
    if (!user?.email) return { success: false, error: 'لا توجد جلسة دخول نشطة.' };
    if (newPassword.length < MIN_PARENT_PASSWORD) {
      return { success: false, error: `كلمة المرور يجب ألا تقل عن ${MIN_PARENT_PASSWORD} خانات.` };
    }
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        return { success: false, error: 'كلمة المرور الحالية غير صحيحة.' };
      }
      return { success: false, error: 'تعذر تغيير كلمة المرور. حاول مرة أخرى.' };
    }
  },

  // إنشاء حساب ولي الأمر (الأخصائي فقط). كلمة المرور لا تُحفظ في أي مكان.
  createParentAccount: async (
    student: Student,
    rawUsername: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const username = rawUsername.trim().toLowerCase();
    if (!USERNAME_RULE.test(username)) {
      return { success: false, error: 'اسم المستخدم: من 3 إلى 30 خانة، أحرف إنجليزية صغيرة وأرقام و(-) أو (_) فقط.' };
    }
    if (password.length < MIN_PARENT_PASSWORD) {
      return { success: false, error: `كلمة المرور يجب ألا تقل عن ${MIN_PARENT_PASSWORD} خانات.` };
    }
    if (!auth.currentUser) return { success: false, error: 'سجّل الدخول كأخصائي أولاً.' };

    const provisioning = getProvisioningAuth();
    let uid: string;
    try {
      const cred = await createUserWithEmailAndPassword(provisioning, identifierToEmail(username), password);
      uid = cred.user.uid;
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        return { success: false, error: 'اسم المستخدم مستخدم من قبل. اختر اسماً آخر.' };
      }
      return { success: false, error: authErrorMessage(err?.code) };
    } finally {
      try {
        await signOut(provisioning);
      } catch {
        // تجاهل
      }
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'parents', uid), {
        studentId: student.id,
        username,
        createdAt: new Date().toISOString(),
      });
      batch.set(doc(db, 'students', student.id), { parentUid: uid, parentUsername: username }, { merge: true });
      if (student.parentUid && student.parentUid !== uid) {
        batch.delete(doc(db, 'parents', student.parentUid)); // إلغاء الحساب السابق
      }
      await batch.commit();
      return { success: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `parents/${uid}`);
      return { success: false, error: 'تم إنشاء الحساب لكن تعذر ربطه بالطالب. تأكد من نشر قواعد Firestore وحاول مجدداً باسم مستخدم جديد.' };
    }
  },

  // إلغاء وصول ولي الأمر فوراً (حذف الربط يمنعه من قراءة أي بيانات)
  revokeParentAccess: async (student: Student): Promise<boolean> => {
    if (!student.parentUid) return true;
    return write(`parents/${student.parentUid}`, async () => {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'parents', student.parentUid!));
      batch.update(doc(db, 'students', student.id), { parentUid: deleteField(), parentUsername: deleteField() });
      await batch.commit();
    });
  },
};
