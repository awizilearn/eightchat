'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import type { Message } from '@/lib/chat-data';
import { useEffect, useRef } from 'react';
import { Skeleton } from '../ui/skeleton';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string | null;
  loading?: boolean;
  unlockedMessages: Set<string>;
  onUnlockContent: (messageId: string) => void;
}

export function MessageList({ messages, currentUserId, loading, unlockedMessages, onUnlockContent }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  return (
    <main className="flex-1 overflow-y-auto pt-2">
        <p className="text-muted-foreground/80 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">Messages are end-to-end encrypted by the Signal Protocol.</p>
        <div className="space-y-2">
            {loading ? (
            <div className='space-y-2 p-4'>
                <div className='flex items-end gap-2'>
                <Skeleton className='h-8 w-8 rounded-full bg-sidebar-accent' />
                <Skeleton className='h-12 w-48 rounded-2xl bg-sidebar-accent' />
                </div>
                <div className='flex items-end gap-2 flex-row-reverse'>
                <Skeleton className='h-12 w-64 rounded-2xl bg-primary/50' />
                </div>
                <div className='flex items-end gap-2'>
                <Skeleton className='h-8 w-8 rounded-full bg-sidebar-accent' />
                <Skeleton className='h-16 w-40 rounded-2xl bg-sidebar-accent' />
                </div>
            </div>
            ) : (
            messages.map((message) => (
                <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUserId}
                isContentUnlocked={unlockedMessages.has(message.id)}
                onUnlockContent={onUnlockContent}
                />
            ))
            )}
        </div>
    </main>
  );
}
