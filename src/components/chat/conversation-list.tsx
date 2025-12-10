'use client';
import { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import type { Conversation } from '@/lib/chat-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import { Timestamp } from 'firebase/firestore';


const ConversationItem = ({
  convo,
  isSelected,
  onSelect,
}: {
  convo: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {

  const participant = convo.otherParticipant;

  if (!participant) {
    return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-40" />
            </div>
        </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(convo.id)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
      )}
    >
      <Avatar className="h-12 w-12 border">
        <AvatarImage src={participant.photoURL} />
        <AvatarFallback>{participant.displayName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <p className="font-semibold truncate">{participant.displayName}</p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {convo.updatedAt && convo.updatedAt instanceof Timestamp ? formatDistanceToNow(convo.updatedAt.toDate(), {
              addSuffix: true,
              locale: fr,
            }) : ''}
          </p>
        </div>
        <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
      </div>
    </div>
  );
};

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null | undefined;
  onSelectConversation: (conversationId: string) => void;
  loading: boolean;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(c => 
      c.otherParticipant?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
           <h2 className="text-2xl font-bold font-headline">Messages</h2>
           <button className='p-2 rounded-full hover:bg-muted'>
             <Users className="h-5 w-5 text-muted-foreground" />
             <span className='sr-only'>New Conversation</span>
           </button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Rechercher des messages..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
             [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
             ))
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((convo) => (
              <ConversationItem
                key={convo.id}
                convo={convo}
                isSelected={selectedConversationId === convo.id}
                onSelect={onSelectConversation}
              />
            ))
          ) : (
            <div className="text-center p-4 text-muted-foreground">
                Aucune conversation trouvée.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
