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
  Heart,
  Lock
} from 'lucide-react';
import type { Transaction, UserProfile } from '@/lib/chat-data';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, orderBy, Timestamp, doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

function BitcoinIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.6695 11.237C17.2635 10.7423 17.6183 10.0249 17.6183 9.243C17.6183 7.821 16.5923 6.666 15.3128 6.516V6.513C15.3128 6.003 15.1095 5.514 14.7503 5.157L14.7533 5.154C14.7533 5.154 14.7533 5.154 14.7533 5.154C13.8293 4.23 12.5123 4.23 11.5883 5.154L8.33783 8.4045C8.16233 8.226 7.97483 8.0595 7.77833 7.905L7.77533 7.908C7.77533 7.908 7.77533 7.908 7.77533 7.908C6.85133 7.005 5.53433 7.005 4.61033 7.908C3.68633 8.832 3.68633 10.149 4.61033 11.073L4.61333 11.076C4.61333 11.076 4.61333 11.076 4.61333 11.076L7.86383 14.3265C8.04233 14.502 8.22983 14.6685 8.42633 14.823L8.42933 14.82C8.42933 14.82 8.42933 14.82 8.42933 14.82C9.35333 15.744 10.6703 15.744 11.5943 14.82L14.8448 11.5695C15.0203 11.748 15.2078 11.9145 15.4043 12.069L15.4073 12.066C15.4073 12.066 15.4073 12.066 15.4073 12.066C16.3313 12.969 17.6483 12.969 18.5723 12.066C19.5113 11.127 19.4963 9.798 18.5723 8.874C17.6483 7.95 16.3313 7.95 15.4073 8.874L15.4043 8.877C15.1958 9.042 14.9978 9.219 14.8133 9.405L11.5943 12.624C11.1323 13.086 10.3943 13.086 9.93233 12.624C9.47033 12.162 9.47033 11.424 9.93233 10.962L13.1513 7.743C13.6133 7.281 14.3513 7.281 14.8133 7.743C15.2753 8.205 15.2753 8.943 14.8133 9.405L13.9103 10.308C13.6283 10.59 13.6283 11.052 13.9103 11.334C14.1923 11.616 14.6543 11.616 14.9363 11.334L15.8393 10.431C16.0373 10.233 16.2713 10.08 16.5173 9.984C16.6675 10.347 16.713 10.749 16.6695 11.237Z" />
        </svg>
    )
}

const ICONS: Record<Transaction['type'], { icon: React.ReactNode, bg: string }> = {
    sub: { icon: <UserPlus className="h-5 w-5 text-green-400" />, bg: 'bg-green-500/20' },
    tip: { icon: <Heart className="h-5 w-5 text-purple-400" />, bg: 'bg-purple-400/20' },
    payout: { icon: <BitcoinIcon className="h-5 w-5 text-orange-400" />, bg: 'bg-orange-400/20' },
};


function TransactionItem({ tx }: { tx: Transaction & { id: string } }) {
  const { icon, bg } = ICONS[tx.type] || { icon: <Heart />, bg: 'bg-gray-500/20' };
  
  // To get subscriber name, we need to fetch the user profile
  const firestore = useFirestore();
  const subscriberRef = useMemoFirebase(() => {
    if (!firestore || !tx.subscriberId) return null;
    return doc(firestore, 'users', tx.subscriberId);
  }, [firestore, tx.subscriberId]);
  const { data: subscriberDoc, loading } = useDoc(subscriberRef);
  const subscriber = subscriberDoc?.data() as UserProfile | undefined;

  const description = loading ? '...' : (tx.description || `Abonnement de ${subscriber?.displayName || 'un utilisateur'}`);

  return (
    <li className="flex items-center gap-4 py-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          bg
        )}
      >
        {icon}
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{description}</p>
        <p className="text-sm text-muted-foreground">
            {tx.date instanceof Timestamp
            ? formatDistanceToNow(tx.date.toDate(), { addSuffix: true, locale: fr })
            : '...'}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-primary">
            {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
        </p>
      </div>
    </li>
  );
}

function ActivitySkeleton() {
    return (
        <ul className="space-y-1">
            {[...Array(3)].map((_, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                     <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-16" />
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function RecentActivity({ userId }: { userId: string }) {
  const firestore = useFirestore();
  
  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
        collection(firestore, 'transactions'), 
        where('creatorId', '==', userId),
        orderBy('date', 'desc')
    );
  }, [firestore, userId]);
  
  const { data: transactions, loading } = useCollection<Transaction & { id: string }>(transactionsQuery);

  return (
    <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {loading ? (
            <ActivitySkeleton />
        ) : transactions && transactions.length > 0 ? (
            <ul className="space-y-1">
            {transactions.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
            ))}
            </ul>
        ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2 border-dashed border-2 rounded-lg border-border">
                <p className="text-muted-foreground">No recent activity.</p>
            </div>
        )}
      </div>
  );
}
