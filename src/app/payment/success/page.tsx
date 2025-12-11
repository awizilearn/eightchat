'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const method = searchParams.get('method');
    const sessionId = searchParams.get('session_id');
    const chargeId = searchParams.get('charge_id');
    const creatorId = searchParams.get('creatorId');

    setPaymentMethod(method);
    setTransactionId(sessionId || chargeId);
    
    if (user && firestore && creatorId) {
      const updateUserSubscription = async () => {
        const userRef = doc(firestore, 'users', user.uid);
        try {
          // Check if already subscribed to prevent duplicate operations
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
          const isAlreadySubscribed = userData?.subscriptions?.includes(creatorId);

          if (!isAlreadySubscribed) {
              await updateDoc(userRef, {
                subscriptions: arrayUnion(creatorId)
              });
              toast({
                title: "Abonnement activé !",
                description: "Votre abonnement a été ajouté à votre profil."
              });
          }
          setStatus('success');
        } catch (error) {
          console.error("Failed to update subscription:", error);
          setStatus('error');
          toast({
            variant: "destructive",
            title: "Erreur de mise à jour",
            description: "Nous n'avons pas pu mettre à jour votre abonnement."
          });
        }
      };

      updateUserSubscription();
    } else if (!user || !firestore) {
        // Wait for user and firestore to be available
        setStatus('loading');
    } else {
        // If no creatorId, it's an error or different flow
        setStatus('error');
    }

  }, [searchParams, user, firestore, toast]);

  if (status === 'loading') {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background px-4">
         <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                </div>
                <CardTitle className="mt-4 text-2xl font-bold">Mise à jour de l'abonnement...</CardTitle>
                 <CardDescription>
                    Veuillez patienter pendant que nous finalisons votre abonnement.
                </CardDescription>
            </CardHeader>
         </Card>
       </div>
    )
  }
  
  if (status === 'error') {
     return (
       <div className="flex min-h-screen items-center justify-center bg-background px-4">
         <Card className="w-full max-w-md text-center">
            <CardHeader>
                 <CardTitle className="mt-4 text-2xl font-bold text-destructive">Une erreur est survenue</CardTitle>
                 <CardDescription>
                    Impossible de mettre à jour votre abonnement. Veuillez contacter le support.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => router.push('/discover')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retourner à la Découverte
                </Button>
            </CardContent>
         </Card>
       </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Paiement Réussi !</CardTitle>
          <CardDescription>
            Votre transaction a été traitée avec succès.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentMethod && transactionId && (
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p>
                <strong>Méthode de Paiement :</strong> <span className="capitalize">{paymentMethod}</span>
              </p>
              <p className="truncate">
                <strong>ID de Transaction :</strong> {transactionId}
              </p>
              <p className="mt-2 text-xs">
                (Ceci est une transaction simulée)
              </p>
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => router.push('/discover')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retourner à la Découverte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
