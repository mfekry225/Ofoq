import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Connect to the specific database configured for this applet
let firestoreDb: Firestore;
try {
  firestoreDb = firebaseConfig.firestoreDatabaseId 
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
} catch (e) {
  console.warn('Initializing default firestore fallback', e);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const auth: Auth = getAuth(app);
export default app;
