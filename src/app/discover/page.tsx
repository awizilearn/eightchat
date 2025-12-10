import { Header } from '@/components/common/header';
import { CreatorCard } from '@/components/creators/creator-card';
import { creators, findCreatorsByIds, user } from '@/lib/data';
import { recommendContent } from '@/ai/flows/content-recommendation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function RecommendedCreators() {
  // Use a mock user's subscription history to get recommendations
  const recommendationInput = {
    userId: 'mock-user-01',
    subscriptionHistory: user.subscriptions,
  };

  let recommendedCreators: import('@/lib/data').Creator[] = [];

  try {
    const { recommendations } = await recommendContent(recommendationInput);
    recommendedCreators = findCreatorsByIds(recommendations);
  } catch (error) {
    console.error('AI recommendation failed, showing fallback creators.', error);
    // In case of an error, we'll fall through to the logic below which handles an empty list.
  }
  
  // If AI gives no results, IDs that don't match, or an error occurred, show a fallback.
  if (recommendedCreators.length === 0) {
    // Return a few creators as a fallback
    recommendedCreators = creators.slice(0, 3);
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {recommendedCreators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  );
}

function RecommendedCreatorsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <div className="flex items-end gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}

export default function DiscoverPage() {
  // Exclude recommended creators from the main discovery list to avoid duplication
  const otherCreators = creators.filter(c => !user.subscriptions.includes(c.id));

  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold text-primary">
              Recommended For You
            </h2>
            <Link href="#" className="flex items-center gap-2 text-accent-foreground hover:text-primary transition-colors">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <Suspense fallback={<RecommendedCreatorsSkeleton />}>
            <RecommendedCreators />
          </Suspense>
        </section>

        <section>
           <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold">
              Discover Creators
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {otherCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>
      </main>
      <footer className="py-8 mt-16 text-center text-muted-foreground border-t">
         <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </>
  );
}
