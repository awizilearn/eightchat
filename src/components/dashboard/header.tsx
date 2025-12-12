'use client';
import { Bell, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const { user } = useUser();
  const router = useRouter();
  const userName = user?.displayName?.split(' ')[0] || '';

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.photoURL ?? undefined} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
           <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">Good evening,</p>
          <h1 className="text-xl font-bold">{userName}</h1>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant="ghost" size="icon" className="relative" onClick={() => router.push('/creator/post/new')}>
            <PlusCircle className="h-6 w-6" />
            <span className="sr-only">New Post</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            <span className="sr-only">Notifications</span>
            <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  );
}
