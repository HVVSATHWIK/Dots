import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getFirebaseAuth, getGoogleProvider, hasFirebaseConfig, getDb } from './firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';

type MemberContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  member: {
    loginEmail?: string | null;
    profile?: { nickname?: string | null; photo?: { url?: string | null } };
    contact?: { firstName?: string | null; lastName?: string | null; phones?: string[] };
    _createdDate?: string | null;
  role?: 'buyer' | 'artisan' | 'admin';
  } | null;
  actions: {
    login: () => Promise<void>;
    logout: () => Promise<void>;
  };
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'buyer' | 'artisan' | 'admin' | null>(null);

  useEffect(() => {
    try {
      if (!hasFirebaseConfig()) {
        console.warn('[auth] Missing Firebase config; running unauthenticated.');
        setLoading(false);
        return;
      }
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        setLoading(false);
        try {
          if (u) {
            // Resolve role from Firestore (fallback to session or buyer)
            let resolvedRole: 'buyer' | 'artisan' | 'admin' = 'buyer';
            try {
              const db = getDb();
              const ref = doc(db, 'users', u.uid);
              const snap = await getDoc(ref);
              const existingRole = (snap.exists() ? (snap.data() as any)?.role : null) as any;
              const sessionRole = (sessionStorage.getItem('dots_role') as any) || null;
              resolvedRole = (existingRole || sessionRole || 'buyer') as any;
              // If no user doc existed, create a minimal one now.
              if (!snap.exists()) {
                await setDoc(ref, {
                  email: u.email || '',
                  name: u.displayName || '',
                  role: resolvedRole,
                  joinedOn: serverTimestamp(),
                  profileComplete: false,
                  metadata: { provider: 'google', lastLogin: serverTimestamp() }
                }, { merge: true });
              }
              setRole(resolvedRole);
            } catch {
              const sessionRole = (sessionStorage.getItem('dots_role') as any) || null;
              resolvedRole = (sessionRole || 'buyer') as any;
              setRole(resolvedRole);
            }
            const shouldMerge = sessionStorage.getItem('dots_post_login_merge') === '1' || !!sessionStorage.getItem('dots_role');
            if (shouldMerge) {
              const db = getDb();
              const role = sessionStorage.getItem('dots_role') || 'buyer';
              await setDoc(doc(db, 'users', u.uid), {
                name: u.displayName || '',
                email: u.email || '',
                role: (role as any) || resolvedRole,
                joinedOn: serverTimestamp(),
                profileComplete: false,
                metadata: { provider: 'google', lastLogin: serverTimestamp() },
              }, { merge: true });
              const next = sessionStorage.getItem('dots_next');
              sessionStorage.removeItem('dots_post_login_merge');
              sessionStorage.removeItem('dots_role');
              sessionStorage.removeItem('dots_next');
              // If we came from a redirect-based flow, finish navigation client-side
              if (next) {
                try { window.location.replace(next); } catch { /* noop */ }
              }
            }
            // If role selection not made (still default buyer and no explicit session flag) allow optional redirect to chooser
            try {
              const hasChosen = sessionStorage.getItem('dots_role_chosen') === '1';
              const db = getDb();
              const userDoc = await getDoc(doc(db, 'users', u.uid));
              const existingRole = (userDoc.exists() ? (userDoc.data() as any)?.role : null);

              if (!hasChosen && !existingRole && !sessionStorage.getItem('dots_skip_role_prompt')) {
                // Avoid infinite loops: only redirect if not already on chooser, login, or signup
                if (!['/choose-role', '/login', '/signup'].includes(window.location.pathname)) {
                  window.history.replaceState({}, '', '/choose-role');
                  return; // Don't continue with normal auth flow
                }
              } else if (existingRole) {
                // User has a role, redirect to appropriate dashboard
                const dashboardPath = existingRole === 'buyer' ? '/buyer/dashboard' : '/artisan/dashboard';
                if (!['/buyer/dashboard', '/artisan/dashboard', '/dashboard'].includes(window.location.pathname)) {
                  window.history.replaceState({}, '', dashboardPath);
                  return;
                }
              }
            } catch { /* ignore */ }
          }
        } catch (e) {
          console.warn('[auth] Post-login merge failed:', e);
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('[auth] Failed to init Firebase auth:', e);
      setLoading(false);
    }
  }, []);

  const value = useMemo<MemberContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    member: user ? {
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
      role: role || 'buyer',
    } : null,
    actions: {
      async login() {
        try {
          if (!hasFirebaseConfig()) throw new Error('Missing Firebase config');
          const auth = getFirebaseAuth();
          const res = await signInWithPopup(auth, getGoogleProvider());
          try {
            const db = getDb();
            const role = sessionStorage.getItem('dots_role') || 'buyer';
            sessionStorage.removeItem('dots_role');
            await setDoc(doc(db, 'users', res.user.uid), {
              name: res.user.displayName || '',
              email: res.user.email || '',
              role,
              joinedOn: serverTimestamp(),
              profileComplete: false,
              metadata: { provider: 'google', lastLogin: serverTimestamp() },
            }, { merge: true });
          } catch (_) { /* noop */ }
        } catch (e: any) {
          const code: string = e?.code || '';
          const isPopupIssue = code.includes('popup-closed') || code.includes('popup-blocked') || code.includes('cancelled-popup-request');
          if (isPopupIssue) {
            if (!sessionStorage.getItem('dots_role')) sessionStorage.setItem('dots_role', 'buyer');
            sessionStorage.setItem('dots_post_login_merge', '1');
            await signInWithRedirect(getFirebaseAuth(), getGoogleProvider());
            return;
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
  }), [user, loading, role]);

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error('useMember must be used within MemberProvider');
  return ctx;
}
 
