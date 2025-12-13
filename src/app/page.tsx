'use client';

import { ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection } from '@/firebase';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/common/header';
import { CreatorCard } from '@/components/creators/creator-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { collection, query, where, limit } from 'firebase/firestore';
import type { UserProfile } from '@/lib/chat-data';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';


function FeaturedCreators() {
    const firestore = useFirestore();

    const creatorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Get 4 creators to feature
        return query(collection(firestore, 'users'), where('role', '==', 'createur'), limit(4));
    }, [firestore]);

    const { data: creators, loading } = useCollection(creatorsQuery);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card className="overflow-hidden" key={i}>
                        <CardContent className="p-0">
                            <Skeleton className="h-40 w-full" />
                            <div className="p-4 pt-0 -mt-10 relative z-10 flex items-end gap-4">
                                <Skeleton className="h-20 w-20 rounded-full border-4 border-card" />
                                <div className="pb-2 space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators && creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
            ))}
        </div>
    );
}


export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Loading...</div>
  }
  
  if (user) {
    router.replace('/home');
    return <div className="flex h-screen w-full items-center justify-center bg-background">Redirecting...</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
            <section className="container mx-auto px-4 py-20 text-center">
                <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight">
                    Enter the <span className="text-primary">Golden Enclave</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Unlock exclusive content, connect with creators, and support the arts you love. Your gateway to a more intimate and secure creator economy.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" asChild className="h-12 text-base">
                        <Link href="/welcome">
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-24">
                 <h2 className="text-3xl font-bold text-center mb-10">Featured Creators</h2>
                 <FeaturedCreators />
            </section>
        </main>

        <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
        </footer>
    </div>
  );
}
