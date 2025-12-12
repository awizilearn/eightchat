'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export default function SignUpStepOnePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'abonne' | 'createur' | ''>('');

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1D1C1A]">
        Chargement...
      </div>
    );
  }

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/signup/step-2?role=${selectedRole}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1D1C1A] p-4 text-white">
      <main className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-8 flex items-center gap-2">
          <div className="h-1.5 w-10 bg-primary rounded-full" />
          <div className="h-1.5 w-10 bg-border rounded-full" />
        </div>
        <div className="w-full max-w-sm text-center mb-8">
          <h1 className="font-headline text-4xl font-bold">Join the Inner Circle</h1>
          <p className="mt-2 text-base text-muted-foreground">Select your role to customize your experience.</p>
        </div>

        <div className="w-full space-y-4">
          <Card
            onClick={() => setSelectedRole('abonne')}
            className={cn(
              'p-4 text-left cursor-pointer transition-all duration-200 border-2 bg-card',
              selectedRole === 'abonne'
                ? 'border-primary'
                : 'border-border/50 hover:border-border'
            )}
          >
            <CardContent className="p-0 relative flex items-center gap-4">
              {selectedRole === 'abonne' && (
                <CheckCircle className="h-5 w-5 text-primary absolute top-0 right-0 bg-card rounded-full" />
              )}
              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Subscriber</p>
                <p className="text-xs text-muted-foreground mt-1">Discover & support exclusive creators</p>
              </div>
            </CardContent>
          </Card>
          <Card
            onClick={() => setSelectedRole('createur')}
            className={cn(
              'p-4 text-left cursor-pointer transition-all duration-200 border-2 bg-card',
              selectedRole === 'createur'
                ? 'border-primary'
                : 'border-border/50 hover:border-border'
            )}
          >
            <CardContent className="p-0 relative flex items-center gap-4">
              {selectedRole === 'createur' && (
                <CheckCircle className="h-5 w-5 text-primary absolute top-0 right-0 bg-card rounded-full" />
              )}
              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Creator</p>
                <p className="text-xs text-muted-foreground mt-1">Publish content, monetize & earn</p>
              </div>
            </CardContent>
          </Card>

           <Button
                size="lg"
                className="w-full h-12 text-base font-bold text-black mt-6"
                disabled={!selectedRole}
                onClick={handleContinue}
            >
                Continue
            </Button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>

        <p className="flex items-center gap-2 mt-6 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          Encrypted via Signal Protocol
        </p>
      </main>
    </div>
  );
}
