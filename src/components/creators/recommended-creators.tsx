'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { recommendContent } from '@/ai/flows/content-recommendation';
import { CreatorCard } from './creator-card';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, documentId, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/lib/chat-data';

export function RecommendedCreators() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [recommendedCreators, setRecommendedCreators] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, the user's subscriptions would be stored in their user profile.
  // For now, we'll hardcode them for the recommendation engine.
  const hardcodedSubscriptions = ['elena-moreau', 'isabella-rossi'];

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!firestore) return;
      try {
        setLoading(true);
        const recommendations = await recommendContent({
          userId: user?.uid || 'anonymous',
          subscriptionHistory: hardcodedSubscriptions,
        });

        if (recommendations.recommendations && recommendations.recommendations.length > 0) {
          const creatorsQuery = query(
            collection(firestore, 'users'),
            where(documentId(), 'in', recommendations.recommendations)
          );
          const querySnapshot = await getDocs(creatorsQuery);
          const creators = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
          setRecommendedCreators(creators);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [firestore, user]);

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
