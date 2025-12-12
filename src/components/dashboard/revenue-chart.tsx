'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useState } from 'react';

const chartData = {
  '7d': [
    { day: 'Mon', revenue: 550 },
    { day: 'Tue', revenue: 620 },
    { day: 'Wed', revenue: 780 },
    { day: 'Thu', revenue: 720 },
    { day: 'Fri', revenue: 890 },
    { day: 'Sat', revenue: 1100 },
    { day: 'Sun', revenue: 1250 },
  ],
  '1m': [
    { week: '1', revenue: 2200 },
    { week: '2', revenue: 2900 },
    { week: '3', revenue: 3500 },
    { week: '4', revenue: 4200 },
  ],
  ytd: [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 22000 },
    { month: 'Apr', revenue: 25000 },
    { month: 'May', revenue: 28000 },
    { month: 'Jun', revenue: 31000 },
  ],
};

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

type TimeRange = '7d' | '1m' | 'ytd';

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const data = chartData[timeRange];
  const dataKey =
    timeRange === '7d'
      ? 'day'
      : timeRange === '1m'
      ? 'week'
      : 'month';

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Revenue Growth</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={timeRange === '7d' ? 'default' : 'secondary'}
            onClick={() => setTimeRange('7d')}
          >
            7D
          </Button>
          <Button
            size="sm"
            variant={timeRange === '1m' ? 'default' : 'secondary'}
            onClick={() => setTimeRange('1m')}
          >
            1M
          </Button>
          <Button
            size="sm"
            variant={timeRange === 'ytd' ? 'default' : 'secondary'}
            onClick={() => setTimeRange('ytd')}
          >
            YTD
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#colorRevenue)"
              stroke="var(--color-revenue)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
