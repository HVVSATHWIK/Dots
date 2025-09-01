import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseAuth } from '@/integrations/members/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { getDb } from '@/integrations/members/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useMember } from '@/integrations';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passRe = /^[A-Za-z0-9!*@$]+$/;

function mapError(e: any): string {
	const code = e?.code || '';
	switch (code) {
		case 'auth/email-already-in-use': return 'This email is already registered. Try logging in.';
		case 'auth/invalid-email': return 'Please enter a valid email.';
		case 'auth/weak-password': return 'Password too weak. Use at least 8 chars and a special character.';
		default: return e?.message || 'Sign up failed. Please try again.';
	}
}

export default function SignupPage() {
	const nav = useNavigate();
	const { actions } = useMember();
	const [name, setName] = React.useState('');
	const [role, setRole] = React.useState<'artisan' | 'buyer'>('artisan');
	const [email, setEmail] = React.useState('');
	const [pass, setPass] = React.useState('');
	const [confirm, setConfirm] = React.useState('');
	const [terms, setTerms] = React.useState(false);
	const [showPass, setShowPass] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [err, setErr] = React.useState<string | null>(null);

	const strength = React.useMemo(() => {
		let s = 0; if (pass.length >= 8) s++; if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) s++; if (/\d/.test(pass)) s++; if (/[!*@$]/.test(pass)) s++; return s;
	}, [pass]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(null);
		if (!emailRe.test(email)) return setErr('Please enter a valid email.');
		if (!passRe.test(pass)) return setErr('Password has unsupported characters.');
		if (pass.length < 8) return setErr('Password must be at least 8 characters.');
		if (pass !== confirm) return setErr('Passwords do not match.');
		if (!terms) return setErr('Please accept the Terms to continue.');

		setLoading(true);
		try {
			const auth = getFirebaseAuth();
			const db = getDb();
			const cred = await createUserWithEmailAndPassword(auth, email, pass);
			await updateProfile(cred.user, { displayName: name || '' });
			await setDoc(doc(db, 'users', cred.user.uid), {
				name: name || '',
				email,
				role,
				joinedOn: serverTimestamp(),
				profileComplete: false,
				metadata: { provider: 'password', lastLogin: serverTimestamp() },
			}, { merge: true });
			await sendEmailVerification(cred.user).catch(() => {});
			// Redirect by role
			nav(role === 'artisan' ? '/profile/setup' : '/dashboard', { replace: true });
		} catch (e: any) {
			setErr(mapError(e));
		} finally {
			setLoading(false);
		}
	};

	const onGoogle = async () => {
			// Pass role and next path so redirect fallback can complete UX
			sessionStorage.setItem('dots_role', role);
			sessionStorage.setItem('dots_next', role === 'artisan' ? '/profile/setup' : '/dashboard');
			setLoading(true); setErr(null);
			try {
				// Race a safety timeout so UI doesn't hang if popup never resolves
				const timeout = new Promise((_r, rej) => setTimeout(() => rej(new Error('timeout')), 15000));
				await Promise.race([actions.login(), timeout]);
				// If popup path succeeds, navigate immediately
				nav(role === 'artisan' ? '/profile/setup' : '/dashboard', { replace: true });
			} catch (e: any) {
				const code: string = e?.code || '';
				if (code.includes('popup-') || e?.message === 'timeout') {
					// Redirect fallback will take over; keep spinner briefly
					return;
				}
				setErr('Google sign-in failed.');
			} finally { setLoading(false); }
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-xl">Join DOTS</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<Label htmlFor="name">Full name</Label>
							<Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
						</div>
						<div>
							<Label>Role</Label>
							<div className="flex gap-4 mt-1">
								<label className="flex items-center gap-2 text-sm"><input type="radio" checked={role==='artisan'} onChange={()=>setRole('artisan')} /> Artisan</label>
								<label className="flex items-center gap-2 text-sm"><input type="radio" checked={role==='buyer'} onChange={()=>setRole('buyer')} /> Buyer</label>
							</div>
						</div>
						<div>
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
						</div>
						<div>
							<Label htmlFor="pass">Password</Label>
							<Input id="pass" type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
							<div className="flex items-center justify-between text-xs mt-1">
								<span className="text-muted-foreground">Strength: {['Very weak','Weak','Fair','Good','Strong'][strength]}</span>
								<button type="button" className="underline" onClick={()=>setShowPass(s=>!s)}>{showPass?'Hide':'Show'}</button>
							</div>
						</div>
						<div>
							<Label htmlFor="confirm">Confirm Password</Label>
							<Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
						</div>
						<label className="flex items-center gap-2 text-sm">
							<input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} /> I agree to the Terms & Privacy
						</label>
						{err && <div className="text-sm text-red-600" role="alert">{err}</div>}
						<Button type="submit" disabled={loading} className="w-full">{loading ? 'Please wait…' : 'Join DOTS'}</Button>
						<Button type="button" variant="outline" disabled={loading} className="w-full" onClick={onGoogle}>Join with Google</Button>
						<div className="text-sm text-center">
							Already have an account? <Link to="/login" className="underline">Login</Link>
						</div>
						<div className="text-[11px] text-muted-foreground text-center">By joining you agree to Terms and Privacy.</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

