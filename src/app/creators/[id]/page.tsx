'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/common/header';
import { findCreatorById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { MessageCircle, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SubscriptionTierCard } from '@/components/creators/subscription-tier-card';
import { ContentCard } from '@/components/creators/content-card';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function CreatorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const creator = findCreatorById(params.id);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  if (!creator) {
    notFound();
  }

  const handleMessageCreator = async () => {
    if (!user || !firestore || !creator) return;

    const conversationsRef = collection(firestore, 'conversations');

    // Query to find an existing conversation between the user and the creator
    const existingConversationQuery = query(
      conversationsRef,
      where('participantIds', 'in', [
        [user.uid, creator.id],
        [creator.id, user.uid],
      ])
    );

    try {
      const querySnapshot = await getDocs(existingConversationQuery);
      let conversationId: string | null = null;

      if (!querySnapshot.empty) {
        // Conversation already exists
        conversationId = querySnapshot.docs[0].id;
      } else {
        // Conversation doesn't exist, create a new one
        const newConversation = await addDoc(conversationsRef, {
          participantIds: [user.uid, creator.id],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: '',
        });
        conversationId = newConversation.id;
      }

      if (conversationId) {
        // Redirect to the chat page with the specific conversation
        router.push(`/chat?conversationId=${conversationId}`);
      }
    } catch (error) {
      console.error('Error handling conversation:', error);
      // Optionally, show a toast or error message to the user
    }
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <div className="relative h-64 w-full md:h-80">
          <Image
            src={creator.banner.imageUrl}
            alt={`${creator.name}'s banner`}
            fill
            className="object-cover"
            priority
            data-ai-hint={creator.banner.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto -mt-20 px-4 pb-12">
          {/* Creator Info Header */}
          <div className="relative z-10 mb-8 flex flex-col items-center gap-6 md:flex-row md:items-end">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg md:h-40 md:w-40">
              <AvatarImage
                src={creator.avatar.imageUrl}
                alt={creator.name}
                data-ai-hint={creator.avatar.imageHint}
              />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-headline text-4xl font-bold md:text-5xl">
                {creator.name}
              </h1>
              <p className="text-lg text-muted-foreground">{creator.category}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                variant="secondary"
                onClick={handleMessageCreator}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Message
              </Button>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="mr-2 h-5 w-5" />
                Subscribed
              </Button>
            </div>
          </div>

          <p className="mx-auto mb-12 max-w-3xl text-center text-foreground/90 md:mx-0 md:text-left">
            {creator.longBio}
          </p>

          <Separator className="my-12 bg-border/50" />

          {/* Subscription Tiers */}
          <section className="mb-16">
            <h2 className="text-center font-headline text-3xl font-bold mb-8">
              Join the <span className="text-primary">{creator.name}'s Enclave</span>
            </h2>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              {creator.tiers.map((tier) => (
                <SubscriptionTierCard
                  key={tier.name}
                  tier={tier}
                  creatorName={creator.name}
                />
              ))}
            </div>
          </section>

          <Separator className="my-12 bg-border/50" />

          {/* Content Grid */}
          <section>
            <h2 className="font-headline text-3xl font-bold mb-8">
              Exclusive Content
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {creator.content.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </>
  );
}
