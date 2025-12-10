'use client';
import { ConversationList } from './conversation-list';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { Separator } from '@/components/ui/separator';
import type { Message, Conversation } from '@/lib/chat-data';

interface ChatLayoutProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null | undefined;
  messages: Message[];
  onSelectConversation: (conversationId: string) => void;
  onSendMessage: (text: string) => void;
  currentUserId?: string | null;
  conversationsLoading: boolean;
  messagesLoading: boolean;
}

export function ChatLayout({
  conversations,
  selectedConversation,
  messages,
  onSelectConversation,
  onSendMessage,
  currentUserId,
  conversationsLoading,
  messagesLoading,
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
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">{selectedConversation.otherParticipant?.displayName}</h2>
              <p className="text-sm text-muted-foreground">@{selectedConversation.otherParticipant?.email}</p>
            </div>
            <MessageList messages={messages} currentUserId={currentUserId} loading={messagesLoading} />
            <div className="p-4 border-t">
              <MessageInput onSendMessage={onSendMessage} />
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
