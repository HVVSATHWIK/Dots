import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// Analytics is optional; guard import in SSR
// We avoid importing firebase/analytics directly during SSR to prevent reference errors.
let _analytics: any = null;

// Build config from env vars (preferred path)
let config: FirebaseOptions = {
  apiKey: import.meta.env.PUBLIC_FB_API_KEY ?? import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.PUBLIC_FB_AUTH_DOMAIN ?? import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FB_PROJECT_ID ?? import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FB_STORAGE_BUCKET ?? import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FB_MESSAGING_SENDER_ID ?? import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FB_APP_ID ?? import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.PUBLIC_FB_MEASUREMENT_ID ?? import.meta.env.VITE_FB_MEASUREMENT_ID,
};







// Development fallback: allow injecting a global (e.g. via a script tag before bundle)
// window.__FIREBASE_CONFIG__ = { apiKey: '...', projectId: '...', appId: '...' }
const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : {};
if ((import.meta.env.DEV) && (!config.apiKey || !config.projectId || !config.appId) && g.__FIREBASE_CONFIG__) {
  config = { ...config, ...g.__FIREBASE_CONFIG__ } as FirebaseOptions;
}

// Soft validation to help diagnose missing values
function isConfigComplete(c: FirebaseOptions) {
  return !!(c.apiKey && c.projectId && c.appId);
}

if (import.meta.env.DEV && !isConfigComplete(config)) {
  // Helpful one-line copy instructions
  console.warn('[Firebase] Incomplete config. Ensure you created a .env file with PUBLIC_FB_API_KEY, PUBLIC_FB_PROJECT_ID, PUBLIC_FB_APP_ID then restart dev server. Example:' +
    '\nPUBLIC_FB_API_KEY=AIza...\nPUBLIC_FB_AUTH_DOMAIN=dots-57778.firebaseapp.com\nPUBLIC_FB_PROJECT_ID=dots-57778\nPUBLIC_FB_STORAGE_BUCKET=dots-57778.appspot.com\nPUBLIC_FB_MESSAGING_SENDER_ID=313625221417\nPUBLIC_FB_APP_ID=1:313625221417:web:ffbb801990fe67a352bf38\nPUBLIC_FB_MEASUREMENT_ID=G-L67LB38V9Z');
}

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
    hasApiKey: !!config.apiKey,
    hasProjectId: !!config.projectId,
    hasAppId: !!config.appId,
    source: (g.__FIREBASE_CONFIG__ && !import.meta.env.PUBLIC_FB_API_KEY && !import.meta.env.VITE_FB_API_KEY) ? 'global-fallback' : 'env',
  });
} else {
  // Lightweight production diagnostic (no secrets) – logs only if incomplete
  if (!isConfigComplete(config)) {
    console.warn('[Firebase] Production config incomplete: apiKey?', !!config.apiKey, 'projectId?', !!config.projectId, 'appId?', !!config.appId);
  }
}

export function getFirebaseApp() {
  return getApps().length ? getApps()[0]! : initializeApp(config);
}

// Safe analytics accessor (returns null if unsupported / not in browser)
export async function getAnalyticsSafe() {
  if (typeof window === 'undefined') return null;
  try {
    if (_analytics) return _analytics;
    const { getAnalytics } = await import('firebase/analytics');
    _analytics = getAnalytics(getFirebaseApp());
    return _analytics;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[Firebase] Analytics unavailable:', (e as any)?.message);
    return null;
  }
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
