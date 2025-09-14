import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrength } from '@/components/ui/password-strength';
import { getFirebaseAuth } from '@/integrations/members/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { getDb } from '@/integrations/members/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useMember } from '@/integrations';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, UserPlus, X } from 'lucide-react';
import { motion } from 'framer-motion';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passRe = /^[A-Za-z0-9!*@$]+$/;

function mapError(e: any): string {
  const code = e?.code || '';
  switch (code) {
    case 'auth/email-already-in-use': 
      return 'This email is already registered. Try signing in instead.';
    case 'auth/invalid-email': 
      return 'Please enter a valid email address.';
    case 'auth/weak-password': 
      return 'Password is too weak. Please follow the requirements below.';
    case 'auth/operation-not-allowed':
      return 'Account creation is currently disabled. Please contact support.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default: 
      return e?.message || 'Account creation failed. Please try again.';
  }
}

export default function SignupPage() {
  const nav = useNavigate();
  const { actions } = useMember();
  const { toast } = useToast();
  
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [role, setRole] = React.useState<'artisan' | 'buyer'>('buyer');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRe.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!passRe.test(formData.password)) {
      newErrors.password = 'Password contains invalid characters. Use only letters, numbers, and !*@$';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the Terms of Service and Privacy Policy';
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
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors below",
        description: "Check all required fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const auth = getFirebaseAuth();
      const db = getDb();
      
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(cred.user, { displayName: formData.name });
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: formData.name,
        email: formData.email,
        role,
        joinedOn: serverTimestamp(),
        profileComplete: false,
        metadata: { provider: 'password', lastLogin: serverTimestamp() },
      }, { merge: true });

      // Send verification email (optional)
      try {
        await sendEmailVerification(cred.user);
        toast({
          title: "Account created successfully!",
          description: "Please check your email for verification.",
        });
      } catch {
        toast({
          title: "Account created successfully!",
          description: "You can now start using DOTS.",
        });
      }

      // Redirect based on role
      nav(role === 'artisan' ? '/profile/setup' : '/buyer/dashboard', { replace: true });
    } catch (e: any) {
      const errorMessage = mapError(e);
      setErrors({ submit: errorMessage });
      toast({
        title: "Account creation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignup = async () => {
    // Ensure role is selected before proceeding
    if (!role) {
      setErrors({ submit: 'Please select whether you want to buy or sell art before continuing.' });
      toast({
        title: "Role Required",
        description: "Please choose if you want to buy art or become an artisan.",
        variant: "destructive",
      });
      return;
    }

    sessionStorage.setItem('dots_role', role);
    sessionStorage.setItem('dots_role_chosen', '1'); // Mark that user explicitly chose a role
    sessionStorage.setItem('dots_next', role === 'artisan' ? '/profile/setup' : '/buyer/dashboard');
    setLoading(true);
    setErrors({});

    try {
      const timeout = new Promise((_r, rej) =>
        setTimeout(() => rej(new Error('timeout')), 15000)
      );

      await Promise.race([actions.login(), timeout]);
      nav(role === 'artisan' ? '/profile/setup' : '/buyer/dashboard', { replace: true });
    } catch (e: any) {
      const code: string = e?.code || '';
      if (code.includes('popup-') || e?.message === 'timeout') {
        toast({
          title: "Redirecting...",
          description: "Opening sign-in page due to popup restrictions.",
        });
        return;
      }

      const errorMessage = 'Google sign-in failed. Please try again or use email signup.';
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
            <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-heading text-2xl font-bold text-primary">
              Join DOTS
            </CardTitle>
            <p className="font-paragraph text-primary/70 mt-2">
              Create your account to start your journey with authentic Indian crafts
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-heading font-medium text-primary">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={cn(errors.name && "border-red-500 focus:border-red-500")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="font-heading font-medium text-primary">
                  I want to *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      role === 'buyer'
                        ? "border-neonaccent bg-neonaccent/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="font-heading font-bold text-primary mb-1">Buy Art</div>
                    <div className="font-paragraph text-sm text-primary/70">
                      Browse thousands of authentic handcrafted pieces from Indian artisans
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('artisan')}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      role === 'artisan'
                        ? "border-neonaccent bg-neonaccent/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="font-heading font-bold text-primary mb-1">Sell Art</div>
                    <div className="font-paragraph text-sm text-primary/70">
                      Join our marketplace and sell your handcrafted creations globally
                    </div>
                  </button>
                </div>
                {!role && (
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <span className="text-amber-500">⚠️</span>
                    Please select your role to continue
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-heading font-medium text-primary">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className={cn(errors.email && "border-red-500 focus:border-red-500")}
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
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    className={cn(
                      "pr-10",
                      errors.password && "border-red-500 focus:border-red-500"
                    )}
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
                <PasswordStrength password={formData.password} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-heading font-medium text-primary">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={cn(
                      "pr-10",
                      errors.confirmPassword && "border-red-500 focus:border-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: '' }));
                      }
                    }}
                    className={cn(
                      "mt-1 rounded border-gray-300 text-neonaccent focus:ring-neonaccent",
                      errors.terms && "border-red-500"
                    )}
                  />
                  <span className="font-paragraph text-sm text-primary/80 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-neonaccent hover:underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-neonaccent hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.terms}
                  </p>
                )}
              </div>

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
                className="w-full h-12 bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
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

              {/* Google Signup */}
              <Button
                type="button"
                variant="outline"
                disabled={loading || !role}
                onClick={onGoogleSignup}
                className={cn(
                  "w-full h-12 border-gray-300 hover:bg-gray-50 font-heading font-medium text-base",
                  !role && "opacity-50 cursor-not-allowed"
                )}
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
                {!role && <span className="ml-2 text-xs text-gray-500">(Select role first)</span>}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="font-paragraph text-sm text-primary/70">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-neonaccent hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}