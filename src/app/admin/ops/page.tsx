'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, AlertCircle, Expand, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { collection, query, orderBy, where, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import type { Task, OpsMessage, UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';


function TaskItem({ task }: { task: Task & { id: string } }) {
  const firestore = useFirestore();
  const creatorRef = useMemoFirebase(() => {
    if (!firestore || !task.creatorId) return null;
    return doc(firestore, 'users', task.creatorId);
  }, [firestore, task.creatorId]);

  const { data: creatorDoc } = useDoc(creatorRef);
  const creator = creatorDoc?.data() as UserProfile | undefined;

  const dueDateText = task.dueDate instanceof Timestamp
    ? formatDistanceToNow(task.dueDate.toDate(), { addSuffix: true, locale: fr })
    : 'No due date';
  
  const dueColor = task.dueDate && task.dueDate.toDate() < new Date() ? 'text-red-400' : 'text-yellow-400';

  return (
      <Card className="p-3">
        <CardContent className="p-0 flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={creator?.photoURL} />
              <AvatarFallback>
                {creator?.displayName?.charAt(0) || '...'}
              </AvatarFallback>
            </Avatar>
            {task.hasAlert && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-background">
                  <AlertCircle className="h-3 w-3 text-background" />
              </div>
            )}
          </div>
          <div className="flex-grow">
            <p className="font-semibold">{task.title}</p>
            <p className="text-sm text-muted-foreground">
              {task.dueDate && <span className={cn('font-medium', dueColor)}>{dueDateText}</span>}
              {task.dueDate && ' • '}
              {task.category}
            </p>
          </div>
          <Checkbox className="h-6 w-6 rounded-full" />
        </CardContent>
      </Card>
  )
}

function OpsMessageBubble({ message }: { message: OpsMessage & { id: string }}) {
    const { user } = useUser();
    const firestore = useFirestore();

    const senderRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'users', message.senderId);
    }, [firestore, message.senderId]);

    const { data: senderDoc, loading } = useDoc(senderRef);
    const sender = senderDoc?.data() as UserProfile | undefined;
    const isOwn = message.senderId === user?.uid;
    const time = message.createdAt instanceof Timestamp ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true, locale: fr }) : '';
    const read = message.isReadBy?.includes(user?.uid || '');

    if (loading) {
        return <Skeleton className="h-16 w-full" />
    }

    return (
        <div key={message.id} className={cn("flex gap-3", isOwn && "justify-end")}>
            {!isOwn && (
                    <Avatar className="h-8 w-8">
                    <AvatarImage src={sender?.photoURL} />
                    <AvatarFallback>{sender?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn("flex flex-col gap-1", isOwn && "items-end")}>
            <div className={cn("max-w-[280px] rounded-2xl px-4 py-3", isOwn ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none')}>
                <p>{message.text}</p>
            </div>
            <p className="text-xs text-muted-foreground">
                {time} {isOwn && read && '• Read'}
            </p>
            </div>
        </div>
    );
}

export default function TeamOpsPage() {
  const [activeTab, setActiveTab] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [newMessage, setNewMessage] = useState('');

  const { user } = useUser();
  const firestore = useFirestore();

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'tasks'), where('assigneeId', '==', user.uid), where('status', '==', activeTab), orderBy('dueDate', 'asc'));
  }, [firestore, user, activeTab]);

  const { data: tasks, loading: tasksLoading } = useCollection<Task & { id: string }>(tasksQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ops_messages'), orderBy('createdAt', 'asc'));
  }, [firestore]);

  const { data: messages, loading: messagesLoading } = useCollection<OpsMessage & { id: string }>(messagesQuery);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !newMessage.trim()) return;

    const messagesCol = collection(firestore, 'ops_messages');
    await addDoc(messagesCol, {
        senderId: user.uid,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
    });
    setNewMessage('');
  };


  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-2xl font-bold">Team Ops</h1>
          <p className="text-sm text-muted-foreground">Alpha Agency • Admin</p>
        </div>
        <Button size="icon" className="h-10 w-10 rounded-full">
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <main className="p-4 space-y-6 pb-24">
        {/* Task Tabs */}
        <div className="flex gap-2 bg-card p-1 rounded-full">
          {(['todo', 'in_progress', 'done'] as const).map(tab => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'ghost'}
              className="flex-1 rounded-full text-base"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Priority Queue */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Priority Queue</h2>
            <Button variant="link" className="text-primary">
              FILTER
            </Button>
          </div>
          <div className="space-y-2">
            {tasksLoading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            ) : tasks && tasks.length > 0 ? (
                tasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
                <p className="text-center text-muted-foreground py-4">No tasks in this category.</p>
            )}
          </div>
        </div>

        {/* Live Activity */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Live Activity</h2>
            <Button variant="ghost" size="icon">
              <Expand className="h-5 w-5" />
            </Button>
          </div>
          <Card className="p-4 space-y-4">
            <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">Today</p>
            {messagesLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-12 w-2/3 self-end" />
                </div>
            ) : messages && messages.length > 0 ? (
                 messages.map(msg => <OpsMessageBubble key={msg.id} message={msg} />)
            ) : (
                <p className="text-center text-muted-foreground py-4">No messages yet.</p>
            )}
             <form onSubmit={handleSendMessage} className="relative mt-4">
                <Input placeholder="Reply to thread..." className="h-12 rounded-full pl-4 pr-12 bg-secondary border-border/50" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                    <ArrowUp className="h-5 w-5" />
                </Button>
             </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
