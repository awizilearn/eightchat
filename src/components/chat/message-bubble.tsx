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
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isContentUnlocked: boolean;
  onUnlockContent: (messageId: string) => void;
}

function LockedContent({ message, onUnlock }: { message: Message; onUnlock: () => void; }) {
    const { toast } = useToast();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const handlePurchase = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: "Vous devez être connecté pour acheter du contenu." });
            return;
        }

        if (!message.contentPrice || !message.contentTitle) {
            toast({ variant: 'destructive', title: "Information sur le contenu manquante." });
            return;
        }
        
        setIsLoading(true);
        toast({ title: "Initiation de l'achat..." });

        // Simulate a successful API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);

        // In a real app, you would handle the response from your payment provider.
        // Here, we just simulate success.
        onUnlock();
        toast({
             title: "Achat réussi!",
             description: `Vous avez débloqué "${message.contentTitle}".`,
        });
    };

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
          <Button className="w-full" onClick={handlePurchase} disabled={isLoading}>
            <Lock className="h-4 w-4 mr-2" />
            {isLoading ? "Traitement..." : "Acheter maintenant"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UnlockedContent({ message, isOwnMessage = false }: { message: Message; isOwnMessage?: boolean }) {
    return (
        <Card className={cn(
            "max-w-xs md:max-w-sm w-full overflow-hidden",
            isOwnMessage ? "bg-primary/10 border-primary/20" : "bg-secondary/50 border-border/50"
        )}>
             <CardContent className="p-0">
                <div className="relative aspect-video w-full">
                {message.contentImageUrl && (
                    <Image
                    src={message.contentImageUrl}
                    alt={message.contentTitle || 'Contenu débloqué'}
                    fill
                    className="object-cover"
                    />
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                    <h4 className="font-bold text-white text-lg">{message.contentTitle}</h4>
                </div>
                </div>
                <div className='p-4'>
                    <p className='text-sm text-muted-foreground'>
                        {isOwnMessage ? "Vous avez envoyé ce contenu payant." : "Contenu débloqué. Profitez-en !"}
                    </p>
                    <Button variant="link" className="px-0">Voir le contenu</Button>
                </div>
            </CardContent>
        </Card>
    );
}


export function MessageBubble({ message, isOwnMessage, isContentUnlocked, onUnlockContent }: MessageBubbleProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  // Fetch sender profile only if it's not the current user's message
  const senderRef = !isOwnMessage && firestore ? doc(firestore, 'users', message.senderId) : null;
  const { data: senderDoc } = useDoc(senderRef);
  const sender = senderDoc?.data() as UserProfile;

  const avatarUrl = isOwnMessage ? user?.photoURL : sender?.photoURL;
  const avatarFallback = isOwnMessage ? user?.displayName?.charAt(0) : sender?.displayName?.charAt(0) || '?';


  if (message.isPaid) {
    const commonContainerClasses = "flex items-end gap-3";
    
    if (isOwnMessage) {
        return (
            <div className={cn(commonContainerClasses, 'flex-row-reverse')}>
                <UnlockedContent message={message} isOwnMessage={true} />
            </div>
        );
    }

    return (
       <div className={cn(commonContainerClasses)}>
         <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        {isContentUnlocked ? (
            <UnlockedContent message={message} />
        ) : (
            <LockedContent message={message} onUnlock={() => onUnlockContent(message.id)} />
        )}
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
