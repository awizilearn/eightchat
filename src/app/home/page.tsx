import { Header } from '@/components/common/header';
import { CreatorCard } from '@/components/creators/creator-card';
import { creators } from '@/lib/data';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <section>
           <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold">
              Discover Creators
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>
      </main>
      <footer className="py-8 mt-16 text-center text-muted-foreground border-t">
         <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </>
  );
}
