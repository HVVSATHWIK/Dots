import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Icon from '@/components/ui/icons';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { member, isAuthenticated } = useMember();

  // If we already have a role and (if artisan) maybe profile complete in future, skip.
  useEffect(() => {
    if (member?.role === 'artisan') {
      navigate('/artisan/dashboard', { replace: true });
    } else if (member?.role === 'buyer') {
      navigate('/buyer/dashboard', { replace: true });
    }
  }, [member?.role]);

  function choose(role: 'buyer' | 'artisan') {
    // Store the desired role in session; the auth context will merge it upon login or next refresh.
    sessionStorage.setItem('dots_role', role);
    sessionStorage.setItem('dots_role_chosen', '1'); // Mark that user explicitly chose a role
    // If authenticated already, force a soft reload to trigger merge in provider logic.
    if (isAuthenticated) {
      // Redirect logic: if artisan -> profile setup; if buyer -> buyer dashboard
      if (role === 'artisan') {
        navigate('/profile/setup');
      } else {
        navigate('/buyer/dashboard');
      }
    } else {
      navigate('/signup');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="max-w-4xl w-full space-y-10">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-4xl font-bold text-primary mb-4">Welcome to DOTS</h1>
            <p className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto leading-relaxed">
              Choose how you'd like to experience our platform. Whether you're here to discover beautiful handcrafted art or share your own creations with the world, we've got the perfect experience for you.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 hover:border-neonaccent transition-all duration-300 hover:shadow-xl h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="shopping-bag" size={48} className="text-primary" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold mb-2">I'm Here to Buy Art</h2>
                  <p className="font-paragraph text-primary/70 leading-relaxed">
                    Discover thousands of authentic handcrafted pieces from skilled Indian artisans. Browse by category, explore themes, and find the perfect piece for your collection.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-primary/80">
                    <Icon name="sparkles" size={16} className="text-neonaccent mr-2" />
                    Browse authentic Indian crafts
                  </div>
                  <div className="flex items-center text-sm text-primary/80">
                    <Icon name="search" size={16} className="text-neonaccent mr-2" />
                    AI-powered discovery recommendations
                  </div>
                  <div className="flex items-center text-sm text-primary/80">
                    <Icon name="shield" size={16} className="text-neonaccent mr-2" />
                    Secure worldwide shipping
                  </div>
                  <div className="flex items-center text-sm text-primary/80">
                    <Icon name="heart" size={16} className="text-neonaccent mr-2" />
                    Direct support for artisans
                  </div>
                </div>

                <Button
                  onClick={() => choose('buyer')}
                  className="mt-auto bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold text-lg py-3"
                  size="lg"
                >
                  Continue as Buyer
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 hover:border-neonaccent transition-all duration-300 hover:shadow-xl h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-neonaccent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="palette" size={48} className="text-primary" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold mb-2">I'm an Artisan</h2>
                  <p className="font-paragraph text-primary/70 leading-relaxed">
                    Join our marketplace and share your handcrafted creations with art lovers worldwide. Access AI tools, analytics, and grow your creative business.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-primary/80">
                    <Icon name="sparkles" size={16} className="text-neonaccent mr-2" />
                    AI Copilot for product descriptions
                  </div>
                  <div className="flex items-center text-sm text-primary/80">
                    <Icon name="barchart" size={16} className="text-neonaccent mr-2" />
                    Sales analytics and insights
                  </div>
                  <div className="flex items-center text-sm text-primary/80">
                    <Icon name="target" size={16} className="text-neonaccent mr-2" />
                    AI-powered pricing optimization
                  </div>
                  <div className="flex items-center text-sm text-primary/80">
                    <Icon name="building" size={16} className="text-neonaccent mr-2" />
                    Global marketplace exposure
                  </div>
                </div>

                <Button
                  onClick={() => choose('artisan')}
                  className="mt-auto bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold text-lg py-3"
                  size="lg"
                >
                  Become an Artisan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="font-paragraph text-sm text-primary/60">
            Not sure yet? You can always change your role later in your profile settings.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
