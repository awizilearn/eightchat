'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  MoreVertical,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import type { ModerationAction, UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

type ActionStatus = 'All Actions' | 'Approved' | 'Rejected' | 'Warnings' | 'Banned' | 'Muted';
type DateRange = '24hours' | '7days' | '30days' | 'all';

const actionTypeToStatusMap: { [key in ModerationAction['actionType']]: ActionStatus } = {
  contentApproved: 'Approved',
  userBanned: 'Banned',
  warningIssued: 'Warnings',
  contentRejected: 'Rejected',
  userMuted: 'Muted',
};

const ICONS: { [key in ModerationAction['actionType']]: React.ReactNode } = {
    contentApproved: <CheckCircle className="h-5 w-5 text-green-400" />,
    userBanned: <Ban className="h-5 w-5 text-red-400" />,
    warningIssued: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    contentRejected: <XCircle className="h-5 w-5 text-orange-400" />,
    userMuted: <VolumeX className="h-5 w-5 text-blue-400" />,
};

const ICON_BGS: { [key in ModerationAction['actionType']]: string } = {
    contentApproved: 'bg-green-500/20',
    userBanned: 'bg-red-500/20',
    warningIssued: 'bg-yellow-500/20',
    contentRejected: 'bg-orange-500/20',
    userMuted: 'bg-blue-500/20',
};

const filterButtons: ActionStatus[] = ['All Actions', 'Approved', 'Rejected', 'Warnings', 'Banned', 'Muted'];

function ModerationItem({ action }: { action: ModerationAction & {id: string} }) {
    // In a real app, you'd fetch the moderator's profile to show their name
    const moderatorDisplayName = action.moderatorId.substring(0, 8) + '...';

    return (
        <li className="flex items-start gap-4">
            <div
                className={cn(
                    `flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center`,
                    ICON_BGS[action.actionType]
                )}
            >
                {ICONS[action.actionType]}
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{action.actionType.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-sm text-muted-foreground">
                    {action.targetType}:{' '}
                    <span className="text-primary font-medium">
                        {action.targetId}
                    </span>{' '}
                    {action.duration ? `for ${action.duration}h` : ''}
                </p>
                <p className="text-xs text-muted-foreground/70">
                    par {moderatorDisplayName} &bull;{' '}
                    {action.timestamp instanceof Timestamp
                        ? formatDistanceToNow(action.timestamp.toDate(), { addSuffix: true, locale: fr })
                        : String(action.timestamp)}
                </p>
            </div>
        </li>
    );
}

export default function ModerationPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<ActionStatus>('All Actions');
    const [dateRange, setDateRange] = useState<DateRange>('7days');
    const [selectedModerator, setSelectedModerator] = useState<string>('all');

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfileDoc, loading: profileLoading } = useDoc(userProfileRef);
    const userProfile = userProfileDoc?.data() as UserProfile;

    const moderationQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'moderation-actions'), orderBy('timestamp', 'desc'));
    }, [firestore]);

    const { data: moderationData, loading: actionsLoading } = useCollection(moderationQuery);

    const actions = useMemo(() => {
        if (!moderationData) return [];
        return moderationData.docs.map(doc => ({ id: doc.id, ...doc.data() } as ModerationAction & {id: string}));
    }, [moderationData]);
    
    const uniqueModerators = useMemo(() => {
        const moderatorIds = new Set(actions.map(a => a.moderatorId));
        return Array.from(moderatorIds);
    }, [actions]);

    const filteredData = useMemo(() => {
      let dateLimit: Date | null = null;
      if (dateRange === '24hours') dateLimit = subDays(new Date(), 1);
      if (dateRange === '7days') dateLimit = subDays(new Date(), 7);
      if (dateRange === '30days') dateLimit = subDays(new Date(), 30);

      return actions.filter(item => {
        const statusMatch = activeTab === 'All Actions' || actionTypeToStatusMap[item.actionType] === activeTab;
        const moderatorMatch = selectedModerator === 'all' || item.moderatorId === selectedModerator;
        const dateMatch = !dateLimit || (item.timestamp instanceof Timestamp && item.timestamp.toDate() > dateLimit);

        return statusMatch && moderatorMatch && dateMatch;
      });
    }, [actions, activeTab, dateRange, selectedModerator]);

    const loading = userLoading || profileLoading;

    if (!loading && (!user || (userProfile && !['admin', 'moderateur'].includes(userProfile.role)))) {
        router.replace('/discover');
        return <div className="flex h-screen items-center justify-center">Accès non autorisé. Redirection...</div>;
    }

    if (loading) {
        return (
            <div className="bg-background min-h-screen text-foreground">
                <header className="p-4 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft />
                        </Button>
                        <h1 className="font-semibold text-lg">Moderation</h1>
                    </div>
                    <Button variant="ghost" size="icon">
                        <MoreVertical />
                    </Button>
                </header>
                <main className="p-4">
                     <Skeleton className="h-10 w-64 mb-6" />
                     <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }
    
    return (
        <div className="bg-background min-h-screen text-foreground">
            <header className="p-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft />
                    </Button>
                    <h1 className="font-semibold text-lg">Moderation</h1>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical />
                </Button>
            </header>

            <main className="p-4">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">
                    Notifications de Modération
                </h2>

                <div className="space-y-4 mb-6">
                    <div className="space-x-2 overflow-x-auto pb-2 flex">
                        {filterButtons.map((filter) => (
                            <Button
                                key={filter}
                                variant={activeTab === filter ? 'default' : 'secondary'}
                                onClick={() => setActiveTab(filter)}
                                className="rounded-full px-4 flex-shrink-0"
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" className="flex-1">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {dateRange === '24hours' && '24 dernières heures'}
                                    {dateRange === '7days' && '7 derniers jours'}
                                    {dateRange === '30days' && '30 derniers jours'}
                                    {dateRange === 'all' && 'Toute la période'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setDateRange('24hours')}>24 dernières heures</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDateRange('7days')}>7 derniers jours</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDateRange('30days')}>30 derniers jours</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDateRange('all')}>Toute la période</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" className="flex-1">
                                    <Users className="mr-2 h-4 w-4" />
                                    {selectedModerator === 'all' ? 'Tous les modérateurs' : selectedModerator.substring(0, 8)}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setSelectedModerator('all')}>Tous les modérateurs</DropdownMenuItem>
                                {uniqueModerators.map(modId => (
                                   <DropdownMenuItem key={modId} onClick={() => setSelectedModerator(modId)}>
                                        {modId.substring(0, 8)}...
                                   </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {actionsLoading ? (
                     <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {filteredData.map(action => (
                           <ModerationItem key={action.id} action={action} />
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}
