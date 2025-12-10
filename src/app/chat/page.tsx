'use client';
import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
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
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {
  type Conversation,
  type Message,
  type UserProfile,
} from '@/lib/chat-data';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

export default function ChatPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [enrichedConversations, setEnrichedConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // 1. Fetch conversations for the current user
  const conversationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participantIds', 'array-contains', user.uid)
    );
  }, [firestore, user]);

  const { data: conversationsData, loading: initialConversationsLoading } = useCollection(conversationsQuery);
  
  useEffect(() => {
    const enrichConversations = async () => {
      if (!user || !firestore || !conversationsData) {
        if (!initialConversationsLoading) {
          setConversationsLoading(false);
          setEnrichedConversations([]);
        }
        return;
      }
      
      setConversationsLoading(true);

      const convos = conversationsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      const otherParticipantIds = convos.flatMap(c => c.participantIds.filter(id => id !== user.uid));
      
      if (otherParticipantIds.length === 0) {
        setEnrichedConversations(convos);
        setConversationsLoading(false);
        return;
      }
      
      const uniqueParticipantIds = [...new Set(otherParticipantIds)];
      
      try {
        const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', uniqueParticipantIds));
        const usersSnapshot = await getDocs(usersQuery);
        const participantsMap = new Map<string, UserProfile>();
        usersSnapshot.forEach(doc => {
          participantsMap.set(doc.id, doc.data() as UserProfile);
        });

        const finalConversations = convos.map(convo => {
          const otherId = convo.participantIds.find(id => id !== user.uid);
          const participant = otherId ? participantsMap.get(otherId) : undefined;
          return {
            ...convo,
            otherParticipant: participant && otherId ? { ...participant, id: otherId } : undefined
          };
        }).sort((a, b) => {
          const dateA = a.updatedAt instanceof Timestamp ? a.updatedAt.toDate() : new Date(0);
          const dateB = b.updatedAt instanceof Timestamp ? b.updatedAt.toDate() : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setEnrichedConversations(finalConversations);
      } catch (error) {
        console.error("Error enriching conversations:", error);
        setEnrichedConversations(convos); // Fallback to unenriched convos
      } finally {
        setConversationsLoading(false);
      }
    };

    enrichConversations();

  }, [conversationsData, user, firestore, initialConversationsLoading]);
  

  // 2. Fetch messages for the selected conversation
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
    return messagesData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  }, [messagesData]);


  // 3. Get the selected conversation object
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return enrichedConversations.find(
      (c) => c.id === selectedConversationId
    );
  }, [selectedConversationId, enrichedConversations]);


  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  // 4. Handle sending a message
  const handleSendMessage = async (text: string) => {
    if (!user || !selectedConversationId || !firestore) return;

    const messagesColRef = collection(
      firestore,
      'conversations',
      selectedConversationId,
      'messages'
    );
    const conversationDocRef = doc(
      firestore,
      'conversations',
      selectedConversationId
    );

    await addDoc(messagesColRef, {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
      isPaid: false, // For now, all messages are free
    });

    await updateDoc(conversationDocRef, {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    });
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ChatLayout
          conversations={enrichedConversations}
          selectedConversation={selectedConversation}
          messages={messages}
          onSelectConversation={handleSelectConversation}
          onSendMessage={handleSendMessage}
          currentUserId={user?.uid}
          conversationsLoading={conversationsLoading}
          messagesLoading={messagesLoading}
        />
      </main>
    </div>
  );
}
