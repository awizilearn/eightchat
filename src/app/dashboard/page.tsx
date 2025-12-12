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
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo, useEffect } from 'react';
import { UserProfile } from '@/lib/chat-data';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

function DashboardSkeleton() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <div className="mx-auto max-w-md w-full p-4 sm:p-6">
                <div className="flex flex-col gap-6">
                    {/* Header Skeleton */}
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className='space-y-2'>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                           <Skeleton className="h-8 w-8 rounded-md" />
                           <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </header>
                    
                    {/* Balance Skeleton */}
                    <div className="w-full space-y-4">
                        <div className="flex justify-center">
                            <Skeleton className="h-10 w-56 rounded-full" />
                        </div>
                        <div className="text-center space-y-2">
                             <Skeleton className="h-4 w-32 mx-auto" />
                             <Skeleton className="h-12 w-48 mx-auto" />
                             <Skeleton className="h-6 w-36 mx-auto" />
                        </div>
                        <Skeleton className="h-40 w-full" />
                    </div>
                    
                     {/* Engagement Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-40" />
                        <div className="grid grid-cols-3 gap-3">
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                    </div>
                  
                    {/* Activity Skeleton */}
                     <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-2">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-grow space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                      </div>
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
        // This case should be rare with the new signup flow
        router.replace('/home');
      } else if (userProfile?.role !== 'createur') {
        router.replace('/discover');
      }
    }
  }, [loading, user, userProfile, userProfileDoc, router]);

  if (loading || !user || !userProfileDoc?.exists() || userProfile?.role !== 'createur') {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground pb-24">
      <div className="mx-auto max-w-md w-full p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          <DashboardHeader />
          <Balance />
          <RevenueChart />
          <RecentActivity userId={user.uid} />
        </div>
      </div>
    </div>
  );
}
