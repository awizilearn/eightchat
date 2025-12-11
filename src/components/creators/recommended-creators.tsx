'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { recommendContent } from '@/ai/flows/content-recommendation';
import { user, findCreatorsById, type Creator } from '@/lib/data';
import { CreatorCard } from './creator-card';

export function RecommendedCreators() {
  const [recommendedCreators, setRecommendedCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const recommendations = await recommendContent({
          userId: 'current-user', // In a real app, this would come from the auth context
          subscriptionHistory: user.subscriptions,
        });

        if (recommendations.recommendations) {
          const creators = findCreatorsByIds(recommendations.recommendations);
          setRecommendedCreators(creators);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Optionally, handle the error in the UI
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-3xl font-bold text-primary">
          Pour vous
        </h2>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : recommendedCreators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendedCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">
            Nous n'avons pas encore de recommandations pour vous.
            <br />
            Abonnez-vous à quelques créateurs pour commencer !
          </p>
        </div>
      )}
    </section>
  );
}
