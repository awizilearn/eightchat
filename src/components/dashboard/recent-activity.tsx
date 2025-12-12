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
import type { Transaction } from '@/lib/chat-data';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

function BitcoinIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.6695 11.237C17.2635 10.7423 17.6183 10.0249 17.6183 9.243C17.6183 7.821 16.5923 6.666 15.3128 6.516V6.513C15.3128 6.003 15.1095 5.514 14.7503 5.157L14.7533 5.154C14.7533 5.154 14.7533 5.154 14.7533 5.154C13.8293 4.23 12.5123 4.23 11.5883 5.154L8.33783 8.4045C8.16233 8.226 7.97483 8.0595 7.77833 7.905L7.77533 7.908C7.77533 7.908 7.77533 7.908 7.77533 7.908C6.85133 7.005 5.53433 7.005 4.61033 7.908C3.68633 8.832 3.68633 10.149 4.61033 11.073L4.61333 11.076C4.61333 11.076 4.61333 11.076 4.61333 11.076L7.86383 14.3265C8.04233 14.502 8.22983 14.6685 8.42633 14.823L8.42933 14.82C8.42933 14.82 8.42933 14.82 8.42933 14.82C9.35333 15.744 10.6703 15.744 11.5943 14.82L14.8448 11.5695C15.0203 11.748 15.2078 11.9145 15.4043 12.069L15.4073 12.066C15.4073 12.066 15.4073 12.066 15.4073 12.066C16.3313 12.969 17.6483 12.969 18.5723 12.066C19.5113 11.127 19.4963 9.798 18.5723 8.874C17.6483 7.95 16.3313 7.95 15.4073 8.874L15.4043 8.877C15.1958 9.042 14.9978 9.219 14.8133 9.405L11.5943 12.624C11.1323 13.086 10.3943 13.086 9.93233 12.624C9.47033 12.162 9.47033 11.424 9.93233 10.962L13.1513 7.743C13.6133 7.281 14.3513 7.281 14.8133 7.743C15.2753 8.205 15.2753 8.943 14.8133 9.405L13.9103 10.308C13.6283 10.59 13.6283 11.052 13.9103 11.334C14.1923 11.616 14.6543 11.616 14.9363 11.334L15.8393 10.431C16.0373 10.233 16.2713 10.08 16.5173 9.984C16.6675 10.347 16.713 10.749 16.6695 11.237Z" />
        </svg>
    )
}

const activities = [
    {
        type: 'sub',
        icon: <BitcoinIcon className="h-5 w-5 text-orange-400" />,
        iconBg: 'bg-orange-400/20',
        description: "CryptoKing subscribed",
        details: "Via Coinbase • 2m ago",
        amount: "+$20.00",
        subAmount: "0.008 ETH"
    },
    {
        type: 'tip',
        icon: <Heart className="h-5 w-5 text-purple-400" />,
        iconBg: 'bg-purple-400/20',
        description: "SarahJ sent a tip",
        details: "One-time Tip • 1h ago",
        amount: "+$50.00",
    },
    {
        type: 'unlock',
        icon: <Lock className="h-5 w-5 text-yellow-400" />,
        iconBg: 'bg-yellow-500/20',
        description: "Mike unlocked video",
        details: "Exclusive Content • 3h ago",
        amount: "+$15.00",
    }
]


function TransactionItem({ activity }: { activity: typeof activities[0] }) {
  return (
    <li className="flex items-center gap-4 py-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          activity.iconBg
        )}
      >
        {activity.icon}
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{activity.description}</p>
        <p className="text-sm text-muted-foreground">{activity.details}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-primary">{activity.amount}</p>
        {activity.subAmount && <p className="text-xs text-muted-foreground">{activity.subAmount}</p>}
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
                        <Skeleton className="h-3 w-12 ml-auto" />
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function RecentActivity({ userId }: { userId: string }) {
  // This is using mock data. In a real app, you would fetch transactions.
  const loading = false;

  return (
    <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {loading ? (
            <ActivitySkeleton />
        ) : activities.length > 0 ? (
            <ul className="space-y-1">
            {activities.map((tx, i) => (
                <TransactionItem key={i} activity={tx} />
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
