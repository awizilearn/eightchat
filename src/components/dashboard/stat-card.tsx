import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
}

export function StatCard({ icon, label, value, change }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-muted-foreground">
          <div className="h-8 w-8 flex items-center justify-center bg-secondary rounded-lg">
            {icon}
          </div>
          <div
            className={cn(
              'flex items-center text-xs font-semibold',
              isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {isPositive ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
