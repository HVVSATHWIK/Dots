import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMember } from '@/integrations';

interface SignInProps {
  title?: string;
  message?: string;
  className?: string;
  cardClassName?: string;
  buttonClassName?: string;
  buttonText?: string;
}

export function SignIn({
  title = "Sign In Required",
  message = "Please sign in to access this content.",
  className = "min-h-screen flex items-center justify-center px-4",
  cardClassName = "w-full max-w-xl mx-auto",
  buttonClassName = "w-full h-12 text-base max-w-sm mx-auto",
  buttonText = "Sign In"
}: SignInProps) {
  const { actions } = useMember();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className={className}>
      <Card className={cardClassName}>
        <CardHeader className="text-center space-y-4 py-10 px-10">
          <CardTitle className="text-3xl font-bold text-secondary-foreground">{title}</CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center px-10 pb-10">
          {err && (
            <div role="alert" className="text-sm text-red-600 mb-3">{err}</div>
          )}
          <Button
            onClick={async () => {
              setErr(null);
              try {
                await actions.login();
              } catch (e: any) {
                const code: string = e?.code || '';
                if (code.includes('auth/operation-not-allowed')) setErr('Sign-in is disabled for this project. Enable Google sign-in in Firebase console.');
                else if (code.includes('network-request-failed')) setErr('Network error. Check your connection and try again.');
                else if (code.includes('popup-')) setErr('Popup was blocked or closed. If it persists, allow popups or we will retry with a full-page redirect.');
                else setErr('Sign-in failed. Please try again.');
              }
            }}
            className={buttonClassName}
          >
            {buttonText}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">If the popup is blocked, we’ll automatically switch to a full-page sign-in.</p>
        </CardContent>
      </Card>
    </div>
  );
}
