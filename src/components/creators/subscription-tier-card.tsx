'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import type { SubscriptionTier } from '@/lib/data';
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import React, { useState } from 'react';
import { createStripeCheckoutSession, createCoinbaseCharge } from '@/app/actions/payments';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

function StripeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="40" height="25" viewBox="0 0 80 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M72.06 13.92H64V26.04H72.06C74.34 26.04 76.08 24.3 76.08 22.02V17.94C76.08 15.66 74.34 13.92 72.06 13.92Z" />
      <path d="M55.8 26.04H63.48V10H55.8C52.02 10 49.2 12.78 49.2 16.56V19.44C49.2 23.22 52.02 26.04 55.8 26.04ZM55.8 13.92H59.58V22.14H55.8C54.18 22.14 53.1 21.06 53.1 19.44V16.56C53.1 15 54.18 13.92 55.8 13.92Z" />
      <path d="M43.08 10H38.52L34.68 20.4L30.9 10H26.28L32.4 26.04H37.02L43.08 10Z" />
      <path d="M21.18 10H25.8V26.04H21.18V10Z" />
      <path d="M12.42 10H20.7V13.92H16.32V16.08H20.22V19.98H16.32V22.14H20.7V26.04H12.42V10Z" />
      <path d="M3.92 10H8.54L12.38 20.4L16.22 10H20.84L14.72 26.04H10.1L3.92 10Z" />
    </svg>
  )
}

function CoinbaseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM10.5185 7.15176H13.4815V16.8482H10.5185V7.15176Z" />
        </svg>
    )
}

function PaymentDialog({ tier, creatorName }: { tier: SubscriptionTier; creatorName: string }) {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState<null | 'stripe' | 'coinbase'>(null);
    const closeRef = React.useRef<HTMLButtonElement>(null);

    const handlePayment = async (method: 'stripe' | 'coinbase') => {
        if (!user) {
            toast({ variant: 'destructive', title: "Vous devez être connecté pour vous abonner." });
            return;
        }
        setIsLoading(method);
        toast({ title: "Traitement de votre paiement..." });

        const checkoutInput = {
            userId: user.uid,
            itemId: tier.name,
            amount: tier.price,
            itemName: `Abonnement ${tier.name} à ${creatorName}`,
        };

        let result;
        if (method === 'stripe') {
            result = await createStripeCheckoutSession(checkoutInput);
        } else {
            result = await createCoinbaseCharge(checkoutInput);
        }

        setIsLoading(null);

        if (result.success && result.redirectUrl) {
            toast({
                title: "Redirection vers le paiement...",
                description: `Vous allez être redirigé pour finaliser votre abonnement via ${method}.`,
            });
            router.push(result.redirectUrl);
        } else {
            toast({
                variant: 'destructive',
                title: "Échec du paiement",
                description: result.error || "Une erreur est survenue.",
            });
        }
    };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant={tier.name === 'Gold' ? 'default' : 'secondary'}>
          {tier.cta}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Abonnement au niveau {tier.name}</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de vous abonner au niveau {tier.name} de {creatorName} pour ${tier.price}/mois.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">Choisissez votre méthode de paiement pour finaliser l'abonnement.</p>
            <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-14 text-lg gap-4 px-4 items-center" onClick={() => handlePayment('stripe')} disabled={!!isLoading}>
                    <StripeIcon className="text-[#6772E5]" />
                    <span>{isLoading === 'stripe' ? 'Traitement...' : 'Payer avec Stripe'}</span>
                </Button>
                <Button variant="outline" className="w-full justify-start h-14 text-lg gap-4 px-4 items-center" onClick={() => handlePayment('coinbase')} disabled={!!isLoading}>
                    <CoinbaseIcon className="text-[#0052FF]" />
                     <span>{isLoading === 'coinbase' ? 'Traitement...' : 'Payer avec Coinbase'}</span>
                </Button>
            </div>
        </div>
        <DialogFooter className="!justify-center">
          <p className="text-xs text-muted-foreground text-center">
            En vous abonnant, vous acceptez nos Conditions d'utilisation.
          </p>
        </DialogFooter>
        <DialogClose ref={closeRef} className="sr-only">Close</DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export function SubscriptionTierCard({ tier, creatorName }: { tier: SubscriptionTier; creatorName: string }) {
  const isGold = tier.name === 'Gold';
  
  return (
    <Card className={`flex flex-col ${isGold ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className={`font-headline text-2xl ${isGold ? 'text-primary' : ''}`}>{tier.name}</CardTitle>
          {isGold && <Badge variant="default" className="bg-primary text-primary-foreground">Le plus populaire</Badge>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">${tier.price}</span>
          <span className="text-sm text-muted-foreground">/mois</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2 text-sm">
          {tier.perks.map((perk) => (
            <li key={perk} className="flex items-start">
              <Check className="mr-2 mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <PaymentDialog tier={tier} creatorName={creatorName} />
      </CardFooter>
    </Card>
  );
}
