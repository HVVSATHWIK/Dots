import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { member, isAuthenticated } = useMember();

  // If we already have a role and (if artisan) maybe profile complete in future, skip.
  useEffect(() => {
    if (member?.role === 'artisan') {
      navigate('/dashboard', { replace: true });
    } else if (member?.role === 'buyer') {
      // If explicitly buyer doc exists, skip selection (we could allow revisit by query param later)
    }
  }, [member?.role]);

  function choose(role: 'buyer' | 'artisan') {
    // Store the desired role in session; the auth context will merge it upon login or next refresh.
    sessionStorage.setItem('dots_role', role);
    // If authenticated already, force a soft reload to trigger merge in provider logic.
    if (isAuthenticated) {
      // Redirect logic: if artisan -> profile setup; if buyer -> dashboard
      if (role === 'artisan') {
        navigate('/profile/setup');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/signup');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full space-y-10">
        <div className="text-center space-y-3">
          <h1 className="font-heading text-3xl font-bold text-primary">Choose How You Want to Continue</h1>
          <p className="font-paragraph text-primary/70 max-w-xl mx-auto">Select a path below. You can explore as a Buyer or build your creative presence as an Artisan. (You can switch later.)</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-neonaccent transition-colors">
            <CardContent className="p-6 flex flex-col h-full">
              <h2 className="font-heading text-xl font-bold mb-2">Buyer</h2>
              <p className="font-paragraph text-sm text-primary/70 flex-1">Discover handcrafted works, curate wishlists, and use AI Assistant for discovery tips.</p>
              <Button onClick={() => choose('buyer')} className="mt-6 bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold">Continue as Buyer</Button>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-neonaccent transition-colors">
            <CardContent className="p-6 flex flex-col h-full">
              <h2 className="font-heading text-xl font-bold mb-2">Artisan (Seller)</h2>
              <p className="font-paragraph text-sm text-primary/70 flex-1">Access AI Copilot tools, set up your artisan profile, and prepare product listings.</p>
              <Button onClick={() => choose('artisan')} className="mt-6 bg-neonaccent text-primary hover:bg-neonaccent/90 font-heading font-bold">Become an Artisan</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
