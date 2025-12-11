'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { recommendContent } from '@/ai/flows/content-recommendation';
import { CreatorCard } from './creator-card';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { collection, query, where, documentId, getDocs, doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/chat-data';

export function RecommendedCreators() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [recommendedCreators, setRecommendedCreators] = useState<(UserProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current user's profile to read their subscriptions
  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfileDoc } = useDoc(userProfileRef);
  const userProfile = userProfileDoc?.data() as UserProfile;

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!firestore || !userProfile) {
        if (!user) setLoading(false); // If no user, don't load forever
        return;
      };

      try {
        setLoading(true);
        // Use real subscriptions if available, otherwise empty array
        const subscriptionHistory = userProfile.subscriptions || [];

        // Don't call AI if there's no history
        if (subscriptionHistory.length === 0) {
            setRecommendedCreators([]);
            setLoading(false);
            return;
        }

        const recommendations = await recommendContent({
          userId: user?.uid || 'anonymous',
          subscriptionHistory: subscriptionHistory,
        });

        if (recommendations.recommendations && recommendations.recommendations.length > 0) {
          // Filter out creators the user is already subscribed to
          const newRecommendations = recommendations.recommendations.filter(
            id => !subscriptionHistory.includes(id)
          );
          
          if (newRecommendations.length === 0) {
            setRecommendedCreators([]);
            setLoading(false);
            return;
          }

          const creatorsQuery = query(
            collection(firestore, 'users'),
            where(documentId(), 'in', newRecommendations)
          );
          const querySnapshot = await getDocs(creatorsQuery);
          const creators = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile & { id: string }));
          setRecommendedCreators(creators);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendedCreators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [firestore, user, userProfile]);

  if (loading) {
     return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-3xl font-bold text-primary">
                Pour vous
                </h2>
            </div>
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </section>
      );
  }

  // Don't show the section if there are no recommendations
  if (recommendedCreators.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-3xl font-bold text-primary">
          Pour vous
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendedCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
      </div>
    </section>
  );
}
