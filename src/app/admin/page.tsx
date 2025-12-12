'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  UserPlus,
  Flag,
  MinusCircle,
  BarChart,
  Shield,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

const recentActivity = [
  {
    icon: <UserPlus className="h-5 w-5 text-yellow-400" />,
    iconBg: 'bg-yellow-500/20',
    text: 'New creator application: @AnnaBelle',
  },
  {
    icon: <Flag className="h-5 w-5 text-orange-400" />,
    iconBg: 'bg-orange-500/20',
    text: 'Content reported: Post ID #98721',
  },
  {
    icon: <MinusCircle className="h-5 w-5 text-red-400" />,
    iconBg: 'bg-red-500/20',
    text: 'Stripe Payout of $550 processed for @CreatorX',
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="ghost" size="icon">
          <Settings className="h-6 w-6" />
        </Button>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <StatCard title="Total Revenue" value="$15,280" />
        <StatCard title="Active Subscriptions" value="4,120" />
        <StatCard title="New Users (24h)" value="85" />
        <StatCard title="Pending Payouts" value="12" />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <Button className="w-full h-12 text-base">
            <Users className="mr-2 h-5 w-5" /> Manage Users
          </Button>
          <Button
            variant="secondary"
            className="w-full h-12 text-base"
            onClick={() => router.push('/moderation')}
          >
            <Shield className="mr-2 h-5 w-5" /> Moderate Content
          </Button>
          <Button variant="secondary" className="w-full h-12 text-base">
            <BarChart className="mr-2 h-5 w-5" /> View Analytics
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.iconBg}`}
                >
                  {activity.icon}
                </div>
                <p className="text-sm font-medium">{activity.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
