import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { Student, SessionRecord, TimelineMilestone, EnrollmentLead, TeacherProfile, TeacherCredentials } from './types';
import { storage } from './storage';

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
  // Test connection to Firestore
  testConnection: async (): Promise<boolean> => {
    try {
      const snap = await getDocs(collection(db, 'students'));
      return snap !== undefined;
    } catch (e) {
      console.warn('Firestore connection test failed:', e);
      return false;
    }
  },

  // Save or update a student
  saveStudent: async (student: Student): Promise<void> => {
    try {
      const ref = doc(db, 'students', student.id);
      await setDoc(ref, sanitize(student), { merge: true });
    } catch (err) {
      console.warn('Firestore saveStudent fallback to local:', err);
    }
  },

  // Delete a student
  deleteStudent: async (studentId: string): Promise<void> => {
    try {
      const ref = doc(db, 'students', studentId);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore deleteStudent error:', err);
    }
  },

  // Save or update a session
  saveSession: async (session: SessionRecord): Promise<void> => {
    try {
      const ref = doc(db, 'sessions', session.id);
      await setDoc(ref, sanitize(session), { merge: true });
    } catch (err) {
      console.warn('Firestore saveSession fallback:', err);
    }
  },

  // Save timeline milestone
  saveTimeline: async (timeline: TimelineMilestone): Promise<void> => {
    try {
      const ref = doc(db, 'timelines', timeline.id);
      await setDoc(ref, sanitize(timeline), { merge: true });
    } catch (err) {
      console.warn('Firestore saveTimeline error:', err);
    }
  },

  // Save lead
  saveLead: async (lead: EnrollmentLead): Promise<void> => {
    try {
      const ref = doc(db, 'leads', lead.id);
      await setDoc(ref, sanitize(lead), { merge: true });
    } catch (err) {
      console.warn('Firestore saveLead error:', err);
    }
  },

  // Save Teacher Settings (credentials & profile)
  saveTeacherSettings: async (creds: TeacherCredentials, profile: TeacherProfile): Promise<void> => {
    try {
      const ref = doc(db, 'app_settings', 'teacher');
      await setDoc(ref, {
        credentials: sanitize(creds),
        profile: sanitize(profile),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveTeacherSettings error:', err);
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
    callbacks.onStatusChange('connecting', 'جاري الاتصال بقاعدة بيانات Firestore السحابية...');

    let isDisposed = false;
    let hasConnected = false;

    // Safety timeout: if Firestore does not respond within 4.5 seconds, switch to offline mode
    const connectionTimeout = setTimeout(() => {
      if (!hasConnected && !isDisposed) {
        callbacks.onStatusChange('offline', 'وضع التخزين المحلي الآمن (غير متصل بالسحابة)');
      }
    }, 4500);

    const markSynced = () => {
      if (!hasConnected && !isDisposed) {
        hasConnected = true;
        clearTimeout(connectionTimeout);
        callbacks.onStatusChange('synced', 'متصل بالسحابة (Firestore) - البيانات محدثة ومحمية ✅');
      }
    };

    // 1. Immediate fast-fetch via getDocs for instant handshake
    (async () => {
      try {
        const [studentsSnap, sessionsSnap, timelinesSnap, leadsSnap, settingsSnap] = await Promise.all([
          getDocs(collection(db, 'students')),
          getDocs(collection(db, 'sessions')),
          getDocs(collection(db, 'timelines')),
          getDocs(collection(db, 'leads')),
          getDoc(doc(db, 'app_settings', 'teacher'))
        ]);

        if (isDisposed) return;
        markSynced();

        // Process Students
        if (!studentsSnap.empty) {
          const list: Student[] = [];
          studentsSnap.forEach((d) => list.push(d.data() as Student));
          list.sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''));
          callbacks.onStudentsUpdate(list);
          storage.saveStudents(list);
        } else {
          // If Firestore is empty but local has data, upload local data
          const localStudents = storage.getStudents();
          if (localStudents && localStudents.length > 0) {
            callbacks.onStatusChange('syncing', 'جاري مزامنة بيانات الطلاب مع السحابة...');
            for (const s of localStudents) {
              setDoc(doc(db, 'students', s.id), sanitize(s), { merge: true }).catch(() => {});
            }
          }
        }

        // Process Sessions
        if (!sessionsSnap.empty) {
          const list: SessionRecord[] = [];
          sessionsSnap.forEach((d) => list.push(d.data() as SessionRecord));
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          callbacks.onSessionsUpdate(list);
          storage.saveSessions(list);
        }

        // Process Timelines
        if (!timelinesSnap.empty) {
          const list: TimelineMilestone[] = [];
          timelinesSnap.forEach((d) => list.push(d.data() as TimelineMilestone));
          callbacks.onTimelinesUpdate(list);
          storage.saveTimelines(list);
        }

        // Process Leads
        if (!leadsSnap.empty) {
          const list: EnrollmentLead[] = [];
          leadsSnap.forEach((d) => list.push(d.data() as EnrollmentLead));
          callbacks.onLeadsUpdate(list);
          storage.saveLeads(list);
        }

        // Process Settings
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data?.credentials) {
            callbacks.onSettingsUpdate(data.credentials as TeacherCredentials, data.profile as TeacherProfile);
            storage.saveTeacherCredentials(data.credentials as TeacherCredentials);
          }
          if (data?.profile) {
            storage.saveTeacherProfile(data.profile as TeacherProfile);
          }
        }
      } catch (e) {
        console.warn('Initial fast getDocs check note:', e);
      }
    })();

    // 2. Real-time Listeners
    let unsubStudents: () => void = () => {};
    let unsubSessions: () => void = () => {};
    let unsubTimelines: () => void = () => {};
    let unsubLeads: () => void = () => {};
    let unsubSettings: () => void = () => {};

    try {
      // Students Listener
      unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
        if (isDisposed) return;
        markSynced();
        const list: Student[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Student);
        });
        list.sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''));
        callbacks.onStudentsUpdate(list);
        storage.saveStudents(list);
      }, (err) => {
        console.warn('Students listener note:', err);
        if (!hasConnected) {
          callbacks.onStatusChange('offline', 'وضع التخزين المحلي الآمن (غير متصل بالسحابة)');
        }
      });

      // Sessions Listener
      unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
        if (isDisposed) return;
        markSynced();
        const list: SessionRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SessionRecord);
        });
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        callbacks.onSessionsUpdate(list);
        storage.saveSessions(list);
      }, (err) => console.warn('Sessions listener note:', err));

      // Timelines Listener
      unsubTimelines = onSnapshot(collection(db, 'timelines'), (snapshot) => {
        if (isDisposed) return;
        markSynced();
        const list: TimelineMilestone[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as TimelineMilestone);
        });
        callbacks.onTimelinesUpdate(list);
        storage.saveTimelines(list);
      }, (err) => console.warn('Timelines listener note:', err));

      // Leads Listener
      unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
        if (isDisposed) return;
        markSynced();
        const list: EnrollmentLead[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as EnrollmentLead);
        });
        callbacks.onLeadsUpdate(list);
        storage.saveLeads(list);
      }, (err) => console.warn('Leads listener note:', err));

      // Settings Listener
      unsubSettings = onSnapshot(doc(db, 'app_settings', 'teacher'), (snapshot) => {
        if (isDisposed) return;
        markSynced();
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.credentials) {
            callbacks.onSettingsUpdate(data.credentials as TeacherCredentials, data.profile as TeacherProfile);
            storage.saveTeacherCredentials(data.credentials as TeacherCredentials);
          }
          if (data?.profile) {
            storage.saveTeacherProfile(data.profile as TeacherProfile);
          }
        }
      }, (err) => console.warn('Settings listener note:', err));

    } catch (err) {
      console.warn('Listeners init note:', err);
      callbacks.onStatusChange('offline', 'وضع التخزين المحلي الآمن');
    }

    return () => {
      isDisposed = true;
      clearTimeout(connectionTimeout);
      unsubStudents();
      unsubSessions();
      unsubTimelines();
      unsubLeads();
      unsubSettings();
    };
  },

  // Force one-click cloud upload/backup
  backupAllToCloud: async (): Promise<boolean> => {
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
      promises.push(setDoc(doc(db, 'app_settings', 'teacher'), {
        credentials: sanitize(creds),
        profile: sanitize(profile),
        updatedAt: new Date().toISOString()
      }, { merge: true }));

      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error('Backup to cloud failed:', err);
      return false;
    }
  }
};
