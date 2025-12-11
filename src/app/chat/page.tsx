'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { Header } from '@/components/common/header';
import { ChatLayout } from '@/components/chat/chat-layout';
import {
  collection,
  query,
  where,
  doc,
  addDoc,
  serverTimestamp,
  orderBy,
  updateDoc,
  Timestamp,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { type Conversation, type Message, type UserProfile } from '@/lib/chat-data';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { useSearchParams, useRouter } from 'next/navigation';
import { encryptMessage, decryptMessage, rehydratePreKeyBundle } from '@/lib/signal-protocol';
import { useToast } from '@/hooks/use-toast';

const UNLOCKED_MESSAGES_STORAGE_KEY = 'unlocked_messages';

export default function ChatPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const initialConversationId = searchParams.get('conversationId');

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map());
  const [unlockedMessages, setUnlockedMessages] = useState<Set<string>>(new Set());

  // Get current user's profile to check their role
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfileDoc } = useDoc(userProfileRef);
  const userProfile = userProfileDoc?.data() as UserProfile;

  // Load from localStorage only on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(UNLOCKED_MESSAGES_STORAGE_KEY);
      if (saved) {
        setUnlockedMessages(new Set(JSON.parse(saved)));
      }
    }
  }, []);

  // Save to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(UNLOCKED_MESSAGES_STORAGE_KEY, JSON.stringify(Array.from(unlockedMessages)));
    }
  }, [unlockedMessages]);


  const conversationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: conversationsData, loading: conversationsLoading } =
    useCollection(conversationsQuery);

  const conversations: Conversation[] = useMemo(() => {
    if (!conversationsData) return [];
    return conversationsData.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Conversation)
    );
  }, [conversationsData]);
  
  useEffect(() => {
     if (initialConversationId) {
       setSelectedConversationId(initialConversationId);
     } else if (!selectedConversationId && conversations.length > 0) {
       setSelectedConversationId(conversations[0].id);
     }
  }, [initialConversationId, conversations, selectedConversationId]);


  const messagesQuery = useMemoFirebase(() => {
    if (!selectedConversationId || !firestore) return null;
    return query(
      collection(
        firestore,
        'conversations',
        selectedConversationId,
        'messages'
      ),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, selectedConversationId]);

  const { data: messagesData, loading: messagesLoading } =
    useCollection(messagesQuery);

  const messages: Message[] = useMemo(() => {
    if (!messagesData) return [];
    return messagesData.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Message)
    );
  }, [messagesData]);

  // Decrypt messages as they come in
  useEffect(() => {
    if (!user) return;
    messages.forEach(async (msg) => {
      // Don't decrypt own messages, paid content placeholders, or already decrypted messages
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


  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find((c) => c.id === selectedConversationId);
  }, [selectedConversationId, conversations]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Update URL without reloading the page
    router.push(`/chat?conversationId=${conversationId}`, { scroll: false });
  };

  const handleSendMessage = async (text: string) => {
    if (!user || !selectedConversationId || !firestore || !selectedConversation) return;

    const otherParticipantId = selectedConversation.participantIds.find(id => id !== user.uid);
    if (!otherParticipantId) {
      console.error("Could not find the other participant.");
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de trouver le destinataire." });
      return;
    }
    
    const recipientDocRef = doc(firestore, 'users', otherParticipantId);
    const recipientDocSnap = await getDoc(recipientDocRef);
    
    if (!recipientDocSnap.exists() || !recipientDocSnap.data().signalPreKeyBundle) {
        console.error("Recipient does not have a pre-key bundle.");
        toast({ variant: "destructive", title: "Erreur de chiffrement", description: "Le destinataire n'a pas pu être vérifié pour le chiffrement." });
        return;
    }

    const recipientProfile = recipientDocSnap.data() as UserProfile;
    const rehydratedBundle = rehydratePreKeyBundle(recipientProfile.signalPreKeyBundle);
    
    try {
        const ciphertext = await encryptMessage(otherParticipantId, rehydratedBundle, text);
        
        const messagesColRef = collection(firestore, 'conversations', selectedConversationId, 'messages');
        const conversationDocRef = doc(firestore, 'conversations', selectedConversationId);

        await addDoc(messagesColRef, {
            senderId: user.uid,
            text: ciphertext, // Store encrypted text
            createdAt: serverTimestamp(),
            isPaid: false,
        });

        await updateDoc(conversationDocRef, {
            lastMessage: 'Message chiffré', // Don't reveal content in conversation preview
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error encrypting or sending message:", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer le message chiffré." });
    }
  };

  const handleSendPaidMessage = async (content: { title: string; price: number; imageUrl: string; }) => {
    if (!user || !selectedConversationId || !firestore) return;

    const messagesColRef = collection(firestore, 'conversations', selectedConversationId, 'messages');
    const conversationDocRef = doc(firestore, 'conversations', selectedConversationId);

    try {
      await addDoc(messagesColRef, {
          senderId: user.uid,
          text: 'Paid Content', // Placeholder text, not encrypted
          createdAt: serverTimestamp(),
          isPaid: true,
          contentTitle: content.title,
          contentPrice: content.price,
          contentImageUrl: content.imageUrl,
          contentType: 'image', // Or derive from URL if needed
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
    if (message.isPaid) {
      return message;
    }
    
    // For own messages, we don't need to decrypt, but we also don't have the plaintext
    // This is a limitation of the current implementation. We'll show a placeholder.
    if (message.senderId === user?.uid) {
        // A more advanced solution would be to keep the sent message in local state before sending
        return {
            ...message,
            text: message.text.startsWith('{') ? 'Vous : Message chiffré' : message.text,
        }
    }

    const decryptedText = decryptedMessages.get(message.id);
    return {
      ...message,
      text: decryptedText || "Déchiffrement...",
    };
  }, [decryptedMessages, user]);

  const handleUnlockContent = (messageId: string) => {
    setUnlockedMessages(prev => new Set(prev).add(messageId));
  };

  const displayableMessages = useMemo(
      () => messages.map(getDisplayableMessage), 
      [messages, getDisplayableMessage]
  );

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ChatLayout
          conversations={conversations}
          selectedConversation={selectedConversation}
          messages={displayableMessages}
          onSelectConversation={handleSelectConversation}
          onSendMessage={handleSendMessage}
          onSendPaidMessage={handleSendPaidMessage}
          currentUserId={user?.uid}
          currentUserRole={userProfile?.role}
          conversationsLoading={conversationsLoading}
          messagesLoading={messagesLoading}
          unlockedMessages={unlockedMessages}
          onUnlockContent={handleUnlockContent}
        />
      </main>
    </div>
  );
}
