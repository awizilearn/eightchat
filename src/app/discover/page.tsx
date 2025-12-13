'use client';

import { Header } from '@/components/common/header';
import { CreatorCard } from '@/components/creators/creator-card';
import { RecommendedCreators } from '@/components/creators/recommended-creators';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import type { UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

function AllCreators() {
    const firestore = useFirestore();

    const creatorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'createur'));
    }, [firestore]);

    const { data: creators, loading } = useCollection<UserProfile & { id: string }>(creatorsQuery);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
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
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators && creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
            ))}
        </div>
    );
}


export default function DiscoverPage() {
  return (
    <div className="pb-24">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <RecommendedCreators />

        <Separator className="my-12" />

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold">
              Tous les créateurs
            </h2>
          </div>
          <AllCreators />
        </section>
      </main>
    </div>
  );
}
