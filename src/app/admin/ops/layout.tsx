'use client';
import { CheckSquare, Users, DollarSign, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

const navItems = [
  { href: '/admin/ops', icon: CheckSquare, label: 'Ops' },
  { href: '#', icon: Users, label: 'Creators' },
  { href: '#', icon: DollarSign, label: 'Finance' },
  { href: '#', icon: Bell, label: 'Alerts' },
];

function OpsLayoutSkeleton() {
    return (
        <div className="flex h-screen flex-col bg-background">
            <div className="flex-1 p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-40 w-full" />
            </div>
            <footer className="sticky bottom-0 left-0 right-0 border-t border-border bg-background">
                <nav className="flex items-center justify-around h-16">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    ))}
                </nav>
            </footer>
        </div>
    )
}

export default function TeamOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfileDoc, loading: profileLoading } = useDoc(userProfileRef);
  const userProfile = userProfileDoc?.data() as UserProfile | undefined;

  const loading = userLoading || profileLoading;

  useEffect(() => {
    if (!loading && (!user || (userProfile && !['admin', 'moderateur', 'agence'].includes(userProfile.role)))) {
        router.replace('/discover');
    }
  }, [loading, user, userProfile, router]);

  if (loading || !user || !userProfileDoc?.exists() || !userProfile || !['admin', 'moderateur', 'agence'].includes(userProfile.role)) {
    return <OpsLayoutSkeleton />;
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <footer className="sticky bottom-0 left-0 right-0 border-t border-border bg-background">
        <nav className="mx-auto flex max-w-md items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
                 {item.label === 'Alerts' && <div className="absolute top-3 right-5 h-2 w-2 rounded-full bg-red-500" />}
              </Link>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}
