'use client';

import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
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

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        d="M12.012 15.388c-.68 0-1.385-.23-2.134-.712-1.21-.78-2.45-2.253-2.45-4.132 0-2.344 1.57-3.923 3.655-3.923 1.155 0 2.06.52 2.755.52.67 0 1.68-.535 2.87-.535 2.075 0 3.51 1.353 3.51 3.427 0 1.48-.73 2.92-1.815 3.822-1.14.93-2.255 1.5-3.555 1.516-.11.002-.22.002-.33.002a11.3 11.3 0 0 1-.996-.01zm.14-12.722c.925-.03 1.95.45 2.67.98.63.46 1.12.9 1.59 1.53.03.04.05.08.05.13 0 .07-.03.13-.08.17-.58.48-1.04 1.14-1.04 1.95 0 .2.02.4.06.59-.57.06-1.12.22-1.7.22-.64 0-1.35-.26-2.12-.73-1.1-.68-2.2-2.15-2.2-3.8 0-1.95 1.25-3.14 2.86-3.14.36 0 .7.09 1.1.13z"
        fill="currentColor"
      />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  
  const handleSocialSignIn = async (provider: GoogleAuthProvider | TwitterAuthProvider | OAuthProvider) => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, provider);
      // The useEffect hook will handle redirection
    } catch (error) {
      console.error('Error signing in with social provider', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de se connecter avec ce service. Veuillez réessayer."
      })
    }
  };


  const handleGoogleSignIn = () => handleSocialSignIn(new GoogleAuthProvider());
  const handleTwitterSignIn = () => handleSocialSignIn(new TwitterAuthProvider());
  const handleAppleSignIn = () => handleSocialSignIn(new OAuthProvider('apple.com'));

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;
    
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect hook will handle redirection
    } catch (error: any) {
      console.error('Error signing in with email', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "L'adresse e-mail ou le mot de passe est incorrect."
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
          Welcome Back
        </h1>
        <p className="mt-2 max-w-xs text-base text-muted-foreground">
          Login to access your exclusive creator content and encrypted messages.
        </p>

        <form onSubmit={handleEmailSignIn} className="w-full space-y-4 mt-8">
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
            <div className="text-right">
                <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot Password?
                </Link>
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Logging In...' : 'Log In'}
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
        
        <div className="w-full grid grid-cols-3 gap-3">
             <Button
                className="w-full h-12 text-md"
                variant="outline"
                onClick={handleGoogleSignIn}
            >
                <GoogleIcon className="h-5 w-5" />
            </Button>
             <Button
                className="w-full h-12 text-md"
                variant="outline"
                onClick={handleTwitterSignIn}
            >
                <XIcon className="h-5 w-5" />
            </Button>
             <Button
                className="w-full h-12 text-md"
                variant="outline"
                onClick={handleAppleSignIn}
            >
                <AppleIcon className="h-6 w-6" />
            </Button>
        </div>

        <div className="mt-8 w-full">
             <Button
                variant="outline"
                className="w-full h-12 text-base"
                asChild
            >
                <Link href="/signup">Sign Up</Link>
            </Button>
        </div>
        
        <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{' '}
            <Link href="#" className="underline hover:text-primary">
                Terms
            </Link>{' '}
            and{' '}
            <Link href="#" className="underline hover:text-primary">
                Privacy Policy
            </Link>
            .
        </p>

      </main>
    </div>
  );
}
