'use client';
import { useState } from 'react';
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

type ActionStatus = 'All Actions' | 'Approved' | 'Rejected' | 'Warnings' | 'Banned' | 'Muted';

type ActionType =
  | 'Content Approved'
  | 'User Banned'
  | 'Warning Issued'
  | 'Content Rejected'
  | 'User Muted';

interface ModerationAction {
  id: number;
  type: ActionType;
  icon: React.ReactNode;
  iconBg: string;
  targetType: 'Post' | 'User' | 'To user';
  targetUser: string;
  moderator: string;
  timestamp: string;
  duration?: string;
  status: 'Approved' | 'Rejected' | 'Warnings' | 'Banned' | 'Muted';
}

const mockData: ModerationAction[] = [
  {
    id: 1,
    type: 'Content Approved',
    icon: <CheckCircle className="h-5 w-5 text-green-400" />,
    iconBg: 'bg-green-500/20',
    targetType: 'Post',
    targetUser: '@creatorname',
    moderator: '@admin_user',
    timestamp: '2h ago',
    status: 'Approved',
  },
  {
    id: 2,
    type: 'User Banned',
    icon: <Ban className="h-5 w-5 text-red-400" />,
    iconBg: 'bg-red-500/20',
    targetType: 'User',
    targetUser: '@username',
    moderator: '@moderator_x',
    timestamp: '8h ago',
    status: 'Banned',
  },
  {
    id: 3,
    type: 'Warning Issued',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    iconBg: 'bg-yellow-500/20',
    targetType: 'To user',
    targetUser: '@anotheruser',
    moderator: '@admin_user',
    timestamp: '1d ago',
    status: 'Warnings',
  },
  {
    id: 4,
    type: 'Content Rejected',
    icon: <XCircle className="h-5 w-5 text-orange-400" />,
    iconBg: 'bg-orange-500/20',
    targetType: 'Post',
    targetUser: '@somecreator',
    moderator: '@moderator_y',
    timestamp: '1d ago',
    status: 'Rejected',
  },
  {
    id: 5,
    type: 'User Muted',
    icon: <VolumeX className="h-5 w-5 text-blue-400" />,
    iconBg: 'bg-blue-500/20',
    targetType: 'User',
    targetUser: '@chatty_user',
    duration: 'for 24h',
    moderator: '@moderator_x',
    timestamp: '2d ago',
    status: 'Muted',
  },
  {
    id: 6,
    type: 'Content Approved',
    icon: <CheckCircle className="h-5 w-5 text-green-400" />,
    iconBg: 'bg-green-500/20',
    targetType: 'Post',
    targetUser: '@new_creator',
    moderator: '@admin_user',
    timestamp: '3d ago',
    status: 'Approved',
  },
];

const filterButtons: ActionStatus[] = ['All Actions', 'Approved', 'Rejected', 'Warnings'];


export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<ActionStatus>('All Actions');

  const filteredData = mockData.filter(item => {
    if (activeTab === 'All Actions') return true;
    return item.status === activeTab;
  });

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
                <DropdownMenuItem>@admin_user</DropdownMenuItem>
                <DropdownMenuItem>@moderator_x</DropdownMenuItem>
                <DropdownMenuItem>@moderator_y</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ul className="space-y-4">
          {filteredData.map(action => (
            <li key={action.id} className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${action.iconBg}`}
              >
                {action.icon}
              </div>
              <div className="flex-grow">
                <p className="font-semibold">{action.type}</p>
                <p className="text-sm text-muted-foreground">
                  {action.targetType}:{' '}
                  <span className="text-primary font-medium">
                    {action.targetUser}
                  </span>{' '}
                  {action.duration}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  by {action.moderator} &bull; {action.timestamp}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
