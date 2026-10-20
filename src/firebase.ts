import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import localConfig from '../firebase-config.json';

// القيم تُقرأ من متغيرات البيئة أولاً، ثم من firebase-config.json.
// ملاحظة: إعدادات Firebase للويب ليست أسراراً؛ الحماية الفعلية تأتي من firestore.rules.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId,
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);
export default app;

// نسخة ثانوية من Firebase تُستخدم فقط لإنشاء حسابات أولياء الأمور،
// حتى لا يُسجَّل خروج الأخصائي من جلسته الحالية أثناء إنشاء الحساب.
const SECONDARY_APP_NAME = 'ofoq-parent-provisioning';
export function getProvisioningAuth(): Auth {
  const secondary = getApps().find((a) => a.name === SECONDARY_APP_NAME) ?? initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  return getAuth(secondary);
}
