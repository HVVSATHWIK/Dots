import * as React from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseAuth } from '@/integrations/members/firebase';
import { browserLocalPersistence, browserSessionPersistence, setPersistence, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useMember } from '@/integrations';

function mapError(e: any): string {
	const code = e?.code || '';
	switch (code) {
		case 'auth/wrong-password': return 'Incorrect password. Try again or reset password.';
		case 'auth/user-not-found': return 'No account found for this email. Sign up instead.';
		case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
		case 'auth/invalid-email': return 'Please enter a valid email.';
		default: return e?.message || 'Login failed. Please try again.';
	}
}

export default function LoginPage() {
	const nav = useNavigate();
	const [search] = useSearchParams();
	const next = search.get('next') || '/dashboard';
	const { actions } = useMember();
	const [email, setEmail] = React.useState('');
	const [pass, setPass] = React.useState('');
	const [remember, setRemember] = React.useState(true);
	const [loading, setLoading] = React.useState(false);
	const [err, setErr] = React.useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); setErr(null); setLoading(true);
		try {
			const auth = getFirebaseAuth();
			await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
			await signInWithEmailAndPassword(auth, email, pass);
			nav(next, { replace: true });
		} catch (e: any) {
			setErr(mapError(e));
		} finally { setLoading(false); }
	};

	const onGoogle = async () => {
		setLoading(true); setErr(null);
		try {
			await actions.login();
			nav(next, { replace: true });
		} catch (e: any) {
			setErr('Google sign-in failed.');
		} finally { setLoading(false); }
	};

		const onForgot = async () => {
			setErr(null);
			if (!email) { setErr('Enter your email to receive a reset link.'); return; }
			setLoading(true);
			try {
				const auth = getFirebaseAuth();
				await sendPasswordResetEmail(auth, email);
				setErr('Password reset email sent (if the account exists).');
			} catch (e: any) { setErr(mapError(e)); }
			finally { setLoading(false); }
		};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-xl">Welcome back to DOTS</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
						</div>
						<div>
							<Label htmlFor="pass">Password</Label>
							<Input id="pass" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
						</div>
						<label className="flex items-center gap-2 text-sm">
							<input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /> Remember me
						</label>
						{err && <div className="text-sm text-red-600" role="alert">{err}</div>}
						<Button type="submit" disabled={loading} className="w-full">{loading ? 'Please wait…' : 'Login'}</Button>
						<Button type="button" variant="outline" disabled={loading} className="w-full" onClick={onGoogle}>Login with Google</Button>
						<div className="flex items-center justify-between text-sm">
							<button type="button" className="underline" onClick={onForgot}>Forgot password?</button>
							<span>New here? <Link to="/signup" className="underline">Join DOTS</Link></span>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

