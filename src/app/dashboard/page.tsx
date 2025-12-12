'use client';
import {
  CalendarDays,
  DollarSign,
  Users,
  TrendingDown,
} from 'lucide-react';
import { Balance } from '@/components/dashboard/balance';
import { DashboardHeader } from '@/components/dashboard/header';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { UserProfile } from '@/lib/chat-data';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfileDoc, loading: profileLoading } = useDoc(userProfileRef);
  const userProfile = userProfileDoc?.data() as UserProfile | undefined;
  
  const loading = userLoading || profileLoading;

  // Protect the route for creators only
  if (!loading && (!user || userProfile?.role !== 'createur')) {
      router.replace('/discover');
      return <div className="flex h-screen items-center justify-center">Accès non autorisé. Redirection...</div>;
  }
  
  // You can show a loading skeleton here
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader />
          <Balance />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Active Subs"
              value="1,204"
              change={12}
            />
            <StatCard
              icon={<TrendingDown className="h-5 w-5" /> }
              label="Churn Rate"
              value="2.1%"
              change={-0.4}
            />
            <StatCard
              icon={<DollarSign className="h-5 w-5" />}
              label="ARPU"
              value="$12.50"
              change={5}
            />
            <StatCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="MRR"
              value="$14.2k"
              change={8}
            />
          </div>
          <RevenueChart />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
