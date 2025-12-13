'use client';
import { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import type { Conversation, UserProfile } from '@/lib/chat-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import { Timestamp, doc } from 'firebase/firestore';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';


const ConversationItem = ({
  convo,
  isSelected,
  onSelect,
}: {
  convo: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const { user } = useUser();
  const firestore = useFirestore();

  const otherParticipantId = useMemo(() => {
    return convo.participantIds.find(id => id !== user?.uid);
  }, [convo.participantIds, user]);

  const participantRef = useMemoFirebase(() => {
      if (!firestore || !otherParticipantId) return null;
      return doc(firestore, 'users', otherParticipantId);
  }, [firestore, otherParticipantId]);

  const { data: participantDoc, loading } = useDoc(participantRef);
  const participant = participantDoc?.data() as UserProfile;

  if (loading) {
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
        isSelected ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'
      )}
    >
      <Avatar className="h-12 w-12 border">
        <AvatarImage src={participant?.photoURL} />
        <AvatarFallback>{participant?.displayName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <p className={cn("font-semibold truncate", isSelected && "text-sidebar-accent-foreground")}>{participant?.displayName}</p>
          <p className={cn("text-xs whitespace-nowrap", isSelected ? 'text-sidebar-accent-foreground/80' : 'text-muted-foreground')}>
            {convo.updatedAt && convo.updatedAt instanceof Timestamp ? formatDistanceToNow(convo.updatedAt.toDate(), {
              addSuffix: true,
              locale: fr,
            }) : ''}
          </p>
        </div>
        <p className={cn("text-sm truncate", isSelected ? 'text-sidebar-accent-foreground/80' : 'text-muted-foreground')}>{convo.lastMessage}</p>
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
  
  // This is a simplified search. A real implementation would need to fetch users to search by name.
  // For now, it only searches based on the last message content.
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(c => 
      c.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex justify-between items-center">
           <h2 className="text-2xl font-bold font-headline">Messages</h2>
           <button className='p-2 rounded-full hover:bg-sidebar-accent'>
             <Users className="h-5 w-5 text-sidebar-foreground/80" />
             <span className='sr-only'>New Conversation</span>
           </button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Rechercher des messages..." 
            className="pl-10 bg-background/50 border-sidebar-border focus:bg-background" 
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
                    <Skeleton className="h-12 w-12 rounded-full bg-sidebar-accent" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24 bg-sidebar-accent" />
                            <Skeleton className="h-3 w-16 bg-sidebar-accent" />
                        </div>
                        <Skeleton className="h-4 w-40 bg-sidebar-accent" />
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
