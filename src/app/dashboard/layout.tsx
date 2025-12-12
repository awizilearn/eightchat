'use client';
import { Home, Compass, MessageSquare, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Content' },
  { href: '/chat', icon: MessageSquare, label: 'Messages' },
  { href: '/creators/me', icon: UserCircle, label: 'Profile' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const getProfileLink = () => {
    if (!user) return '/login';
    // This is a placeholder. The creator's profile page would be /creators/[userId]
    // The "me" is a special case we can handle or just use the user.uid
    return `/creators/${user.uid}`;
  }

  // A bit of a hack to make the profile link dynamic
  const finalNavItems = navItems.map(item => {
    if (item.href === '/creators/me') {
        return { ...item, href: getProfileLink() };
    }
    return item;
  });


  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-md items-center justify-around h-20">
          {finalNavItems.map((item) => {
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
                <div className={cn("w-full h-8 rounded-full flex items-center justify-center mb-1", isActive && "bg-primary/20")}>
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
