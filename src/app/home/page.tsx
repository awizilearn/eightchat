'use client';

import { Header } from '@/components/common/header';
import { RecommendedCreators } from '@/components/creators/recommended-creators';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { UserProfile } from '@/lib/chat-data';
import { collection, query, where, documentId, getDocs, doc } from 'firebase/firestore';
import { CreatorCard } from '@/components/creators/creator-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

function SubscribedCreators() {
    const { user } = useUser();
    const firestore = useFirestore();

    // Get current user's profile to read their subscriptions
    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfileDoc, loading: userProfileLoading } = useDoc(userProfileRef);
    const userProfile = userProfileDoc?.data() as UserProfile;
    
    const subscriptions = userProfile?.subscriptions || [];

    const creatorsQuery = useMemo(() => {
        if (!firestore || subscriptions.length === 0) return null;
        return query(collection(firestore, 'users'), where(documentId(), 'in', subscriptions));
    }, [firestore, subscriptions]);

    const { data: creatorsData, loading: creatorsLoading } = useCollection(creatorsQuery);
    
    const creators = useMemo(() => {
        if (!creatorsData) return [];
        return creatorsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile & { id: string }));
    }, [creatorsData]);

    const loading = userProfileLoading || creatorsLoading;

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                     <Card className="overflow-hidden" key={i}>
                        <CardContent className="p-0">
                            <div className="relative h-40 w-full">
                                <Skeleton className="h-full w-full" />
                            </div>
                            <div className="p-4 pt-0 -mt-10 relative z-10 flex items-end gap-4">
                                <Skeleton className="h-20 w-20 rounded-full border-4 border-card" />
                                <div className="pb-2 space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                            <div className="px-4 pb-4 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (creators.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border-2 border-dashed border-border">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-headline text-2xl font-bold">Découvrez de nouveaux créateurs</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                    Vous n'êtes abonné à aucun créateur pour le moment. Explorez la communauté pour trouver du contenu qui vous inspire.
                </p>
                <Button asChild>
                    <Link href="/discover">
                        Découvrir les créateurs
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
            ))}
        </div>
    )
}


export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="pb-24">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-12">
            <h1 className="font-headline text-4xl font-bold">
                Bienvenue, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'dans l\'Enclave'}</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                Retrouvez ici les dernières nouvelles de vos créateurs favoris.
            </p>
        </div>

        <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold mb-6">
                Vos Abonnements
            </h2>
            <SubscribedCreators />
        </section>

        <Separator className="my-12" />

        <RecommendedCreators />

      </main>
    </div>
  );
}
