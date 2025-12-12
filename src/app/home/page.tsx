'use client';

import { Header } from '@/components/common/header';
import { RecommendedCreators } from '@/components/creators/recommended-creators';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/firebase';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUser();

  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-12">
            <h1 className="font-headline text-4xl font-bold">
                Bienvenue, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'dans l\'Enclave'}</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                Voici quelques créateurs qui pourraient vous plaire.
            </p>
        </div>

        <RecommendedCreators />

        <Separator className="my-12" />

        <section className="text-center">
            <h2 className="font-headline text-3xl font-bold mb-4">Prêt à explorer ?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Parcourez notre collection complète de créateurs talentueux et trouvez vos prochains favoris.
            </p>
            <Button asChild size="lg">
                <Link href="/discover">
                    Découvrir tous les créateurs
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </section>

      </main>
      <footer className="py-8 mt-16 text-center text-muted-foreground border-t">
         <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </>
  );
}
