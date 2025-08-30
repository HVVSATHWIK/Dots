import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getFirebaseAuth } from '@/integrations/members/firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { useMember } from '@/integrations';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { actions } = useMember();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const next = (new URLSearchParams(location.search)).get('next') || '/dashboard';

  const toError = (code?: string) => {
    switch (code) {
      case 'auth/wrong-password':
        return 'Incorrect password. Try again or reset your password.';
      case 'auth/user-not-found':
        return 'No account found with this email. Try signing up.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'Login failed. Please try again.';
    }
  };

  const onLogin = async () => {
    setLoading(true); setError(null);
    try {
      const auth = getFirebaseAuth();
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      navigate(next);
    } catch (e: any) {
      setError(toError(e?.code));
    } finally { setLoading(false); }
  };

  const onForgot = async () => {
    setLoading(true); setError(null);
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent. Check your inbox.');
    } catch (e: any) {
      setError(toError(e?.code));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-950">
      <Card className="w-full max-w-md shadow-lg border-amber-200/40">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shadow">
            <Image
              src="https://static.wixstatic.com/media/d7d9fb_1971b31325f24d11889c078816a754de~mv2.png#originWidth=402&originHeight=288"
              alt="DOTS Logo"
              width={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-heading text-stone-800 dark:text-stone-100">Welcome Back to DOTS</CardTitle>
          <CardDescription className="text-stone-600 dark:text-stone-300">Log in to continue your journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="relative">
            <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/70" onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Remember me
          </label>
          {error && (
            <p className={`text-sm ${error.startsWith('Password reset') ? 'text-green-600' : 'text-red-600'}`}>{error}</p>
          )}
          <div className="flex gap-2">
            <Button onClick={onLogin} disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-amber-50">
              {loading ? (
                <span className="inline-flex items-center gap-2"><span className="h-4 w-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" /> Processing…</span>
              ) : (
                'Welcome Back to DOTS'
              )}
            </Button>
            <Button variant="outline" onClick={() => actions.login({ redirect: next })} className="flex-1">
              <span className="mr-2 inline-flex items-center justify-center w-4 h-4 rounded bg-white text-black text-[10px] font-bold">G</span>
              Login with Google
            </Button>
          </div>
          <button className="text-sm text-primary underline" onClick={onForgot}>Forgot Password?</button>
          <p className="text-sm">New here? <Link to="/signup" className="text-primary underline">Join DOTS</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
