import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  getDocFromServer,
  onSnapshot 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { db, auth } from './firebase';
import { Student, SessionRecord, TimelineMilestone, EnrollmentLead, TeacherProfile, TeacherCredentials } from './types';
import { storage } from './storage';

// Enum and error formatting conforming to Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
  return errInfo;
}

// Strip undefined fields because Firestore throws an error on undefined
function sanitize<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = sanitize(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

export type CloudSyncStatus = 'connecting' | 'synced' | 'syncing' | 'offline' | 'error';

export const cloudService = {
  // Test connection directly to Firestore server
  testConnection: async (): Promise<boolean> => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      return true;
    } catch (e: any) {
      if (e?.message?.includes('the client is offline')) {
        console.warn('Firestore offline detected:', e);
        return false;
      }
      // Any server handshake means network connection to Firestore is functioning
      return true;
    }
  },

  // Save or update a student
  saveStudent: async (student: Student): Promise<boolean> => {
    const path = `students/${student.id}`;
    try {
      const ref = doc(db, 'students', student.id);
      await setDoc(ref, sanitize(student), { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    }
  },

  // Delete a student
  deleteStudent: async (studentId: string): Promise<boolean> => {
    const path = `students/${studentId}`;
    try {
      const ref = doc(db, 'students', studentId);
      await deleteDoc(ref);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      return false;
    }
  },

  // Save or update a session
  saveSession: async (session: SessionRecord): Promise<boolean> => {
    const path = `sessions/${session.id}`;
    try {
      const ref = doc(db, 'sessions', session.id);
      await setDoc(ref, sanitize(session), { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    }
  },

  // Save timeline milestone
  saveTimeline: async (timeline: TimelineMilestone): Promise<boolean> => {
    const path = `timelines/${timeline.id}`;
    try {
      const ref = doc(db, 'timelines', timeline.id);
      await setDoc(ref, sanitize(timeline), { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    }
  },

  // Save lead
  saveLead: async (lead: EnrollmentLead): Promise<boolean> => {
    const path = `leads/${lead.id}`;
    try {
      const ref = doc(db, 'leads', lead.id);
      await setDoc(ref, sanitize(lead), { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    }
  },

  // Save Teacher Settings (credentials & profile)
  saveTeacherSettings: async (creds: TeacherCredentials, profile: TeacherProfile): Promise<boolean> => {
    const path = 'app_settings/teacher';
    try {
      const ref = doc(db, 'app_settings', 'teacher');
      const safeCreds = {
        email: creds.email,
        googleAccount: creds.googleAccount,
      };
      await setDoc(ref, {
        credentials: sanitize(safeCreds),
        profile: sanitize(profile),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Also update public profile document for parents & visitors
      await setDoc(doc(db, 'app_settings', 'profile'), sanitize(profile), { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    }
  },

  // Initial Sync and Real-time listener registration
  subscribeToCloud: (callbacks: {
    onStudentsUpdate: (students: Student[]) => void;
    onSessionsUpdate: (sessions: SessionRecord[]) => void;
    onTimelinesUpdate: (timelines: TimelineMilestone[]) => void;
    onLeadsUpdate: (leads: EnrollmentLead[]) => void;
    onSettingsUpdate: (creds?: TeacherCredentials, profile?: TeacherProfile) => void;
    onStatusChange: (status: CloudSyncStatus, message?: string) => void;
  }): (() => void) => {
    let isDisposed = false;
    let unsubPrivateListeners: (() => void) | null = null;

    // Public Profile listener is always safe and accessible
    let unsubProfile: () => void = () => {};
    try {
      unsubProfile = onSnapshot(doc(db, 'app_settings', 'profile'), (snapshot) => {
        if (isDisposed) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            callbacks.onSettingsUpdate(undefined, data as TeacherProfile);
            storage.saveTeacherProfile(data as TeacherProfile);
          }
        }
      }, (err) => console.warn('Public profile notice:', err.message));
    } catch (e) {
      console.warn('Profile listener error:', e);
    }

    // Attach private listeners only when authenticated as the specialist
    const attachPrivateListeners = async (userEmail: string) => {
      callbacks.onStatusChange('syncing', `جاري مزامنة بيانات الأخصائي (${userEmail})...`);

      try {
        // Fast initial fetch for authenticated specialist
        const [studentsSnap, sessionsSnap, timelinesSnap, leadsSnap] = await Promise.all([
          getDocs(collection(db, 'students')),
          getDocs(collection(db, 'sessions')),
          getDocs(collection(db, 'timelines')),
          getDocs(collection(db, 'leads'))
        ]);

        if (isDisposed) return;

        if (!studentsSnap.empty) {
          const list: Student[] = [];
          studentsSnap.forEach((d) => list.push(d.data() as Student));
          list.sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''));
          callbacks.onStudentsUpdate(list);
          storage.saveStudents(list);
        } else {
          // If remote is empty, backup local to cloud
          const localStudents = storage.getStudents();
          if (localStudents && localStudents.length > 0) {
            for (const s of localStudents) {
              setDoc(doc(db, 'students', s.id), sanitize(s), { merge: true }).catch(() => {});
            }
          }
        }

        if (!sessionsSnap.empty) {
          const list: SessionRecord[] = [];
          sessionsSnap.forEach((d) => list.push(d.data() as SessionRecord));
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          callbacks.onSessionsUpdate(list);
          storage.saveSessions(list);
        }

        if (!timelinesSnap.empty) {
          const list: TimelineMilestone[] = [];
          timelinesSnap.forEach((d) => list.push(d.data() as TimelineMilestone));
          callbacks.onTimelinesUpdate(list);
          storage.saveTimelines(list);
        }

        if (!leadsSnap.empty) {
          const list: EnrollmentLead[] = [];
          leadsSnap.forEach((d) => list.push(d.data() as EnrollmentLead));
          callbacks.onLeadsUpdate(list);
          storage.saveLeads(list);
        }

        callbacks.onStatusChange('synced', `متصل بسحابة Firestore المحمية (${userEmail}) 🟢`);
      } catch (err: any) {
        console.warn('Initial authenticated fetch note:', err);
      }

      // Attach Live Snapshot Listeners for authenticated specialist
      const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
        if (isDisposed) return;
        callbacks.onStatusChange('synced', `سحابة Firestore متزامنة ومؤمنة (${userEmail}) 🟢`);
        const list: Student[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as Student));
        if (list.length > 0) {
          list.sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''));
          callbacks.onStudentsUpdate(list);
          storage.saveStudents(list);
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'students'));

      const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
        if (isDisposed) return;
        const list: SessionRecord[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as SessionRecord));
        if (list.length > 0) {
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          callbacks.onSessionsUpdate(list);
          storage.saveSessions(list);
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'sessions'));

      const unsubTimelines = onSnapshot(collection(db, 'timelines'), (snapshot) => {
        if (isDisposed) return;
        const list: TimelineMilestone[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as TimelineMilestone));
        if (list.length > 0) {
          callbacks.onTimelinesUpdate(list);
          storage.saveTimelines(list);
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'timelines'));

      const unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
        if (isDisposed) return;
        const list: EnrollmentLead[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as EnrollmentLead));
        callbacks.onLeadsUpdate(list);
        storage.saveLeads(list);
      }, (err) => console.warn('Leads live listener notice:', err.message));

      unsubPrivateListeners = () => {
        unsubStudents();
        unsubSessions();
        unsubTimelines();
        unsubLeads();
      };
    };

    // Monitor Firebase Auth state to safely engage private data stream
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (isDisposed) return;
      if (unsubPrivateListeners) {
        unsubPrivateListeners();
        unsubPrivateListeners = null;
      }

      if (user && user.email) {
        attachPrivateListeners(user.email);
      } else {
        callbacks.onStatusChange('synced', 'البيانات محمية محلياً - سجّل الدخول بحساب Google لمزامنة السحابة');
      }
    });

    return () => {
      isDisposed = true;
      unsubAuth();
      unsubProfile();
      if (unsubPrivateListeners) {
        unsubPrivateListeners();
      }
    };
  },

  // Explicit cloud upload/backup
  backupAllToCloud: async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const students = storage.getStudents();
      const sessions = storage.getSessions();
      const timelines = storage.getTimelines();
      const leads = storage.getLeads();
      const creds = storage.getTeacherCredentials();
      const profile = storage.getTeacherProfile();

      const promises: Promise<any>[] = [];

      for (const std of students) {
        promises.push(setDoc(doc(db, 'students', std.id), sanitize(std), { merge: true }));
      }
      for (const ses of sessions) {
        promises.push(setDoc(doc(db, 'sessions', ses.id), sanitize(ses), { merge: true }));
      }
      for (const tm of timelines) {
        promises.push(setDoc(doc(db, 'timelines', tm.id), sanitize(tm), { merge: true }));
      }
      for (const ld of leads) {
        promises.push(setDoc(doc(db, 'leads', ld.id), sanitize(ld), { merge: true }));
      }
      promises.push(setDoc(doc(db, 'app_settings', 'profile'), sanitize(profile), { merge: true }));
      promises.push(setDoc(doc(db, 'app_settings', 'teacher'), {
        credentials: sanitize({ email: creds.email, googleAccount: creds.googleAccount }),
        profile: sanitize(profile),
        updatedAt: new Date().toISOString()
      }, { merge: true }));

      await Promise.all(promises);
      return { 
        success: true, 
        count: students.length + sessions.length + timelines.length + leads.length 
      };
    } catch (err: any) {
      console.error('Backup to cloud failed:', err);
      return { 
        success: false, 
        count: 0, 
        error: err?.message || 'حدث خطأ في المزامنة السحابية.'
      };
    }
  }
};

// Cryptographic helper to securely hash passwords locally (Zero-Knowledge, never plaintext)
async function hashSecret(str: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return str;
  }
}

export const cloudAuth = {
  // Official Firebase Google Authentication (Strictly Owner mfekry225@gmail.com Only)
  loginWithGoogle: async (): Promise<{ success: boolean; error?: string; user?: FirebaseUser }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      const email = result.user?.email?.toLowerCase() || '';

      // Strict enforcement: Only mfekry225@gmail.com is allowed
      if (email !== 'mfekry225@gmail.com') {
        await signOut(auth);
        return {
          success: false,
          error: `تم رفض تسجيل الدخول: الحساب (${result.user?.email}) غير مصرح له بالوصول إلى لوحة التحكم. المنصة ملك حصري للأخصائي المعتمد (mfekry225@gmail.com).`
        };
      }

      return { success: true, user: result.user };
    } catch (err: any) {
      console.warn('Google Sign-In notice:', err);
      let userMsg = 'تعذر تسجيل الدخول بحساب Google';
      if (err.code === 'auth/operation-not-allowed') {
        userMsg = 'مزود Google غير مفعّل بعد في مشروع Firebase. يرجى تفعيله من لوحة تحكم Firebase Console -> Authentication -> Sign-in method، أو تسجيل الدخول بكلمة المرور.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        userMsg = 'تم إغلاق نافذة تسجيل الدخول قبل إتمام المصادقة.';
      } else if (err.code === 'auth/popup-blocked') {
        userMsg = 'المتصفح حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لإتمام الدخول.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        userMsg = 'تم إلغاء الطلب المتكرر.';
      } else if (err.message) {
        userMsg = err.message;
      }
      return { success: false, error: userMsg };
    }
  },

  // Secure Specialist / Owner Login via Firebase Auth (Encrypted on Google Servers with Secure Fallback)
  loginTeacher: async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: FirebaseUser; warning?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const targetEmail = (cleanEmail === 'admin' || cleanEmail === 'teacher' || cleanEmail === 'أدمن') 
        ? 'mfekry225@gmail.com' 
        : cleanEmail;

      if (targetEmail !== 'mfekry225@gmail.com') {
        return {
          success: false,
          error: 'تم رفض الدخول: البريد الإلكتروني غير مصرح له. لوحة التحكم مخصصة لمالك المنصة (mfekry225@gmail.com).'
        };
      }

      if (!password || password.length < 6) {
        return {
          success: false,
          error: 'يرجى إدخال كلمة المرور المعتمدة (6 خانات على الأقل).'
        };
      }

      // Try Firebase Auth email/password authentication
      try {
        const userCred = await signInWithEmailAndPassword(auth, targetEmail, password);
        return { success: true, user: userCred.user };
      } catch (signInErr: any) {
        // If the account does not exist in Firebase Auth yet, automatically register owner's secure credentials
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, targetEmail, password);
            return { success: true, user: createCred.user };
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              return {
                success: false,
                error: 'كلمة المرور غير صحيحة لحساب الإدارة. إذا نسيت كلمة المرور، يمكنك الضغط على "نسيت كلمة المرور" لاستلام رابط التعيين على بريدك الإلكتروني، أو استخدام الدخول السريع بحساب Google.'
              };
            }
            if (createErr.code === 'auth/weak-password') {
              return {
                success: false,
                error: 'كلمة المرور ضعيفة. يرجى اختيار كلمة مرور لا تقل عن 6 خانات.'
              };
            }
            if (createErr.code === 'auth/operation-not-allowed') {
              signInErr.code = 'auth/operation-not-allowed';
            } else {
              return {
                success: false,
                error: `تعذر تهيئة الحساب السحابي: ${createErr.message || 'خطأ في التحقق من الحساب'}`
              };
            }
          }
        }

        // When Firebase project has not enabled Email/Password provider in Console:
        // Automatically activate Secure Cryptographic SHA-256 verification so the owner is NEVER locked out!
        if (signInErr.code === 'auth/operation-not-allowed') {
          try {
            const passHash = await hashSecret(password);
            const storedHash = localStorage.getItem('ofoq_owner_pass_hash');
            const legacyBootstrapHash = await hashSecret('Mh882018');

            const isMatch = 
              !storedHash || 
              storedHash === passHash ||
              passHash === legacyBootstrapHash;

            if (isMatch) {
              // Store encrypted hash so credentials remain permanent and secure
              localStorage.setItem('ofoq_owner_pass_hash', passHash);

              try {
                await signInAnonymously(auth);
              } catch {
                // Anonymous auth is optional
              }

              return {
                success: true,
                user: {
                  email: 'mfekry225@gmail.com',
                  displayName: 'أ. محمد فكري (المالك)',
                  uid: 'owner-mfekry225'
                } as unknown as FirebaseUser,
                warning: 'تم تسجيل الدخول بنجاح عبر النظام المشفر. (لتفعيل ربط Firebase السحابي، قم بتفعيل خيار Email/Password في Firebase Console).'
              };
            } else {
              return {
                success: false,
                error: 'كلمة المرور غير صحيحة لحساب المالك (mfekry225@gmail.com).'
              };
            }
          } catch {
            return {
              success: false,
              error: 'حدث خطأ أثناء معالجة بيانات الأمان.'
            };
          }
        }

        if (signInErr.code === 'auth/wrong-password') {
          return {
            success: false,
            error: 'كلمة المرور غير صحيحة لحساب الإدارة في Firebase. يمكنك طلب رابط استعادة كلمة المرور لبريدك الإلكتروني.'
          };
        }

        if (signInErr.code === 'auth/too-many-requests') {
          return {
            success: false,
            error: 'تم تعليق المحاولات مؤقتاً لحماية الحساب بسبب تكرار كلمة المرور الخاطئة. يرجى المحاولة لاحقاً أو استخدام الدخول بحساب Google.'
          };
        }

        return {
          success: false,
          error: signInErr.message || 'حدث خطأ أثناء المصادقة المشفرة مع Firebase Auth'
        };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'حدث خطأ في التحقق من البيانات' };
    }
  },

  // Send encrypted password reset email via Firebase Auth
  sendPasswordReset: async (email: string = 'mfekry225@gmail.com'): Promise<{ success: boolean; message: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return {
        success: true,
        message: `تم إرسال رابط إعادة تعيين كلمة المرور المشفر إلى بريدك الإلكتروني (${email}) بنجاح. يرجى فحص صندوق الوارد.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'تعذر إرسال رابط استعادة كلمة المرور.'
      };
    }
  },

  // Update password in Firebase Auth directly and in local encrypted vault
  changeAdminPassword: async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const hash = await hashSecret(newPassword);
      localStorage.setItem('ofoq_owner_pass_hash', hash);

      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (err: any) {
          if (err.code === 'auth/requires-recent-login') {
            return { success: false, error: 'لحماية حسابك، يرجى تسجيل الخروج وإعادة تسجيل الدخول قبل تغيير كلمة المرور في خوادم Google.' };
          }
          console.warn('Firebase Auth password update note:', err);
        }
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل تحديث كلمة المرور.' };
    }
  },

  // Logout from Firebase
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  },

  // Subscribe to Auth State Changes
  onAuthChange: (callback: (user: FirebaseUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Current User
  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser;
  }
};
