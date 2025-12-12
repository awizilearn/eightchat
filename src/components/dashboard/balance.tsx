'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Wallet } from 'lucide-react';
import { useState } from 'react';

export function Balance() {
  const [currency, setCurrency] = useState<'fiat' | 'crypto'>('fiat');

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">TOTAL BALANCE</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-5xl font-bold tracking-tighter mb-4">$14,205.50</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button
            variant={currency === 'fiat' ? 'default' : 'secondary'}
            onClick={() => setCurrency('fiat')}
          >
            Fiat (USD)
          </Button>
          <Button
            variant={currency === 'crypto' ? 'default' : 'secondary'}
            onClick={() => setCurrency('crypto')}
          >
            Crypto (ETH)
          </Button>
        </div>
        <Button size="lg" className="w-full">
          <Wallet className="mr-2 h-5 w-5" />
          Request Payout
        </Button>
      </CardContent>
    </Card>
  );
}
