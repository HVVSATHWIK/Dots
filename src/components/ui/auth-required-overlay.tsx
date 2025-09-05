import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Store, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthRequiredOverlayProps {
  title?: string;
  description?: string;
  showBuyerOption?: boolean;
  showSellerOption?: boolean;
}

export function AuthRequiredOverlay({
  title = "Sign Up Required",
  description = "Create your account to access this feature and start your journey with DOTS.",
  showBuyerOption = true,
  showSellerOption = true
}: AuthRequiredOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-heading text-xl font-bold text-primary">
              {title}
            </CardTitle>
            <p className="font-paragraph text-primary/70 mt-2">
              {description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {showBuyerOption && (
              <Button
                asChild
                size="lg"
                className="w-full bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold"
              >
                <Link to="/signup">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join as Art Lover
                </Link>
              </Button>
            )}
            
            {showSellerOption && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-heading font-bold"
              >
                <Link to="/sell">
                  <Store className="w-5 h-5 mr-2" />
                  Become an Artisan
                </Link>
              </Button>
            )}

            <div className="text-center pt-2">
              <p className="font-paragraph text-sm text-primary/60">
                Already have an account?{' '}
                <Link to="/login" className="text-neonaccent hover:underline font-medium">
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