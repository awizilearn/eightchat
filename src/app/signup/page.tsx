
'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.641C35.023 5.345 30.01 3 24 3C12.955 3 4 11.955 4 23s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691c2.16-3.859 6.229-6.394 10.994-6.394c3.059 0 5.842 1.154 7.961 3.039L29.165 15.3c-1.99-1.803-4.6-3-7.165-3c-3.975 0-7.485 2.16-9.282 5.432L6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 43c5.166 0 9.86-1.977 13.409-5.192l-4.782-3.727c-2.07 1.6-4.78 2.6-7.627 2.6c-4.383 0-8.221-2.731-9.84-6.57l-4.851 3.79C8.423 39.042 15.589 43 24 43z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H24v8h11.303c-0.792 2.237-2.231 4.16-4.087 5.571l4.782 3.727C42.107 34.09 44 29.835 44 25c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}


export default function SignUpPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          router.push('/home');
        } else {
          router.push('/complete-profile?new-user=true');
        }
      });
    }
  }, [user, loading, router, firestore]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: "Impossible de s'inscrire avec Google. Veuillez réessayer."
      })
    }
  };
  
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;
    if (password !== confirmPassword) {
        toast({
            variant: "destructive",
            title: "Erreur de mot de passe",
            description: "Les mots de passe ne correspondent pas."
        });
        return;
    }
    
    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing up with email', error);
      let description = "Une erreur est survenue. Veuillez réessayer.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.";
      } else if (error.code === 'auth/weak-password') {
        description = "Le mot de passe doit comporter au moins 6 caractères.";
      }

      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <main className="flex w-full max-w-sm flex-col items-center text-center">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <h1 className="mt-4 font-headline text-4xl font-bold">
          Create an Account
        </h1>
        <p className="mt-2 max-w-xs text-base text-muted-foreground">
          Join the enclave to access exclusive content.
        </p>

        <form onSubmit={handleEmailSignUp} className="w-full space-y-4 mt-8">
            <Input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-card border-border/50 text-base"
            />
            <div className="relative">
                 <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-card border-border/50 text-base pr-10"
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
             <div className="relative">
                 <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 bg-card border-border/50 text-base pr-10"
                />
            </div>

            <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </Button>
        </form>

        <div className="relative my-6 w-full">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
        </div>
        
        <div className="w-full">
             <Button
                className="w-full h-12 text-md"
                variant="outline"
                onClick={handleGoogleSignIn}
            >
                <GoogleIcon className="mr-2 h-5 w-5" />
                Continue with Google
            </Button>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
             <p>Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                    Log In
                </Link>
            </p>
        </div>
      </main>
    </div>
  );
}
