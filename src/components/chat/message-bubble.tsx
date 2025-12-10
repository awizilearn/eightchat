'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Message, UserProfile } from '@/lib/chat-data';
import { Lock } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useUser } from '@/firebase';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  // Fetch sender profile only if it's not the current user's message
  const senderRef = !isOwnMessage && firestore ? doc(firestore, 'users', message.senderId) : null;
  const { data: senderDoc } = useDoc(senderRef);
  const sender = senderDoc?.data() as UserProfile;

  const avatarUrl = isOwnMessage ? user?.photoURL : sender?.photoURL;
  const avatarFallback = isOwnMessage ? 'Moi' : sender?.displayName?.charAt(0) || '?';


  if (message.isPaid && !isOwnMessage) {
    return (
      <div className="flex items-center gap-3">
         <Avatar className="h-8 w-8 self-end">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <Card className="max-w-xs md:max-w-md bg-secondary">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              <Lock className="h-5 w-5 text-primary" />
              <div className='text-right'>
                <p className="font-semibold text-sm">Contenu exclusif</p>
                <Button variant="link" className="h-auto p-0 text-primary">
                    Débloquer pour 5€
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isOwnMessage && 'flex-row-reverse'
      )}
    >
      {!isOwnMessage && (
         <Avatar className="h-8 w-8 self-end">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'p-3 rounded-2xl max-w-xs md:max-w-md',
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-secondary rounded-bl-none'
        )}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}
