'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Message, UserProfile } from '@/lib/chat-data';
import { Lock, PlayCircle } from 'lucide-react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

function LockedContent({ message }: { message: Message }) {
  return (
    <Card className="max-w-xs md:max-w-sm w-full bg-secondary/50 border-border/50">
      <CardContent className="p-0">
        <div className="relative aspect-video w-full">
          {message.contentImageUrl && (
            <Image
              src={message.contentImageUrl}
              alt={message.contentTitle || 'Locked content'}
              fill
              className="object-cover rounded-t-lg"
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-lg">
            {message.contentType === 'video' && (
              <PlayCircle className="h-12 w-12 text-white/70" />
            )}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h4 className="font-semibold text-foreground">
            {message.contentTitle}
          </h4>
          {message.contentPrice && (
            <p className="text-xl font-bold text-primary">
              ${message.contentPrice.toFixed(2)}
            </p>
          )}
          <Button className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  // Fetch sender profile only if it's not the current user's message
  const senderRef = !isOwnMessage && firestore ? doc(firestore, 'users', message.senderId) : null;
  const { data: senderDoc } = useDoc(senderRef);
  const sender = senderDoc?.data() as UserProfile;

  const avatarUrl = isOwnMessage ? user?.photoURL : sender?.photoURL;
  const avatarFallback = isOwnMessage ? user?.displayName?.charAt(0) : sender?.displayName?.charAt(0) || '?';


  if (message.isPaid && !isOwnMessage) {
    return (
       <div className="flex items-end gap-3">
         <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <LockedContent message={message} />
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
