'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import {
  collection,
  query,
  where,
  doc,
  addDoc,
  serverTimestamp,
  orderBy,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { type Conversation, type Message, type UserProfile } from '@/lib/chat-data';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { useSearchParams, useRouter } from 'next/navigation';
import { encryptMessage, decryptMessage, rehydratePreKeyBundle } from '@/lib/signal-protocol';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const UNLOCKED_MESSAGES_STORAGE_KEY = 'unlocked_messages';

function ChatHeader({ conversation }: { conversation: Conversation | null | undefined }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const otherParticipantId = useMemo(() => {
      if (!conversation) return null;
      return conversation.participantIds.find(id => id !== user?.uid);
  }, [conversation, user]);

  const participantRef = useMemoFirebase(() => {
      if (!firestore || !otherParticipantId) return null;
      return doc(firestore, 'users', otherParticipantId);
  }, [firestore, otherParticipantId]);

  const { data: participantDoc, loading } = useDoc(participantRef);
  const participant = participantDoc?.data() as UserProfile;

  if (loading || !conversation) {
    return (
      <div className="sticky top-0 z-10 border-b border-white/10 bg-background p-4 pb-2">
        <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-12 w-12" />
        </div>
        <div className="flex justify-around pt-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="sticky top-0 z-10 border-b border-white/10 bg-background p-4 pb-2">
        <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-transparent text-white">
                    <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
                </button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant?.photoURL} alt={participant?.displayName} />
                  <AvatarFallback>{participant?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">{participant?.displayName}</h2>
            </div>
            <div className="flex items-center justify-end gap-2">
                <button className="flex h-12 w-12 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-white">
                    <span className="material-symbols-outlined text-white">lock</span>
                </button>
            </div>
        </div>
        <div className="flex justify-around pt-2">
            <button className="flex-1 border-b-2 border-primary pb-1 text-primary text-sm font-semibold">
                Chat
            </button>
            <button className="flex-1 border-b-2 border-transparent pb-1 text-muted-foreground/80 text-sm font-semibold">
                Exclusive
            </button>
        </div>
    </div>
  );
}


export default function ChatPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const conversationId = searchParams.get('conversationId');

  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map());
  const [unlockedMessages, setUnlockedMessages] = useState<Set<string>>(new Set());

  const { data: userProfileDoc } = useDoc(user && firestore ? doc(firestore, 'users', user.uid) : null);
  const userProfile = userProfileDoc?.data() as UserProfile;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(UNLOCKED_MESSAGES_STORAGE_KEY);
      if (saved) setUnlockedMessages(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(UNLOCKED_MESSAGES_STORAGE_KEY, JSON.stringify(Array.from(unlockedMessages)));
    }
  }, [unlockedMessages]);


  const conversationRef = useMemoFirebase(() => {
    if (!firestore || !conversationId) return null;
    return doc(firestore, 'conversations', conversationId);
  }, [firestore, conversationId]);

  const { data: conversationData, loading: conversationLoading } = useDoc(conversationRef);
  const conversation = useMemo(() => {
    if (!conversationData?.exists()) return null;
    return { id: conversationData.id, ...conversationData.data() } as Conversation;
  }, [conversationData]);
  
  const messagesQuery = useMemoFirebase(() => {
    if (!conversationId || !firestore) return null;
    return query(
      collection(firestore, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, conversationId]);

  const { data: messagesData, loading: messagesLoading } = useCollection(messagesQuery);

  const messages: Message[] = useMemo(() => {
    if (!messagesData) return [];
    return messagesData.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
  }, [messagesData]);

  useEffect(() => {
    if (!user) return;
    messages.forEach(async (msg) => {
      if (msg.senderId === user.uid || msg.isPaid || !msg.text || decryptedMessages.has(msg.id)) {
        return;
      }
      try {
        const plaintext = await decryptMessage(msg.senderId, msg.text);
        setDecryptedMessages(prev => new Map(prev).set(msg.id, plaintext));
      } catch (error) {
        console.error('Failed to decrypt message:', msg.id, error);
        setDecryptedMessages(prev => new Map(prev).set(msg.id, '⚠️ Failed to decrypt'));
      }
    });
  }, [messages, user, decryptedMessages]);

  const handleSendMessage = async (text: string) => {
    if (!user || !conversationId || !firestore || !conversation) return;

    const otherParticipantId = conversation.participantIds.find(id => id !== user.uid);
    if (!otherParticipantId) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de trouver le destinataire." });
      return;
    }
    
    const recipientDocRef = doc(firestore, 'users', otherParticipantId);
    const recipientDocSnap = await getDoc(recipientDocRef);
    
    if (!recipientDocSnap.exists() || !recipientDocSnap.data().signalPreKeyBundle) {
        toast({ variant: "destructive", title: "Erreur de chiffrement", description: "Le destinataire n'a pas pu être vérifié pour le chiffrement." });
        return;
    }

    const recipientProfile = recipientDocSnap.data() as UserProfile;
    const rehydratedBundle = rehydratePreKeyBundle(recipientProfile.signalPreKeyBundle);
    
    try {
        const ciphertext = await encryptMessage(otherParticipantId, rehydratedBundle, text);
        
        const messagesColRef = collection(firestore, 'conversations', conversationId, 'messages');
        const conversationDocRef = doc(firestore, 'conversations', conversationId);

        await addDoc(messagesColRef, {
            senderId: user.uid,
            text: ciphertext,
            plaintext: text,
            createdAt: serverTimestamp(),
            isPaid: false,
        });

        await updateDoc(conversationDocRef, {
            lastMessage: 'Message chiffré',
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error encrypting or sending message:", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer le message chiffré." });
    }
  };

  const handleSendPaidMessage = async (content: { title: string; price: number; imageUrl: string; }) => {
    if (!user || !conversationId || !firestore) return;

    const messagesColRef = collection(firestore, 'conversations', conversationId, 'messages');
    const conversationDocRef = doc(firestore, 'conversations', conversationId);

    try {
      await addDoc(messagesColRef, {
          senderId: user.uid,
          text: 'Paid Content',
          createdAt: serverTimestamp(),
          isPaid: true,
          contentTitle: content.title,
          contentPrice: content.price,
          contentImageUrl: content.imageUrl,
          contentType: 'image',
      });

      await updateDoc(conversationDocRef, {
          lastMessage: `Contenu payant : ${content.title}`,
          updatedAt: serverTimestamp(),
      });
      toast({ title: "Succès", description: "Votre contenu payant a été envoyé." });
    } catch (error) {
      console.error("Error sending paid message:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer le contenu payant." });
    }
  };

  const getDisplayableMessage = useCallback((message: Message): Message => {
    if (message.isPaid) return message;
    if (message.senderId === user?.uid) return { ...message, text: message.plaintext || 'Message envoyé' };
    const decryptedText = decryptedMessages.get(message.id);
    return { ...message, text: decryptedText || "Déchiffrement..." };
  }, [decryptedMessages, user]);

  const handleUnlockContent = (messageId: string) => {
    setUnlockedMessages(prev => new Set(prev).add(messageId));
  };

  const displayableMessages = useMemo(() => messages.map(getDisplayableMessage), [messages, getDisplayableMessage]);
  
  if (!conversationId) {
    return (
        <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background items-center justify-center">
            <p className="text-muted-foreground">Aucune conversation sélectionnée.</p>
            <Button onClick={() => router.push('/discover')}>Explorer les créateurs</Button>
        </div>
    )
  }

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background">
      <ChatHeader conversation={conversation} />
      <MessageList 
          messages={displayableMessages} 
          currentUserId={user?.uid} 
          loading={messagesLoading || conversationLoading}
          unlockedMessages={unlockedMessages}
          onUnlockContent={handleUnlockContent}
      />
      <MessageInput 
        onSendMessage={handleSendMessage} 
        onSendPaidMessage={handleSendPaidMessage}
        isCreator={userProfile?.role === 'createur'}
      />
    </div>
  );
}
