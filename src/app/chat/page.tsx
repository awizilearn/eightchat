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
  Timestamp,
} from 'firebase/firestore';
import { type Conversation, type Message } from '@/lib/chat-data';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  
  const initialConversationId = searchParams.get('conversationId');

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(initialConversationId);

  // 1. Fetch conversations for the current user
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
  
  // Effect to handle initial conversation selection from URL
  useEffect(() => {
     if (initialConversationId) {
       setSelectedConversationId(initialConversationId);
     } else if (!selectedConversationId && conversations.length > 0) {
       // If no conversation is selected, select the first one.
       setSelectedConversationId(conversations[0].id);
     }
  }, [initialConversationId, conversations, selectedConversationId]);


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
    const regularMessages = messagesData.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Message)
    );

    // For demonstration, add a static paid message if it doesn't exist
    if (user && selectedConversationId) {
      const otherParticipantId = conversations.find(c => c.id === selectedConversationId)?.participantIds.find(id => id !== user.uid);
      const hasPaidMessage = regularMessages.some(m => m.isPaid);
      if (otherParticipantId && !hasPaidMessage) {
        const paidMessage: Message = {
          id: 'static-paid-message',
          senderId: otherParticipantId,
          createdAt: Timestamp.now(),
          isPaid: true,
          text: '',
          contentTitle: 'Behind the Scenes: Project Nova',
          contentPrice: 9.99,
          contentImageUrl: 'https://picsum.photos/seed/project-nova/600/400',
          contentType: 'video',
        };
        return [...regularMessages, paidMessage];
      }
    }
    
    return regularMessages;
  }, [messagesData, user, selectedConversationId, conversations]);

  // 3. Get the selected conversation object
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find((c) => c.id === selectedConversationId);
  }, [selectedConversationId, conversations]);

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
      isPaid: false,
    });

    await updateDoc(conversationDocRef, {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ChatLayout
          conversations={conversations}
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
