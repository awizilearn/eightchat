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
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-8">
                    {/* Header Skeleton */}
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className='space-y-2'>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </header>
                    {/* Balance Skeleton */}
                    <Card className="w-full">
                        <CardContent className="p-6 space-y-4">
                             <Skeleton className="h-4 w-32" />
                             <Skeleton className="h-10 w-48" />
                             <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                             </div>
                             <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                     {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                    {/* Chart Skeleton */}
                    <Skeleton className="h-80 w-full" />
                    {/* Activity Skeleton */}
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    );
}

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
  // and redirect if profile doesn't exist
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!userProfileDoc?.exists()) {
        router.replace('/complete-profile');
      } else if (userProfile?.role !== 'createur') {
        router.replace('/discover');
      }
    }
  }, [loading, user, userProfile, userProfileDoc, router]);

  if (loading || userProfile?.role !== 'createur') {
    return <DashboardSkeleton />;
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
          <RecentActivity userId={user.uid} />
        </div>
      </div>
    </div>
  );
}
