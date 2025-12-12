'use client';

import Link from 'next/link';
import { Crown, LogOut, MessageSquare, Settings, User as UserIcon, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, useFirestore, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/chat-data';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/discover" className="flex items-center gap-2 mr-6">
          <Crown className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-bold tracking-tight text-primary whitespace-nowrap">
            Golden Enclave
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfileDoc, loading: profileLoading } = useDoc(userProfileRef);
  const userProfile = userProfileDoc?.data() as UserProfile;

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const loading = userLoading || profileLoading;

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return (
      <Button onClick={() => router.push('/login')}>
        Login
      </Button>
    );
  }

  const isModerator = userProfile?.role === 'admin' || userProfile?.role === 'moderateur';
  const isCreator = userProfile?.role === 'createur';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary transition-colors">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           {isCreator && (
            <DropdownMenuItem onClick={() => router.push('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Tableau de bord</span>
            </DropdownMenuItem>
           )}
          <DropdownMenuItem onClick={() => router.push('/chat')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Messages</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => isCreator && router.push(`/creators/${user.uid}`)}
            disabled={!isCreator}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Mon Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        {isModerator && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/moderation')}>
                        <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                        <span className='text-primary'>Modération</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
