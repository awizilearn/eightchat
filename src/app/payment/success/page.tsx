'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const method = searchParams.get('method');
    const sessionId = searchParams.get('session_id');
    const chargeId = searchParams.get('charge_id');
    
    setPaymentMethod(method);
    setTransactionId(sessionId || chargeId);

  }, [searchParams]);

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
