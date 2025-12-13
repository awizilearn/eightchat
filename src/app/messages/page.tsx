'use client';
import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { type Conversation } from '@/lib/chat-data';
import { ConversationList } from '@/components/chat/conversation-list';
import ChatView from '../chat/page';
import { useSearchParams, useRouter } from 'next/navigation';
import { MessageSquare, Users } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

export default function MessagesPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialConversationId = searchParams.get('conversationId');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId);

  const conversationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
  }, [user, firestore]);

  const { data: conversations, loading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);

  useEffect(() => {
    if (!conversations) return;
    if (!selectedConversationId && conversations.length > 0) {
      // If no conversation is selected from the URL, default to the first one.
      setSelectedConversationId(conversations[0].id);
    }
     // If the selected ID is no longer in the list (e.g., deleted convo), reset.
    if (selectedConversationId && conversations.length > 0 && !conversations.find(c => c.id === selectedConversationId)) {
        setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);


  const loading = userLoading || conversationsLoading;

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Update URL without a full page reload for better UX.
    router.push(`/messages?conversationId=${conversationId}`, { scroll: false });
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-full max-w-sm border-r border-sidebar-border hidden md:flex flex-col">
        <ConversationList
          conversations={conversations || []}
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
        {/* On mobile, the chat view is often handled by navigating to a new screen.
            For this example, we show the chat view, and the user can navigate back
            to the conversation list (which would be a separate mobile view). */}
        {!selectedConversationId && (!conversations || conversations.length === 0) && !loading && (
             <div className="h-full flex-col items-center justify-center flex p-4">
                 <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-4 bg-sidebar-accent rounded-full">
                        <Users className="h-10 w-10 text-sidebar-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold">No Conversations Yet</h2>
                    <p className="text-muted-foreground">Start a new conversation to see it here.</p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
