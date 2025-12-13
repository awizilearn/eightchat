'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.includes('/post/new')) {
      return 'New Post';
    }
    if (pathname.includes('/tiers')) {
        return 'Edit Tiers';
    }
    return 'Creator Settings';
  }

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
          </Button>
          <h1 className="font-semibold text-lg">{getTitle()}</h1>
        </div>
        {pathname.includes('/post/new') && (
            <Button variant="link" className="text-primary">
              Preview
            </Button>
        )}
      </header>
      {children}
    </div>
  );
}
