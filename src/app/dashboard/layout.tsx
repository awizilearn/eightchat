
'use client';
import { Home, BarChart, MessageSquare, UserCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/creator/insights', icon: BarChart, label: 'Insights' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/creators/me', icon: UserCircle, label: 'Profile' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();

  const getProfileLink = () => {
    if (!user) return '/login';
    return `/creators/${user.uid}`;
  }

  const finalNavItems = navItems.map(item => {
    if (item.href === '/creators/me') {
        return { ...item, href: getProfileLink() };
    }
    return item;
  });

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-md items-center justify-around h-20">
          {finalNavItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium w-16',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <div className={cn("w-full h-8 flex items-center justify-center mb-1", isActive && "border-b-2 border-primary")}>
                    <item.icon className="h-6 w-6" />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="relative -top-6">
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg"
              onClick={() => router.push('/creator/post/new')}
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>

          {finalNavItems.slice(2).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium w-16',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <div className={cn("w-full h-8 flex items-center justify-center mb-1", isActive && "border-b-2 border-primary")}>
                    <item.icon className="h-6 w-6" />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}
