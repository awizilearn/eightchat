import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/common/header';
import { findCreatorById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { MessageCircle, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SubscriptionTierCard } from '@/components/creators/subscription-tier-card';
import { ContentCard } from '@/components/creators/content-card';
import { Separator } from '@/components/ui/separator';

export default function CreatorProfilePage({ params }: { params: { id: string } }) {
  const creator = findCreatorById(params.id);

  if (!creator) {
    notFound();
  }

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={creator.banner.imageUrl}
            alt={`${creator.name}'s banner`}
            fill
            className="object-cover"
            priority
            data-ai-hint={creator.banner.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 pb-12 -mt-20">
          {/* Creator Info Header */}
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-lg">
              <AvatarImage src={creator.avatar.imageUrl} alt={creator.name} data-ai-hint={creator.avatar.imageHint} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-headline text-4xl md:text-5xl font-bold">{creator.name}</h1>
              <p className="text-lg text-muted-foreground">{creator.category}</p>
            </div>
            <div className="flex gap-2">
              <Button size="lg" variant="secondary">
                <MessageCircle className="mr-2 h-5 w-5" />
                Message
              </Button>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Check className="mr-2 h-5 w-5" />
                Subscribed
              </Button>
            </div>
          </div>
          
          <p className="max-w-3xl mx-auto md:mx-0 text-center md:text-left mb-12 text-foreground/90">
            {creator.longBio}
          </p>
          
          <Separator className="my-12 bg-border/50" />

          {/* Subscription Tiers */}
          <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold text-center mb-8">
              Join the <span className="text-primary">{creator.name}'s Enclave</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {creator.tiers.map((tier) => (
                <SubscriptionTierCard key={tier.name} tier={tier} creatorName={creator.name} />
              ))}
            </div>
          </section>

          <Separator className="my-12 bg-border/50" />

          {/* Content Grid */}
          <section>
            <h2 className="font-headline text-3xl font-bold mb-8">
              Exclusive Content
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creator.content.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <footer className="py-8 text-center text-muted-foreground border-t">
         <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </>
  );
}
