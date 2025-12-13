'use client';

import { Header } from '@/components/common/header';
import { RecommendedCreators } from '@/components/creators/recommended-creators';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { UserProfile, Content } from '@/lib/chat-data';
import { collection, query, where, documentId } from 'firebase/firestore';
import { CreatorCard } from '@/components/creators/creator-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ContentCard } from '@/components/creators/content-card';

function SubscribedContentFeed() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfileDoc, loading: userProfileLoading } = useDoc(userProfileRef);
    const userProfile = userProfileDoc?.data() as UserProfile;
    const subscriptions = userProfile?.subscriptions || [];

    const subscribedCreatorsQuery = useMemo(() => {
        if (!firestore || subscriptions.length === 0) return null;
        return query(collection(firestore, 'users'), where(documentId(), 'in', subscriptions));
    }, [firestore, subscriptions]);

    const { data: creatorsData, loading: creatorsLoading } = useCollection(subscribedCreatorsQuery);

    const allContent = useMemo(() => {
        if (!creatorsData) return [];
        let content: (Content & { creator: UserProfile })[] = [];
        creatorsData.docs.forEach(doc => {
            const creator = { id: doc.id, ...doc.data() } as UserProfile & { id: string };
            if (creator.content) {
                const creatorContent = creator.content.map(c => ({
                    ...c,
                    // Attach creator info to each content piece
                    creator: {
                        id: creator.id,
                        displayName: creator.displayName,
                        photoURL: creator.photoURL,
                    } as UserProfile,
                }));
                content = [...content, ...creatorContent];
            }
        });
        // Simple sort by title for now, could be timestamp in a real app
        return content.sort((a, b) => a.title.localeCompare(b.title));
    }, [creatorsData]);

    const loading = userProfileLoading || creatorsLoading;

    if (loading) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card className="group overflow-hidden relative" key={i}>
                        <Skeleton className="w-full aspect-[3/2]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }
    
    if (allContent.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border-2 border-dashed border-border">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-headline text-2xl font-bold">Découvrez de nouveaux créateurs</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                    Votre fil d'actualité est vide. Abonnez-vous à des créateurs pour voir leur contenu ici.
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
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allContent.map((contentItem) => (
                <ContentCard key={`${contentItem.creator.id}-${contentItem.id}`} content={contentItem} />
            ))}
        </div>
    );
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
            <SubscribedContentFeed />
        </section>

        <Separator className="my-12" />

        <RecommendedCreators />

      </main>
    </div>
  );
}
