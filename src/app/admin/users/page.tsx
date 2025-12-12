'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


// Define status types and their corresponding badge styles
type Status = 'Active' | 'Creator' | 'Suspended';
const statusStyles: Record<Status, string> = {
  Active: 'bg-green-500/20 text-green-400 border-green-500/30',
  Creator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Suspended: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};


const UserListItem = ({ user }: { user: UserProfile & { id: string } }) => {
  // Determine status based on role, can be expanded with a real status field
  const status: Status = user.role === 'createur' ? 'Creator' : 'Active';

  return (
    <div className="flex items-center gap-4 rounded-lg bg-card p-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.photoURL} alt={user.displayName} />
        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p className="font-semibold">{user.displayName}</p>
        <p className="text-sm text-muted-foreground">@{user.displayName.toLowerCase().replace(/\s/g, '')}</p>
      </div>
      <Badge variant="outline" className={cn('font-semibold', statusStyles[status])}>
        {status}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Voir le profil</DropdownMenuItem>
          <DropdownMenuItem>Suspendre</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Bannir</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};


function UsersSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg bg-card p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            ))}
        </div>
    )
}

export default function UserManagementPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('displayName'));
  }, [firestore]);

  const { data: usersData, loading } = useCollection(usersQuery);

  const users = useMemo(() => {
    if (!usersData) return [];
    return usersData.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile & { id: string }));
  }, [usersData]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="bg-background min-h-screen">
      <header className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
          </Button>
          <h1 className="font-semibold text-lg">User Management</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Plus />
        </Button>
      </header>

      <main className="p-4 space-y-6 pb-24">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 h-12 bg-card border-border/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="icon" className="h-12 w-12 shrink-0">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <UsersSkeleton />
          ) : (
            filteredUsers.map(user => <UserListItem key={user.id} user={user} />)
          )}
        </div>
      </main>
    </div>
  );
}
