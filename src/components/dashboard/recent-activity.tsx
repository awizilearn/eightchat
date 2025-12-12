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
} from 'lucide-react';
import type { Transaction } from '@/lib/chat-data';
import { cn } from '@/lib/utils';

// Mock data, in a real app this would come from a Firestore query
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'sub',
    description: 'New Sub: @john_doe',
    date: 'Today, 2:30 PM',
    method: 'Stripe',
    amount: 15.0,
  },
  {
    id: '2',
    type: 'payout',
    description: 'Payout to Coinbase',
    date: 'Yesterday, 9:00 AM',
    method: 'ETH',
    amount: -2500.0,
  },
  {
    id: '3',
    type: 'tip',
    description: 'Tip from @sarah_design',
    date: 'Oct 24, 4:15 PM',
    method: 'Stripe',
    amount: 50.0,
  },
  {
    id: '4',
    type: 'sub',
    description: 'New Sub: @cryptofan',
    date: 'Oct 23, 11:30 AM',
    method: 'Crypto',
    amount: 15.0,
  },
];

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
          {transaction.date} &bull; {transaction.method}
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

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="link">View All</Button>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {mockTransactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
