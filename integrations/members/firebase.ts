import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const config: FirebaseOptions = {
  apiKey: import.meta.env.PUBLIC_FB_API_KEY ?? import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.PUBLIC_FB_AUTH_DOMAIN ?? import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FB_PROJECT_ID ?? import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FB_STORAGE_BUCKET ?? import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FB_MESSAGING_SENDER_ID ?? import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FB_APP_ID ?? import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.PUBLIC_FB_MEASUREMENT_ID ?? import.meta.env.VITE_FB_MEASUREMENT_ID,
};

export function getFirebaseApp() {
  return getApps().length ? getApps()[0]! : initializeApp(config);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

let dbInstance: Firestore | undefined;
export function getDb() {
  const app = getFirebaseApp();
  if (dbInstance) return dbInstance;
  try {
    // Prefer initializeFirestore with long-polling to avoid streaming 400s in some networks/dev setups.
    dbInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
    return dbInstance;
  } catch (e) {
    // Fallback if already initialized elsewhere
    dbInstance = getFirestore(app);
    return dbInstance;
  }
}

export function getBucket() {
  return getStorage(getFirebaseApp());
}
