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
}

export function MessageList({ messages, currentUserId, loading }: MessageListProps) {
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
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-6">
        {loading ? (
          <div className='space-y-4'>
            <div className='flex items-end gap-2'>
              <Skeleton className='h-8 w-8 rounded-full' />
              <Skeleton className='h-10 w-48 rounded-2xl' />
            </div>
            <div className='flex items-end gap-2 flex-row-reverse'>
              <Skeleton className='h-10 w-64 rounded-2xl' />
            </div>
             <div className='flex items-end gap-2'>
              <Skeleton className='h-8 w-8 rounded-full' />
              <Skeleton className='h-16 w-40 rounded-2xl' />
            </div>
             <div className='flex items-end gap-2 flex-row-reverse'>
              <Skeleton className='h-10 w-32 rounded-2xl' />
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
