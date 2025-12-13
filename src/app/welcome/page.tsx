'use client';

import { ArrowRight, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import React from 'react';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';

const onboardingSteps = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'Unlock Exclusive Worlds',
    description:
      'Subscribe directly to your favorite creators for premium, unseen content.',
    image: placeholderImages.placeholderImages.find(p => p.id === 'onboarding-image-1'),
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-primary" />,
    title: 'Encrypted Messaging',
    description:
      'Chat securely with creators and fans using end-to-end encryption.',
    image: placeholderImages.placeholderImages.find(p => p.id === 'onboarding-image-2'),
  },
  {
    icon: <Star className="h-10 w-10 text-primary" />,
    title: 'Support Creators',
    description: 'Your subscription directly supports the artists and creators you love.',
    image: placeholderImages.placeholderImages.find(p => p.id === 'onboarding-image-3'),
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Loading...</div>
  }
  
  if (user) {
    router.replace('/home');
    return <div className="flex h-screen w-full items-center justify-center bg-background">Redirecting...</div>
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background p-4 sm:p-6">
      <div className="w-full max-w-md text-right">
        <Button variant="link" className="text-muted-foreground" onClick={() => router.push('/login')}>SKIP</Button>
      </div>

      <main className="flex w-full max-w-md flex-col items-center text-center">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {onboardingSteps.map((step, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="bg-transparent border-none shadow-none">
                    <CardContent className="flex flex-col items-center justify-center p-0 gap-8">
                       <div className="relative w-full aspect-[4/3] max-w-sm overflow-hidden rounded-xl">
                         {step.image && (
                           <Image
                            src={step.image.imageUrl}
                            alt={step.title}
                            fill
                            className="object-cover"
                            data-ai-hint={step.image.imageHint}
                          />
                         )}
                       </div>
                       <div className="space-y-2">
                        <h1 className="font-headline text-4xl font-bold leading-tight tracking-tight">
                            {step.title}
                        </h1>
                        <p className="max-w-xs text-base text-muted-foreground">
                            {step.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="py-4 flex justify-center gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={cn('h-2 w-2 rounded-full transition-all', current === i ? 'bg-primary w-4' : 'bg-border')}
              />
            ))}
        </div>
        
        <div className="mt-8 flex w-full flex-col gap-4">
          <Button
            size="lg"
            className="h-12 text-base"
            onClick={() => api?.scrollNext()}
            style={{ display: current === count - 1 ? 'none' : 'inline-flex' }}
          >
            NEXT
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            size="lg"
            className="h-12 text-base"
            style={{ display: current === count - 1 ? 'inline-flex' : 'none' }}
            onClick={() => router.push('/signup')}
          >
            Get Started
          </Button>
        </div>
      </main>

      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p>Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link></p>
      </footer>
    </div>
  );
}
