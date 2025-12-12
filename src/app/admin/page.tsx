'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart,
  ChevronLeft,
  Filter,
  MoreVertical,
  Users,
  Clock,
  MessageSquare,
  Heart,
  Star,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const statData = [
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    label: 'DAU',
    value: '1,284',
    change: '+12.5%',
    changeColor: 'text-green-400',
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    label: 'Avg. Session',
    value: '24m 15s',
    change: '-3.1%',
    changeColor: 'text-red-400',
  },
];

const loginActivityData = [
  { name: 'Mon', value: 2400 },
  { name: 'Tue', value: 1398 },
  { name: 'Wed', value: 9800 },
  { name: 'Thu', value: 3908 },
  { name: 'Fri', value: 4800 },
  { name: 'Sat', value: 3800 },
  { name: 'Sun', value: 4300 },
];

const contentConsumptionData = [
  { name: 'Video Views', value: 245200, color: 'hsl(var(--chart-1))' },
  { name: 'Article Reads', value: 102800, color: 'hsl(var(--chart-2))' },
  { name: 'Audio Plays', value: 88100, color: 'hsl(var(--chart-3))' },
];
const totalConsumption = contentConsumptionData.reduce(
  (acc, curr) => acc + curr.value,
  0
);

const recentActivities = [
  {
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    name: 'Alex Johnson',
    action: 'commented on "Future of Tech"',
    time: '2 minutes ago',
    icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />,
  },
  {
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    name: 'Maria Garcia',
    action: 'liked a video',
    time: '15 minutes ago',
    icon: <Heart className="h-5 w-5 text-primary" fill="currentColor" />,
  },
  {
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    name: 'Chris Lee',
    action: 'subscribed to a creator',
    time: '1 hour ago',
    icon: <Star className="h-5 w-5 text-primary" fill="currentColor" />,
  },
];

function StatCard({
  icon,
  label,
  value,
  change,
  changeColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  changeColor: string;
}) {
  return (
    <Card className="bg-card">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            {icon}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{value}</p>
          <span className={`text-sm font-semibold ${changeColor}`}>
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserReportsPage() {
  return (
    <div className="p-6 space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft />
          </Button>
          <h1 className="text-xl font-bold">User Reports</h1>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical />
        </Button>
      </header>

      <Card className="bg-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button variant="link" className="gap-2">
              <Filter className="h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Date Range</label>
              <Select defaultValue="7d">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">User Type</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="subscriber">Subscribers</SelectItem>
                  <SelectItem value="creator">Creators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Content Category
            </label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-2 gap-4">
        {statData.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Login Activity</h2>
        <Card className="bg-card">
          <CardContent className="h-64 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loginActivityData}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
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
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorUv)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Content Consumption</h2>
        <Card className="bg-card">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentConsumptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    dataKey="value"
                    stroke="none"
                  >
                    {contentConsumptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold">
                  {(totalConsumption / 1000).toFixed(0)}k
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {contentConsumptionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">
                    {(item.value / 1000).toFixed(1)}k
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-2">
          {recentActivities.map((activity, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.avatar} />
                  <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.name}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                {activity.icon}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

    