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
} from 'firebase/firestore';
import {
  type Conversation,
  type Message,
} from '@/lib/chat-data';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

export default function ChatPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  // 1. Fetch conversations for the current user
  const conversationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: conversationsData, loading: conversationsLoading } = useCollection(conversationsQuery);
  
  const conversations: Conversation[] = useMemo(() => {
     if (!conversationsData) return [];
     return conversationsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
  }, [conversationsData]);


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
    return conversations.find(
      (c) => c.id === selectedConversationId
    );
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
