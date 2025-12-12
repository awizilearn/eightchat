'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreatorCard } from '@/components/creators/creator-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import type { UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';

function CreatorsShowcase() {
    const firestore = useFirestore();

    const creatorsQuery = useMemo(() => {
        if (!firestore) return null;
        // Fetch a limited number of creators for the showcase
        return query(collection(firestore, 'users'), where('role', '==', 'createur'), limit(1));
    }, [firestore]);

    const { data: creatorsData, loading } = useCollection(creatorsQuery);

    const creators = useMemo(() => {
        if (!creatorsData) return [];
        return creatorsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile & { id: string }));
    }, [creatorsData]);

    if (loading) {
        return (
            <div className="my-8 w-full max-w-sm">
               <div className="flex flex-col space-y-4 rounded-xl border bg-card text-card-foreground shadow">
                    <Skeleton className="h-40 w-full" />
                    <div className="flex items-end space-x-4 px-4">
                        <Skeleton className="h-20 w-20 -mt-10 border-4 border-card rounded-full" />
                        <div className="space-y-2 pb-2">
                            <Skeleton className="h-5 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                    </div>
                     <div className="px-4 pb-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                     </div>
                </div>
            </div>
        );
    }
    
    if (creators.length === 0) {
        return null; // Don't show anything if no creators are found
    }

    return (
        <div className="my-8 w-full max-w-sm">
            {creators.map((creator) => (
                 <CreatorCard key={creator.id} creator={creator} />
            ))}
        </div>
    );
}


export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <main className="flex w-full max-w-4xl flex-col items-center text-center">
        <ShieldCheck className="h-10 w-10 text-primary" />
        
        <h1 className="mt-4 font-headline text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Unlock Exclusive Worlds
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Access premium content from your favorite creators. Subscribe securely
          with Stripe or Crypto and connect with end-to-end encrypted
          messaging.
        </p>

        <CreatorsShowcase />

        <div className="mt-4 flex w-full max-w-md flex-col gap-4">
          <Button
            size="lg"
            className="h-12 text-base"
            onClick={() => router.push('/signup')}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => router.push('/login')}
          >
            Already have an account? Log In
          </Button>
        </div>
      </main>
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
