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

export function hasFirebaseConfig(): boolean {
  return !!(
    (import.meta.env.PUBLIC_FB_API_KEY || import.meta.env.VITE_FB_API_KEY) &&
    (import.meta.env.PUBLIC_FB_PROJECT_ID || import.meta.env.VITE_FB_PROJECT_ID) &&
    (import.meta.env.PUBLIC_FB_APP_ID || import.meta.env.VITE_FB_APP_ID)
  );
}

// Log config status for debugging
if (import.meta.env.DEV) {
  console.log('[Firebase] Config status:', {
    hasApiKey: !!(import.meta.env.PUBLIC_FB_API_KEY || import.meta.env.VITE_FB_API_KEY),
    hasProjectId: !!(import.meta.env.PUBLIC_FB_PROJECT_ID || import.meta.env.VITE_FB_PROJECT_ID),
    hasAppId: !!(import.meta.env.PUBLIC_FB_APP_ID || import.meta.env.VITE_FB_APP_ID),
  });
}

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

let __db: Firestore | null = null;
export function getDb() {
  if (__db) return __db;
  const app = getFirebaseApp();
  // Use initializeFirestore to enable better transport fallback in restricted networks.
  try {
    __db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalAutoDetectLongPolling: true,
    });
    return __db;
  } catch {
    // Fallback to default if already initialized elsewhere
    __db = getFirestore(app);
    return __db;
  }
}

export function getBucket() {
  return getStorage(getFirebaseApp());
}
