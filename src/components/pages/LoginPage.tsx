import * as React from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseAuth } from '@/integrations/members/firebase';
import { browserLocalPersistence, browserSessionPersistence, setPersistence, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useMember } from '@/integrations';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, LogIn, Mail, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function mapError(e: any): string {
  const code = e?.code || '';
  switch (code) {
    case 'auth/wrong-password': 
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/user-not-found': 
      return 'No account found with this email. Please sign up first.';
    case 'auth/too-many-requests': 
      return 'Too many failed attempts. Please try again later or reset your password.';
    case 'auth/invalid-email': 
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default: 
      return e?.message || 'Sign in failed. Please check your credentials and try again.';
  }
}

export default function LoginPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const { actions } = useMember();
  const { toast } = useToast();
  
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [resetEmailSent, setResetEmailSent] = React.useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear reset email sent state when email changes
    if (field === 'email' && resetEmailSent) {
      setResetEmailSent(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors below",
        description: "Check your email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const auth = getFirebaseAuth();
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to DOTS.",
      });
      
      nav(next, { replace: true });
    } catch (e: any) {
      const errorMessage = mapError(e);
      setErrors({ submit: errorMessage });
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});

    try {
      await actions.login();
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in with Google.",
      });
      nav(next, { replace: true });
    } catch (e: any) {
      const errorMessage = 'Google sign-in failed. Please try again or use email sign-in.';
      setErrors({ submit: errorMessage });
      toast({
        title: "Google sign-in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address to reset password' });
      toast({
        title: "Email required",
        description: "Please enter your email address to receive reset instructions.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
    } catch (e: any) {
      const errorMessage = mapError(e);
      setErrors({ submit: errorMessage });
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="font-heading text-2xl font-bold text-primary">
              Welcome Back
            </CardTitle>
            <p className="font-paragraph text-primary/70 mt-2">
              Sign in to your DOTS account to continue your journey
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-heading font-medium text-primary">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className={cn(errors.email && "border-red-500 focus:border-red-500")}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-heading font-medium text-primary">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className={cn(
                      "pr-10",
                      errors.password && "border-red-500 focus:border-red-500"
                    )}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-neonaccent focus:ring-neonaccent"
                  />
                  <span className="font-paragraph text-sm text-primary/80">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={loading}
                  className="font-paragraph text-sm text-neonaccent hover:underline font-medium disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>

              {/* Reset Email Confirmation */}
              {resetEmailSent && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Password reset email sent! Check your inbox.
                  </p>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 font-heading font-bold text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-primary/60 font-paragraph">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onGoogleSignIn}
                className="w-full h-12 border-gray-300 hover:bg-gray-50 font-heading font-medium text-base"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="font-paragraph text-sm text-primary/70">
                New to DOTS?{' '}
                <Link 
                  to={`/signup?next=${encodeURIComponent(next)}`} 
                  className="text-neonaccent hover:underline font-medium"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}