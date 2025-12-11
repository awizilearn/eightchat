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
import { collection, doc, query, where } from 'firebase/firestore';
import type { ModerationAction, UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

type ActionStatus = 'All Actions' | 'Approved' | 'Rejected' | 'Warnings' | 'Banned' | 'Muted';

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
                    by {action.moderatorId} &bull;{' '}
                    {action.timestamp instanceof Timestamp
                        ? formatDistanceToNow(action.timestamp.toDate(), { addSuffix: true, locale: fr })
                        : action.timestamp}
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

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfileDoc, loading: profileLoading } = useDoc(userProfileRef);
    const userProfile = userProfileDoc?.data() as UserProfile;

    const moderationQuery = useMemo(() => {
        if (!firestore) return null;
        // In a real app, you might want to add ordering and limits
        return query(collection(firestore, 'moderation-actions'));
    }, [firestore]);

    const { data: moderationData, loading: actionsLoading } = useCollection(moderationQuery);

    const actions = useMemo(() => {
        if (!moderationData) return [];
        return moderationData.docs.map(doc => ({ id: doc.id, ...doc.data() } as ModerationAction & {id: string}));
    }, [moderationData]);
    
    const filteredData = useMemo(() => actions.filter(item => {
        if (activeTab === 'All Actions') return true;
        return actionTypeToStatusMap[item.actionType] === activeTab;
    }), [actions, activeTab]);

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
                    Moderation Notifications
                </h2>

                <div className="space-y-4 mb-6">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {filterButtons.map((filter) => (
                            <Button
                                key={filter}
                                variant={activeTab === filter ? 'default' : 'secondary'}
                                onClick={() => setActiveTab(filter)}
                                className="rounded-full px-4"
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
                                    Last 7 Days
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Last 24 hours</DropdownMenuItem>
                                <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
                                <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" className="flex-1">
                                    <Users className="mr-2 h-4 w-4" />
                                    All Moderators
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {/* These should be populated dynamically too */}
                                <DropdownMenuItem>@admin_user</DropdownMenuItem>
                                <DropdownMenuItem>@moderator_x</DropdownMenuItem>
                                <DropdownMenuItem>@moderator_y</DropdownMenuItem>
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
