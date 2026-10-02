import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database instance with auto-detect long polling for iframe resilience
export const db = ((): ReturnType<typeof getFirestore> => {
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  try {
    const firestoreSettings: any = {
      experimentalAutoDetectLongPolling: true,
    };
    if (dbId) {
      firestoreSettings.databaseId = dbId;
    }
    return initializeFirestore(app, firestoreSettings);
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
})();

// Validate Connection to Firestore gracefully
export async function testConnection() {
  try {
    const testRef = doc(db, 'test', 'connection');
    await getDoc(testRef);
  } catch {
    // Gracefully handle offline or transient connection hiccups without throwing warnings
  }
}

// Execute connection test silently
if (typeof window !== 'undefined') {
  testConnection();
}
