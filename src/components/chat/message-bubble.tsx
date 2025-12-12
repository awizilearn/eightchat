'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Message, UserProfile } from '@/lib/chat-data';
import { Lock, PlayCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isContentUnlocked: boolean;
  onUnlockContent: (messageId: string) => void;
}

const ICONS = {
    video: <PlayCircle className="text-4xl text-white" />,
    image: <ImageIcon className="text-4xl text-white" />,
    audio: <span className="material-symbols-outlined text-4xl text-white">graphic_eq</span>,
    text: <FileText className="text-4xl text-white" />,
};

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

        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);

        onUnlock();
        toast({
             title: "Achat réussi!",
             description: `Vous avez débloqué "${message.contentTitle}".`,
        });
    };

    return (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary p-3 w-full">
            {message.contentImageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-700 relative">
                    <Image
                        alt={message.contentTitle || 'Locked content'}
                        className="h-full w-full object-cover"
                        src={message.contentImageUrl}
                        fill
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        {ICONS[message.contentType || 'image']}
                    </div>
                </div>
            )}
            <h3 className="text-white text-base font-semibold leading-tight tracking-[-0.015em]">{message.contentTitle}</h3>
            <p className="text-muted-foreground/80 text-sm font-normal leading-normal line-clamp-2">{message.text}</p>
            <Button
                className="flex items-center justify-center gap-2 rounded-full bg-primary py-2 text-primary-foreground text-base font-semibold"
                onClick={handlePurchase}
                disabled={isLoading}
            >
                <span className="material-symbols-outlined !text-lg">lock</span>
                {isLoading ? "Traitement..." : `Unlock for $${message.contentPrice?.toFixed(2)}`}
            </Button>
        </div>
    );
}

function UnlockedContent({ message, isOwnMessage = false }: { message: Message; isOwnMessage?: boolean }) {
     return (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary p-3 w-full">
            {message.contentImageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-700 relative">
                    <Image
                        alt={message.contentTitle || 'Unlocked content'}
                        className="h-full w-full object-cover"
                        src={message.contentImageUrl}
                        fill
                    />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                         {ICONS[message.contentType || 'image']}
                    </div>
                </div>
            )}
            <h3 className="text-white text-base font-semibold leading-tight tracking-[-0.015em]">{message.contentTitle}</h3>
             <p className="text-muted-foreground/80 text-sm font-normal leading-normal">
                {isOwnMessage ? "Vous avez envoyé ce contenu." : "Contenu débloqué."}
            </p>
            <Button variant="link" className="text-primary px-0 justify-start">Voir le contenu</Button>
        </div>
    );
}


export function MessageBubble({ message, isOwnMessage, isContentUnlocked, onUnlockContent }: MessageBubbleProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const senderRef = !isOwnMessage && firestore ? doc(firestore, 'users', message.senderId) : null;
  const { data: senderDoc } = useDoc(senderRef);
  const sender = senderDoc?.data() as UserProfile;

  const avatarUrl = isOwnMessage ? user?.photoURL : sender?.photoURL;
  const avatarFallback = isOwnMessage ? user?.displayName?.charAt(0) : sender?.displayName?.charAt(0) || '?';
  const time = message.createdAt instanceof Timestamp ? message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : '';

  if (message.isPaid) {
     if (isOwnMessage) {
        return (
             <div className="flex items-end gap-3 p-4 justify-end">
                <div className="flex flex-1 flex-col gap-1 items-end max-w-[280px]">
                    <UnlockedContent message={message} isOwnMessage={true} />
                     <div className="flex items-center gap-1">
                        <span className="text-muted-foreground/60 text-xs">{time}</span>
                        <span className="material-symbols-outlined !text-base text-primary">done_all</span>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
       <div className="flex items-end gap-3 p-4">
            <Avatar className="h-8 w-8 shrink-0 self-end mb-1">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-1 items-start max-w-[280px]">
                {isContentUnlocked ? (
                    <UnlockedContent message={message} />
                ) : (
                    <LockedContent message={message} onUnlock={() => onUnlockContent(message.id)} />
                )}
                 <span className="text-muted-foreground/60 text-xs">{time}</span>
            </div>
       </div>
    );
  }

  return (
    <div className={cn('flex items-end gap-3 p-4', isOwnMessage && 'justify-end')}>
      {!isOwnMessage && (
         <Avatar className="h-8 w-8 shrink-0 self-end mb-1">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-1 flex-col gap-1", isOwnMessage ? 'items-end' : 'items-start')}>
        <p className={cn(
          "text-base font-normal leading-normal flex max-w-[280px] rounded-2xl px-4 py-3",
          isOwnMessage ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-foreground rounded-bl-none'
        )}>
          {message.text}
        </p>
        <div className={cn("flex items-center gap-1", isOwnMessage && "flex-row-reverse")}>
             <span className="text-muted-foreground/60 text-xs">{time}</span>
             {isOwnMessage && <span className="material-symbols-outlined !text-base text-primary">done_all</span>}
        </div>
      </div>
       {isOwnMessage && <div className="w-8 shrink-0"></div>}
    </div>
  );
}
