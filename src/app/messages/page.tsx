'use client';
import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { type Conversation } from '@/lib/chat-data';
import { ConversationList } from '@/components/chat/conversation-list';
import ChatView from '../chat/page';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Users } from 'lucide-react';

export default function MessagesPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();

  // Get conversationId from URL query params, or default to the first one
  const initialConversationId = searchParams.get('conversationId');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const conversationsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
  }, [user, firestore]);

  const { data: conversationsData, loading: conversationsLoading } = useCollection(conversationsQuery);

  const conversations = useMemo(() => {
    if (!conversationsData) return [];
    return conversationsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
  }, [conversationsData]);

  // Handle setting the selected conversation
  useState(() => {
      if (initialConversationId) {
          setSelectedConversationId(initialConversationId);
      } else if (conversations.length > 0) {
          setSelectedConversationId(conversations[0].id);
      }
  });

  const loading = userLoading || conversationsLoading;

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Optional: Update URL without reloading the page
    window.history.pushState(null, '', `/messages?conversationId=${conversationId}`);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-full max-w-sm border-r border-sidebar-border hidden md:flex flex-col">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          loading={loading}
        />
      </div>
      <main className="flex-1">
        {selectedConversationId ? (
          <ChatView conversationId={selectedConversationId} />
        ) : (
          <div className="h-full flex-col items-center justify-center hidden md:flex">
             <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-sidebar-accent rounded-full">
                    <MessageSquare className="h-10 w-10 text-sidebar-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Your Messages</h2>
                <p className="text-muted-foreground">Select a conversation to start chatting.</p>
            </div>
          </div>
        )}
        {/* On mobile, the chat view will be rendered via a different route or overlay logic */}
        {/* For this setup, we'll hide the conversation list on mobile when a chat is open */}
      </main>
    </div>
  );
}
