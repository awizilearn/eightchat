'use client';
import { Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export function DashboardHeader() {
  const { user } = useUser();
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary">
          <AvatarImage src={user?.photoURL ?? undefined} />
          <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user?.displayName}</h1>
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <Settings className="h-6 w-6" />
        <span className="sr-only">Settings</span>
      </Button>
    </header>
  );
}
