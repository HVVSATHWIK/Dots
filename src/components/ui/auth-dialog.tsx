import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getFirebaseAuth } from '@/integrations/members/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useMember } from '@/integrations';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function AuthDialog() {
  const { actions } = useMember();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      const auth = getFirebaseAuth();
      if (mode === 'signin') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(e?.message ?? 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{mode === 'signin' ? 'Sign in' : 'Create account'}</CardTitle>
        <CardDescription>Use email/password or continue with Google.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <div className="relative">
          <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/70" onClick={() => setShowPw(v => !v)}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={submit} disabled={loading} className="flex-1">{loading ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Sign up')}</Button>
          <Button variant="outline" onClick={() => actions.login()} className="flex-1">
            <span className="mr-2 inline-flex items-center justify-center w-4 h-4 rounded bg-white text-black text-[10px] font-bold">G</span>
            Continue with Google
          </Button>
        </div>
        <button className="text-sm text-primary underline" onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Have an account? Sign in'}
        </button>
      </CardContent>
    </Card>
  );
}
