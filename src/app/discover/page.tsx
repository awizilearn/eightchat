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

function AllCreators() {
    const firestore = useFirestore();

    const creatorsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'createur'));
    }, [firestore]);

    const { data: creatorsData, loading } = useCollection(creatorsQuery);

    const creators = useMemo(() => {
        if (!creatorsData) return [];
        return creatorsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile & { id: string }));
    }, [creatorsData]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-40 w-full" />
                        <div className="flex items-center space-x-4 p-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                         <div className="px-4 pb-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                         </div>
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
            ))}
        </div>
    );
}


export default function DiscoverPage() {
  return (
    <>
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
      <footer className="py-8 mt-16 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </>
  );
}
