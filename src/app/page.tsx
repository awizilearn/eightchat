'use client';

import { ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import placeholderData from '@/lib/placeholder-images.json';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

const PlaceHolderImages: ImagePlaceholder[] = placeholderData.placeholderImages;

export default function WelcomePage() {
  const router = useRouter();

  const onboardingImage = PlaceHolderImages.find(
    (img) => img.id === 'onboarding-image'
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <main className="flex w-full max-w-md flex-col items-center text-center">
        <ShieldCheck className="h-10 w-10 text-primary" />
        
        <div className="my-8 w-full overflow-hidden rounded-2xl border-2 border-border shadow-lg">
           {onboardingImage && (
            <Image
                src={onboardingImage.imageUrl}
                alt={onboardingImage.description}
                width={600}
                height={400}
                className="aspect-[4/3] w-full object-cover"
                data-ai-hint={onboardingImage.imageHint}
                priority
            />
           )}
        </div>

        <h1 className="font-headline text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Unlock Exclusive Worlds
        </h1>
        <p className="mt-4 max-w-xs text-base text-muted-foreground sm:text-lg">
          Access premium content from your favorite creators. Subscribe securely
          with Stripe or Crypto and connect with end-to-end encrypted
          messaging.
        </p>

        <div className="mt-10 flex w-full flex-col gap-4">
          <Button
            size="lg"
            className="h-12 text-base"
            onClick={() => router.push('/login')}
          >
            Get Started
          </Button>
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => router.push('/login')}
          >
            Already have an account? Sign In
          </Button>
        </div>
      </main>
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Golden Enclave. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
