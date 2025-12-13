'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email) return;

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'E-mail envoyé',
        description: 'Si un compte existe, vous recevrez un lien pour réinitialiser votre mot de passe.',
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending password reset email', error);
      // We show a generic message to prevent email enumeration
      toast({
        title: 'E-mail envoyé',
        description: 'Si un compte existe, vous recevrez un lien pour réinitialiser votre mot de passe.',
      });
       setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <main className="flex w-full max-w-sm flex-col items-center text-center">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <h1 className="mt-4 font-headline text-4xl font-bold">
          {isSubmitted ? 'Vérifiez vos e-mails' : 'Mot de passe oublié'}
        </h1>
        <p className="mt-2 max-w-xs text-base text-muted-foreground">
          {isSubmitted
            ? `Nous avons envoyé un lien de réinitialisation à ${email}.`
            : "Pas de problème. Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation."}
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleResetPassword} className="w-full space-y-4 mt-8">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-card border-border/50 text-base pl-10"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
            </Button>
          </form>
        ) : (
             <Button
              size="lg"
              className="w-full h-12 text-base mt-8"
              onClick={() => router.push('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
        )}

        { !isSubmitted && (
            <div className="mt-8 w-full">
                <Button
                    variant="link"
                    className="w-full h-12 text-base text-muted-foreground"
                    asChild
                >
                    <Link href="/login"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion</Link>
                </Button>
            </div>
        )}
      </main>
    </div>
  );
}
