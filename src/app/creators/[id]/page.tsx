'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/common/header';
import { Button } from '@/components/ui/button';
import { MessageCircle, Check, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SubscriptionTierCard } from '@/components/creators/subscription-tier-card';
import { ContentCard } from '@/components/creators/content-card';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore, useDoc } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import type { UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtb3VudGFpbnN8ZW58MHx8fHwxNzY1MzkxOTk3fDA&ixlib=rb-4.1.0&q=80&w=1080';


function CreatorProfileSkeleton() {
    return (
        <>
            <Header />
            <main>
                <div className="relative h-64 w-full md:h-80 bg-muted">
                    <Skeleton className="h-full w-full" />
                </div>
                 <div className="container mx-auto -mt-20 px-4 pb-12">
                    <div className="relative z-10 mb-8 flex flex-col items-center gap-6 md:flex-row md:items-end">
                        <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background" />
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <Skeleton className="h-10 w-64 mx-auto md:mx-0" />
                            <Skeleton className="h-6 w-32 mx-auto md:mx-0" />
                        </div>
                        <div className="flex gap-2">
                           <Skeleton className="h-12 w-32" />
                           <Skeleton className="h-12 w-32" />
                        </div>
                    </div>
                    <div className="space-y-2 mx-auto max-w-3xl text-center md:mx-0 md:text-left">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                 </div>
            </main>
        </>
    )
}

export default function CreatorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const creatorRef = doc(firestore, 'users', params.id);
  const { data: creatorDoc, loading: creatorLoading } = useDoc(creatorRef);
  const creator = creatorDoc?.data() as UserProfile | undefined;

  const currentUserRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: currentUserDoc, loading: userLoading } = useDoc(currentUserRef);
  const currentUserProfile = currentUserDoc?.data() as UserProfile | undefined;

  const isSubscribed = useMemo(() => {
    if (!currentUserProfile || !currentUserProfile.subscriptions) return false;
    return currentUserProfile.subscriptions.includes(params.id);
  }, [currentUserProfile, params.id]);

  const loading = creatorLoading || userLoading;

  if (loading) {
    return <CreatorProfileSkeleton />;
  }

  if (!creatorDoc?.exists() || !creator) {
    notFound();
  }

  const handleMessageCreator = async () => {
    if (!user || !firestore || !creator) return;

    const conversationsRef = collection(firestore, 'conversations');

    const existingConversationQuery = query(
      conversationsRef,
      where('participantIds', 'in', [
        [user.uid, params.id],
        [params.id, user.uid],
      ])
    );

    try {
      const querySnapshot = await getDocs(existingConversationQuery);
      let conversationId: string | null = null;

      if (!querySnapshot.empty) {
        const conversationDoc = querySnapshot.docs.find(doc => {
            const data = doc.data();
            const participants = data.participantIds as string[];
            return participants.length === 2 && participants.includes(user.uid) && participants.includes(params.id);
        });
        if(conversationDoc) {
          conversationId = conversationDoc.id;
        }
      } 
      
      if (!conversationId) {
        const newConversation = await addDoc(conversationsRef, {
          participantIds: [user.uid, params.id],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: '',
        });
        conversationId = newConversation.id;
      }

      if (conversationId) {
        router.push(`/chat?conversationId=${conversationId}`);
      }
    } catch (error) {
      console.error('Error handling conversation:', error);
    }
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <div className="relative h-64 w-full md:h-80">
          <Image
            src={creator.bannerUrl || DEFAULT_BANNER}
            alt={`${creator.displayName}'s banner`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto -mt-20 px-4 pb-12">
          {/* Creator Info Header */}
          <div className="relative z-10 mb-8 flex flex-col items-center gap-6 md:flex-row md:items-end">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg md:h-40 md:w-40">
              <AvatarImage
                src={creator.photoURL}
                alt={creator.displayName}
              />
              <AvatarFallback>{creator.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-headline text-4xl font-bold md:text-5xl">
                {creator.displayName}
              </h1>
              <p className="text-lg text-muted-foreground">{creator.category}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                variant="secondary"
                onClick={handleMessageCreator}
                disabled={params.id === user?.uid}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Message
              </Button>
              {isSubscribed ? (
                <Button
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary"
                    disabled
                >
                    <Check className="mr-2 h-5 w-5" />
                    Abonné
                </Button>
              ) : (
                <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={params.id === user?.uid}
                    onClick={() => {
                        // Logic to open subscription modal can be triggered from here
                        // For now, we can assume one of the tier cards will be clicked
                        const firstTier = document.getElementById('subscribe-button-0');
                        firstTier?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                >
                    <UserPlus className="mr-2 h-5 w-5" />
                    S'abonner
                </Button>
              )}
            </div>
          </div>

          <p className="mx-auto mb-12 max-w-3xl text-center text-foreground/90 md:mx-0 md:text-left">
            {creator.longBio}
          </p>

          <Separator className="my-12 bg-border/50" />

          {/* Subscription Tiers */}
          {creator.tiers && creator.tiers.length > 0 && (
            <section className="mb-16">
                <h2 className="text-center font-headline text-3xl font-bold mb-8">
                Rejoignez l'enclave de <span className="text-primary">{creator.displayName}</span>
                </h2>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                {creator.tiers.map((tier, index) => (
                    <SubscriptionTierCard
                      key={tier.name}
                      id={`subscribe-button-${index}`}
                      tier={tier}
                      creatorName={creator.displayName}
                      creatorId={params.id}
                      disabled={params.id === user?.uid}
                    />
                ))}
                </div>
            </section>
          )}

          <Separator className="my-12 bg-border/50" />

          {/* Content Grid */}
          {creator.content && creator.content.length > 0 && (
            <section>
                <h2 className="font-headline text-3xl font-bold mb-8">
                Contenu Exclusif
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {creator.content.map((item) => (
                    <ContentCard key={item.id} content={item} />
                ))}
                </div>
            </section>
          )}
        </div>
      </main>
      <footer className="border-t py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </>
  );
}
