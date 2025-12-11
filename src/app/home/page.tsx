'use client';

import { Header } from '@/components/common/header';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to discover page as the main authenticated view
    router.replace('/discover');
  }, [router]);

  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
      <footer className="py-8 mt-16 text-center text-muted-foreground border-t">
         <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </>
  );
}
