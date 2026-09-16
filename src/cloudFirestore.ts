import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy 
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

    let unsubStudents: () => void = () => {};
    let unsubSessions: () => void = () => {};
    let unsubTimelines: () => void = () => {};
    let unsubLeads: () => void = () => {};
    let unsubSettings: () => void = () => {};

    try {
      // 1. Students Listener
      const studentsCol = collection(db, 'students');
      unsubStudents = onSnapshot(studentsCol, async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, seed with existing local data
          const localStudents = storage.getStudents();
          if (localStudents && localStudents.length > 0) {
            callbacks.onStatusChange('syncing', 'جاري رفع ونقل البيانات المحلية إلى السحابة...');
            for (const std of localStudents) {
              await setDoc(doc(db, 'students', std.id), sanitize(std), { merge: true });
            }
          }
        } else {
          const list: Student[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Student);
          });
          // Sort by joinedAt or ID
          list.sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''));
          callbacks.onStudentsUpdate(list);
          storage.saveStudents(list);
          callbacks.onStatusChange('synced', 'متصل بالسحابة (Firestore) - البيانات محدثة ومحمية');
        }
      }, (err) => {
        console.warn('Students snapshot error:', err);
        callbacks.onStatusChange('offline', 'تعذر الاتصال بـ Firestore، جاري استخدام التخزين المحلي الآمن');
      });

      // 2. Sessions Listener
      const sessionsCol = collection(db, 'sessions');
      unsubSessions = onSnapshot(sessionsCol, async (snapshot) => {
        if (snapshot.empty) {
          const localSessions = storage.getSessions();
          if (localSessions && localSessions.length > 0) {
            for (const ses of localSessions) {
              await setDoc(doc(db, 'sessions', ses.id), sanitize(ses), { merge: true });
            }
          }
        } else {
          const list: SessionRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as SessionRecord);
          });
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          callbacks.onSessionsUpdate(list);
          storage.saveSessions(list);
        }
      }, (err) => console.warn('Sessions error:', err));

      // 3. Timelines Listener
      const timelinesCol = collection(db, 'timelines');
      unsubTimelines = onSnapshot(timelinesCol, async (snapshot) => {
        if (snapshot.empty) {
          const localTimelines = storage.getTimelines();
          if (localTimelines && localTimelines.length > 0) {
            for (const tm of localTimelines) {
              await setDoc(doc(db, 'timelines', tm.id), sanitize(tm), { merge: true });
            }
          }
        } else {
          const list: TimelineMilestone[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as TimelineMilestone);
          });
          callbacks.onTimelinesUpdate(list);
          storage.saveTimelines(list);
        }
      }, (err) => console.warn('Timelines error:', err));

      // 4. Leads Listener
      const leadsCol = collection(db, 'leads');
      unsubLeads = onSnapshot(leadsCol, async (snapshot) => {
        if (snapshot.empty) {
          const localLeads = storage.getLeads();
          if (localLeads && localLeads.length > 0) {
            for (const ld of localLeads) {
              await setDoc(doc(db, 'leads', ld.id), sanitize(ld), { merge: true });
            }
          }
        } else {
          const list: EnrollmentLead[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as EnrollmentLead);
          });
          callbacks.onLeadsUpdate(list);
          storage.saveLeads(list);
        }
      }, (err) => console.warn('Leads error:', err));

      // 5. Settings Listener
      const settingsDoc = doc(db, 'app_settings', 'teacher');
      unsubSettings = onSnapshot(settingsDoc, async (snapshot) => {
        if (!snapshot.exists()) {
          const localCreds = storage.getTeacherCredentials();
          const localProfile = storage.getTeacherProfile();
          await setDoc(settingsDoc, {
            credentials: sanitize(localCreds),
            profile: sanitize(localProfile),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } else {
          const data = snapshot.data();
          if (data) {
            if (data.credentials) {
              callbacks.onSettingsUpdate(data.credentials as TeacherCredentials, data.profile as TeacherProfile);
              storage.saveTeacherCredentials(data.credentials as TeacherCredentials);
            }
            if (data.profile) {
              storage.saveTeacherProfile(data.profile as TeacherProfile);
            }
          }
        }
      }, (err) => console.warn('Settings error:', err));

    } catch (err) {
      console.error('Failed to init Firestore listeners:', err);
      callbacks.onStatusChange('error', 'حدث خطأ أثناء الاتصال بـ Firestore');
    }

    return () => {
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

      for (const std of students) {
        await setDoc(doc(db, 'students', std.id), sanitize(std), { merge: true });
      }
      for (const ses of sessions) {
        await setDoc(doc(db, 'sessions', ses.id), sanitize(ses), { merge: true });
      }
      for (const tm of timelines) {
        await setDoc(doc(db, 'timelines', tm.id), sanitize(tm), { merge: true });
      }
      for (const ld of leads) {
        await setDoc(doc(db, 'leads', ld.id), sanitize(ld), { merge: true });
      }
      await setDoc(doc(db, 'app_settings', 'teacher'), {
        credentials: sanitize(creds),
        profile: sanitize(profile),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return true;
    } catch (err) {
      console.error('Backup to cloud failed:', err);
      return false;
    }
  }
};
