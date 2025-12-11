'use client';

import { useAuth, useUser } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';

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

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // We only want to check the user profile if we are not loading, we have a user, AND firestore is ready.
    if (!loading && user && firestore) {
      const checkUserProfile = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          router.push('/discover');
        } else {
          router.push('/complete-profile?new-user=true');
        }
      };
      checkUserProfile();
    }
  }, [user, loading, router, firestore]);

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex items-center gap-2 mb-8">
        <Crown className="h-10 w-10 text-primary" />
        <span className="font-headline text-4xl font-bold tracking-tight text-primary whitespace-nowrap">
          Golden Enclave
        </span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Join the enclave to access exclusive content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 text-md"
            variant="outline"
            onClick={handleSignIn}
          >
            <GoogleIcon className="mr-2 h-6 w-6" />
            Sign up with Google
          </Button>
          <div className="text-center text-sm text-muted-foreground">
             <p>Already have an account?{' '}
                <button onClick={() => router.push('/')} className="text-primary hover:underline">
                    Sign In
                </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
