import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { getFirebaseAuth } from '@/integrations/members/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getDb } from '@/integrations/members/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useMember } from '@/integrations';
import { Eye, EyeOff } from 'lucide-react';

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[!*@$]/.test(pw)) s++;
  return s; // 0..5
}

export default function SignupPage() {
  const { actions } = useMember();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'artisan'|'buyer'>('artisan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const pwStrength = useMemo(() => strength(password), [password]);
  const pwValidChars = /^[A-Za-z0-9!*@$]+$/.test(password);

  const toError = (code?: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try logging in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 8 characters with special characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'Signup failed. Please try again.';
    }
  };

  const onSignup = async () => {
    setError(null);
    if (!pwValidChars) { setError('Use only letters, numbers, and !*@$.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      const db = getDb();
      await setDoc(doc(db, 'users', cred.user.uid), {
        role,
        name: name || cred.user.displayName || '',
        email: cred.user.email,
        joinedOn: serverTimestamp(),
      }, { merge: true });
  if (role === 'artisan') navigate('/profile/setup');
  else navigate('/dashboard');
    } catch (e: any) {
      console.error('[signup] failed', e);
      setError(e?.code ? toError(e.code) : (e?.message || 'Signup failed. Please try again.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-950">
      <Card className="w-full max-w-xl shadow-lg border-amber-200/40">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shadow">
            <Image
              src="https://static.wixstatic.com/media/d7d9fb_1971b31325f24d11889c078816a754de~mv2.png#originWidth=402&originHeight=288"
              alt="DOTS Logo"
              width={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-heading text-stone-800 dark:text-stone-100">Join DOTS</CardTitle>
          <CardDescription className="text-stone-600 dark:text-stone-300">Create your account as an artisan or buyer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="role" value="artisan" checked={role==='artisan'} onChange={()=>setRole('artisan')} />
                Artisan
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="role" value="buyer" checked={role==='buyer'} onChange={()=>setRole('buyer')} />
                Buyer
              </label>
            </div>
          </div>
          <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="relative">
            <Input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/70" onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
            <button type="button" aria-label={showConfirm ? 'Hide confirm' : 'Show confirm'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/70" onClick={() => setShowConfirm(v => !v)}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            Use 8+ chars with letters, numbers, and !*@$ • Strength: {['Very weak','Weak','Okay','Good','Strong','Very strong'][pwStrength]}
            {!pwValidChars && ' • Only letters, numbers, and !*@$ allowed'}
            {confirm && (
              <span className={`ml-2 ${password === confirm ? 'text-green-600' : 'text-red-600'}`}>
                {password === confirm ? 'Passwords match' : 'Passwords do not match'}
              </span>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={onSignup} disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-amber-50">
              {loading ? (
                <span className="inline-flex items-center gap-2"><span className="h-4 w-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" /> Processing…</span>
              ) : (
                'Join DOTS'
              )}
            </Button>
            <Button variant="outline" onClick={() => actions.login({ role, redirect: role === 'artisan' ? '/profile/setup' : '/dashboard' })} className="flex-1">
              <span className="mr-2 inline-flex items-center justify-center w-4 h-4 rounded bg-white text-black text-[10px] font-bold">G</span>
              Join with Google
            </Button>
          </div>
          <p className="text-sm">Already have an account? <Link to="/login" className="text-primary underline">Login</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
