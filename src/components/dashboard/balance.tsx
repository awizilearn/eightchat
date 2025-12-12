'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import {
  AreaChart,
  Area,
} from 'recharts';

const chartData = [
  { day: 'Mon', revenue: 550 },
  { day: 'Tue', revenue: 620 },
  { day: 'Wed', revenue: 780 },
  { day: 'Thu', revenue: 720 },
  { day: 'Fri', revenue: 890 },
  { day: 'Sat', revenue: 1100 },
  { day: 'Sun', revenue: 1250 },
];

export function Balance() {
  const [timeRange, setTimeRange] = useState<'month' | 'all'>('month');

  return (
    <div className="w-full">
        <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-full bg-card p-1">
                <Button 
                    onClick={() => setTimeRange('month')}
                    variant={timeRange === 'month' ? 'default' : 'ghost'} 
                    className="rounded-full w-28"
                >
                    This Month
                </Button>
                 <Button 
                    onClick={() => setTimeRange('all')}
                    variant={timeRange === 'all' ? 'default' : 'ghost'} 
                    className="rounded-full w-28"
                >
                    All Time
                </Button>
            </div>
        </div>

        <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <span>Total Earnings</span>
                <Eye className="h-4 w-4" />
            </div>
            <p className="text-5xl font-bold tracking-tighter my-2 text-primary">$12,450.00</p>
            <div className="flex justify-center">
                 <div className="inline-flex items-center gap-1 text-sm bg-green-500/20 text-green-400 rounded-md px-2 py-1 font-medium">
                    <span className="material-symbols-outlined !text-base">trending_up</span>
                    <span>+15% vs last month</span>
                </div>
            </div>
        </div>

        <div className="h-40 w-full -mt-4">
             <AreaChart
                width={400}
                height={160}
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
             >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorRevenue)"
                    strokeWidth={3}
                />
            </AreaChart>
        </div>
    </div>
  );
}
