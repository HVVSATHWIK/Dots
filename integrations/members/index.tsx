import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getFirebaseAuth, getGoogleProvider, getDb } from './firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

type MemberContextType = {
  // Raw Firebase user
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Wix-like shape used across the UI (best-effort mapping)
  member: {
    loginEmail?: string | null;
    profile?: { nickname?: string | null; photo?: { url?: string | null } };
    contact?: { firstName?: string | null; lastName?: string | null; phones?: string[] };
    _createdDate?: string | null;
  } | null;
  actions: {
  login: (opts?: { role?: 'artisan' | 'buyer'; redirect?: string }) => Promise<void>;
    logout: () => Promise<void>;
  };
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Ensure minimal config is present before touching Firebase
      if (!(
        import.meta.env.PUBLIC_FB_API_KEY ?? import.meta.env.VITE_FB_API_KEY
      )) {
        console.warn('[auth] Missing VITE_FB_API_KEY; running unauthenticated.');
        setLoading(false);
        return;
      }
      console.debug('[auth] Firebase env present', {
        hasKey: !!(import.meta.env.PUBLIC_FB_API_KEY ?? import.meta.env.VITE_FB_API_KEY),
        authDomain: import.meta.env.PUBLIC_FB_AUTH_DOMAIN ?? import.meta.env.VITE_FB_AUTH_DOMAIN,
        projectId: import.meta.env.PUBLIC_FB_PROJECT_ID ?? import.meta.env.VITE_FB_PROJECT_ID,
        origin: typeof window !== 'undefined' ? window.location.origin : 'ssr',
      });
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn('[auth] Failed to init Firebase auth:', e);
      setLoading(false);
    }
  }, []);

  // Ensure a basic users/{uid} doc exists after sign-in (e.g., Google redirect)
  useEffect(() => {
    const ensureUserDoc = async () => {
      if (!user) return;
      try {
        const db = getDb();
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        let desiredRole: 'artisan' | 'buyer' | undefined;
        try {
          const stored = sessionStorage.getItem('postLoginRole');
          if (stored === 'artisan' || stored === 'buyer') desiredRole = stored;
        } catch {}
        if (!snap.exists()) {
          await setDoc(ref, {
            role: desiredRole ?? 'buyer',
            name: user.displayName || '',
            email: user.email || '',
            joinedOn: serverTimestamp(),
          }, { merge: true });
        } else if (desiredRole) {
          await setDoc(ref, { role: desiredRole }, { merge: true });
        }
        try {
          const next = sessionStorage.getItem('postLoginRedirect');
          if (next) {
            sessionStorage.removeItem('postLoginRedirect');
            sessionStorage.removeItem('postLoginRole');
            window.location.assign(next);
          }
        } catch {}
      } catch (err) {
        console.warn('[auth] ensureUserDoc failed', err);
      }
    };
    void ensureUserDoc();
  }, [user]);

  const value = useMemo<MemberContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    member: user
      ? {
          loginEmail: user.email,
          profile: {
            nickname: user.displayName ?? (user.email ? user.email.split('@')[0] : null),
            photo: { url: user.photoURL ?? null },
          },
          contact: (() => {
            const dn = user.displayName ?? '';
            const parts = dn.split(' ');
            const firstName = parts[0] || null;
            const lastName = parts.slice(1).join(' ') || null;
            return { firstName, lastName, phones: [] };
          })(),
          _createdDate: user.metadata?.creationTime ?? null,
        }
      : null,
    actions: {
      async login(opts?: { role?: 'artisan' | 'buyer'; redirect?: string }) {
        try {
          if (!(
            import.meta.env.PUBLIC_FB_API_KEY ?? import.meta.env.VITE_FB_API_KEY
          )) throw new Error('Missing Firebase config');
          console.debug('[auth] login() using env', {
            hasKey: !!(import.meta.env.PUBLIC_FB_API_KEY ?? import.meta.env.VITE_FB_API_KEY),
            authDomain: import.meta.env.PUBLIC_FB_AUTH_DOMAIN ?? import.meta.env.VITE_FB_AUTH_DOMAIN,
            projectId: import.meta.env.PUBLIC_FB_PROJECT_ID ?? import.meta.env.VITE_FB_PROJECT_ID,
            origin: typeof window !== 'undefined' ? window.location.origin : 'ssr',
          });
          const auth = getFirebaseAuth();
          try {
            await signInWithPopup(auth, getGoogleProvider());
            // After popup sign-in, we can create/merge the user doc with provided role
            if (auth.currentUser) {
              try {
                const db = getDb();
                const ref = doc(db, 'users', auth.currentUser.uid);
                await setDoc(ref, {
                  // Only set role if provided; otherwise leave as-is to avoid overwriting
                  ...(opts?.role ? { role: opts.role } : {}),
                  name: auth.currentUser.displayName || '',
                  email: auth.currentUser.email || '',
                  joinedOn: serverTimestamp(),
                }, { merge: true });
              } catch (err) {
                console.warn('[auth] post-login user doc merge failed', err);
              }
            }
            if (opts?.redirect) {
              window.location.assign(opts.redirect);
              return;
            }
          } catch (err: any) {
            if (err?.code === 'auth/popup-blocked') {
              // Fallback to redirect when popups are blocked
              try {
                if (opts?.redirect) sessionStorage.setItem('postLoginRedirect', opts.redirect);
                if (opts?.role) sessionStorage.setItem('postLoginRole', opts.role);
              } catch {}
              await signInWithRedirect(auth, getGoogleProvider());
              return;
            }
            throw err;
          }
        } catch (e) {
          const code = (e as any)?.code || 'unknown';
          const msg = (e as any)?.message || String(e);
          console.error('[auth] Sign-in failed:', { code, msg, error: e });
          if (code === 'auth/unauthorized-domain') {
            alert("Sign-in blocked: unauthorized domain. Add your exact dev origin under Firebase Console → Authentication → Authorized domains (e.g., localhost or your LAN IP). Then restart the dev server.");
          } else if (code === 'auth/popup-blocked') {
            alert('Sign-in popup was blocked by the browser. Allow popups for this site and try again.');
          } else if (code === 'auth/popup-closed-by-user') {
            alert('Sign-in popup was closed before completion. Please try again.');
          } else if (code === 'auth/invalid-api-key') {
            alert('Invalid Firebase API key. Verify .env and restart the dev server.');
          } else if (code === 'auth/configuration-not-found') {
            alert('Google sign-in is not enabled in Firebase Authentication. Enable it and retry.');
          } else {
            alert(`Sign-in unavailable: ${code}. Check Firebase config, enabled providers, and authorized domains.`);
          }
          throw e;
        }
      },
      async logout() {
        try {
          const auth = getFirebaseAuth();
          await signOut(auth);
        } catch (e) {
          // noop
        }
      }
    }
  }), [user, loading]);

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error('useMember must be used within MemberProvider');
  return ctx;
}
