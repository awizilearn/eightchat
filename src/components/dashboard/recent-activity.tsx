'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  ArrowUpRight,
  HeartHandshake,
  MinusCircle,
  PlusCircle,
  Activity,
} from 'lucide-react';
import type { Transaction } from '@/lib/chat-data';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ICONS: { [key in Transaction['type']]: React.ReactNode } = {
  sub: <UserPlus className="h-5 w-5" />,
  payout: <ArrowUpRight className="h-5 w-5" />,
  tip: <HeartHandshake className="h-5 w-5" />,
};

const ICON_BGS: { [key in Transaction['type']]: string } = {
  sub: 'bg-blue-500/20 text-blue-400',
  payout: 'bg-red-500/20 text-red-400',
  tip: 'bg-purple-500/20 text-purple-400',
};

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isPositive = transaction.amount >= 0;
  return (
    <li className="flex items-center gap-4 py-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          ICON_BGS[transaction.type]
        )}
      >
        {ICONS[transaction.type]}
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{transaction.description}</p>
        <p className="text-sm text-muted-foreground">
          {transaction.date instanceof Timestamp
            ? formatDistanceToNow(transaction.date.toDate(), { addSuffix: true, locale: fr })
            : String(transaction.date)}{' '}
          &bull; {transaction.method}
        </p>
      </div>
      <div
        className={cn(
          'font-semibold flex items-center gap-1',
          isPositive ? 'text-primary' : 'text-foreground'
        )}
      >
        {isPositive ? (
          <PlusCircle className="h-4 w-4 text-green-500" />
        ) : (
          <MinusCircle className="h-4 w-4 text-red-500" />
        )}
        $
        {Math.abs(transaction.amount).toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}
      </div>
    </li>
  );
}

function ActivitySkeleton() {
    return (
        <ul className="divide-y divide-border">
            {[...Array(4)].map((_, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </li>
            ))}
        </ul>
    );
}

export function RecentActivity({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const transactionsQuery = useMemo(() => {
    if (!firestore || !userId) return null;
    return query(
        collection(firestore, 'transactions'), 
        where('userId', '==', userId),
        orderBy('date', 'desc')
    );
  }, [firestore, userId]);

  const { data: transactionsData, loading } = useCollection(transactionsQuery);

  const transactions = useMemo(() => {
    if (!transactionsData) return [];
    return transactionsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  }, [transactionsData]);


  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="link">View All</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
            <ActivitySkeleton />
        ) : transactions.length > 0 ? (
            <ul className="divide-y divide-border">
            {transactions.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
            ))}
            </ul>
        ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2 border-dashed border-2 rounded-lg">
                <Activity className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune activité récente à afficher.</p>
                <p className="text-xs text-muted-foreground/80">Les nouvelles transactions apparaîtront ici.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
