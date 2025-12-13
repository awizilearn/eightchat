
'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionTiers } from '@/components/creators/subscription-tiers';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtb3VudGFpbnN8ZW58MHx8fHwxNzY1MzkxOTk3fDA&ixlib=rb-4.1.0&q=80&w=1080';

// We can create a simple local header as the new design is specific to this page
function ProfileHeader() {
    const router = useRouter();
    return (
        <div className="sticky top-0 z-20 flex items-center bg-background/80 p-4 pb-2 justify-between backdrop-blur-sm">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <span className="material-symbols-outlined text-3xl">arrow_back</span>
            </Button>
            <div className="flex items-center justify-center">
                <p className="text-lg font-bold">Profile</p>
            </div>
            <div className="flex w-12 items-center justify-end">
                <Button variant="ghost" size="icon">
                    <span className="material-symbols-outlined">more_horiz</span>
                </Button>
            </div>
        </div>
    );
}

function CreatorProfileSkeleton() {
    return (
        <div className="bg-background min-h-screen">
            <ProfileHeader />
             <div className="relative px-4">
                <Skeleton className="w-full rounded-lg min-h-[160px]" />
                <div className="absolute bottom-0 left-4 translate-y-1/2">
                    <Skeleton className="rounded-full min-h-24 w-24 border-4 border-background" />
                </div>
            </div>
            <div className="pt-16 px-4">
                <div className="flex flex-col justify-center space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex flex-wrap gap-4 pt-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="pt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
            <div className="flex w-full max-w-full gap-3 p-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-32" />
            </div>
             <div className="w-full px-4">
                 <div className="border-b border-border flex">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                 </div>
                 <div className="grid grid-cols-3 gap-1 pt-4 pb-8">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
                 </div>
             </div>
        </div>
    )
}

function LockedContentTeaser({imageUrl, alt}: {imageUrl: string, alt: string}) {
    return (
        <div className="relative aspect-square rounded-lg overflow-hidden group">
            <Image 
                src={imageUrl} 
                alt={alt} 
                fill 
                className="object-cover transition-all duration-300"
                style={{ filter: 'blur(12px)', transform: 'scale(1.1)' }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">lock</span>
            </div>
        </div>
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
  
  const creatorRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'users', params.id);
  }, [firestore, params.id]);
  
  const { data: creatorDoc, loading: creatorLoading } = useDoc(creatorRef);
  const creator = creatorDoc?.data() as UserProfile | undefined;

  const loading = creatorLoading;

  const handleMessageCreator = async () => {
    if (!user || !firestore || !creator) return;
    const conversationsRef = collection(firestore, 'conversations');
    const q = query(
      conversationsRef,
      where('participantIds', '==', [user.uid, params.id].sort())
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const conversationId = querySnapshot.docs[0].id;
      router.push(`/messages?conversationId=${conversationId}`);
    } else {
      try {
        const newConversation = await addDoc(conversationsRef, {
          participantIds: [user.uid, params.id].sort(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: '',
        });
        router.push(`/messages?conversationId=${newConversation.id}`);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    }
  };
  
  const handleSubscribe = () => {
    document.getElementById('subscription-tiers')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (loading) {
    return <CreatorProfileSkeleton />;
  }

  if (!creatorDoc?.exists() || !creator) {
    notFound();
  }
  
  const subscriptionPrice = creator.tiers?.[0]?.price?.toFixed(2) || '9.99';

  return (
    <div className="bg-background min-h-screen">
        <ProfileHeader />
        
        <div className="relative px-4">
            <Image 
                src={creator.bannerUrl || DEFAULT_BANNER} 
                alt={`${creator.displayName}'s banner`}
                width={1080}
                height={400}
                className="w-full object-cover rounded-lg min-h-[160px]"
            />
            <div className="absolute bottom-0 left-4 translate-y-1/2">
                <Image 
                    src={creator.photoURL}
                    alt={creator.displayName}
                    width={96}
                    height={96}
                    className="rounded-full aspect-square object-cover min-h-24 w-24 border-4 border-background"
                />
            </div>
        </div>

        <div className="pt-16 px-4">
            <div className="flex flex-col justify-center">
                <p className="text-foreground text-2xl font-bold leading-tight tracking-[-0.015em]">{creator.displayName}</p>
                <p className="text-muted-foreground text-base font-normal leading-normal">@{creator.displayName.toLowerCase().replace(/\s/g, '')}creates</p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-1.5">
                    <p className="text-foreground tracking-light text-base font-bold leading-tight">1.2k</p>
                    <p className="text-muted-foreground text-base font-normal leading-normal">Subscribers</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <p className="text-foreground tracking-light text-base font-bold leading-tight">{creator.content?.length || 0}</p>
                    <p className="text-muted-foreground text-base font-normal leading-normal">Posts</p>
                </div>
            </div>

            <p className="text-foreground text-base font-normal leading-normal pt-4">{creator.bio}</p>
        </div>

        <div className="flex w-full max-w-full gap-3 p-4">
            <Button 
                className="flex-1 h-12 px-6 rounded-full bg-primary text-primary-foreground text-base font-bold"
                onClick={handleSubscribe}
                disabled={params.id === user?.uid}
            >
                <span className="truncate">Subscribe for ${subscriptionPrice}/month</span>
            </Button>
            <Button 
                className="h-12 px-4 rounded-full bg-card text-foreground text-sm font-bold gap-2"
                onClick={handleMessageCreator}
                disabled={params.id === user?.uid}
            >
                <span className="material-symbols-outlined text-xl">lock</span>
                <span className="truncate">Message</span>
            </Button>
        </div>
        
        {creator.tiers && creator.tiers.length > 0 && (
            <SubscriptionTiers 
                tiers={creator.tiers} 
                creatorName={creator.displayName}
                creatorId={params.id}
                disabled={params.id === user?.uid}
            />
        )}

        <div className="w-full px-4">
            <Tabs defaultValue="posts">
                <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-border rounded-none p-0">
                    <TabsTrigger value="posts" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">Posts</TabsTrigger>
                    <TabsTrigger value="videos" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">Videos</TabsTrigger>
                    <TabsTrigger value="collections" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">Collections</TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="pt-4 pb-8">
                     <div className="grid grid-cols-3 gap-1">
                        {creator.content && creator.content.length > 0 ? (
                           creator.content.map((item, index) => {
                               // Simulate some locked content for the demo
                               if (index % 2 !== 0 && index > 0) {
                                   return <LockedContentTeaser key={item.id} imageUrl={item.imageUrl} alt={item.title} />
                               }
                               return (
                                   <div key={item.id} className="aspect-square relative rounded-lg overflow-hidden group">
                                     <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105"/>
                                   </div>
                               )
                           })
                        ) : (
                            <p className="col-span-3 text-center text-muted-foreground py-8">Aucun post pour le moment.</p>
                        )}
                    </div>
                </TabsContent>
                 <TabsContent value="videos" className="pt-4 pb-8">
                    <p className="col-span-3 text-center text-muted-foreground py-8">Aucune vidéo pour le moment.</p>
                 </TabsContent>
                 <TabsContent value="collections" className="pt-4 pb-8">
                    <p className="col-span-3 text-center text-muted-foreground py-8">Aucune collection pour le moment.</p>
                 </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
