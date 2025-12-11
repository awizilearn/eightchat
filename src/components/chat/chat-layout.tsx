'use client';
import { ConversationList } from './conversation-list';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { Separator } from '@/components/ui/separator';
import type { Message, Conversation, UserProfile } from '@/lib/chat-data';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';


function SelectedConversationHeader({ conversation }: { conversation: Conversation }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const otherParticipantId = useMemo(() => {
        return conversation.participantIds.find(id => id !== user?.uid);
    }, [conversation.participantIds, user]);

    const participantRef = useMemo(() => {
        if (!firestore || !otherParticipantId) return null;
        return doc(firestore, 'users', otherParticipantId);
    }, [firestore, otherParticipantId]);

    const { data: participantDoc, loading } = useDoc(participantRef);
    const participant = participantDoc?.data() as UserProfile;

    if (loading) {
        return (
            <div className="p-4 border-b">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border-b">
            <h2 className="text-xl font-bold">{participant?.displayName}</h2>
            <p className="text-sm text-muted-foreground">@{participant?.email}</p>
        </div>
    );
}


interface ChatLayoutProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null | undefined;
  messages: Message[];
  onSelectConversation: (conversationId: string) => void;
  onSendMessage: (text: string) => void;
  onSendPaidMessage: (content: { title: string; price: number; imageUrl: string; }) => void;
  currentUserId?: string | null;
  currentUserRole?: string;
  conversationsLoading: boolean;
  messagesLoading: boolean;
  unlockedMessages: Set<string>;
  onUnlockContent: (messageId: string) => void;
}

export function ChatLayout({
  conversations,
  selectedConversation,
  messages,
  onSelectConversation,
  onSendMessage,
  onSendPaidMessage,
  currentUserId,
  currentUserRole,
  conversationsLoading,
  messagesLoading,
  unlockedMessages,
  onUnlockContent,
}: ChatLayoutProps) {
  return (
    <div className="h-full w-full flex">
      <div className="h-full w-1/3 min-w-[300px] max-w-[400px] border-r">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={onSelectConversation}
          loading={conversationsLoading}
        />
      </div>
      <Separator orientation="vertical" />
      <div className="h-full flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <SelectedConversationHeader conversation={selectedConversation} />
            <MessageList 
                messages={messages} 
                currentUserId={currentUserId} 
                loading={messagesLoading}
                unlockedMessages={unlockedMessages}
                onUnlockContent={onUnlockContent}
            />
            <div className="p-4 border-t">
              <MessageInput 
                onSendMessage={onSendMessage} 
                onSendPaidMessage={onSendPaidMessage}
                isCreator={currentUserRole === 'createur'}
              />
            </div>
          </>
        ) : conversationsLoading ? (
           <div className="flex-1 flex items-center justify-center">
             <div className="text-center">
                <p className="text-muted-foreground">Chargement des conversations...</p>
             </div>
           </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Sélectionnez une conversation pour commencer à discuter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
