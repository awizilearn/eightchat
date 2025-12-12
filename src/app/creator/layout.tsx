
'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
          </Button>
          <h1 className="font-semibold text-lg">New Post</h1>
        </div>
        <Button variant="link" className="text-primary">
          Preview
        </Button>
      </header>
      {children}
    </div>
  );
}
