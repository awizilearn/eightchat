'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MessageSquare,
  Eye
} from 'lucide-react';

const engagementStats = [
    {
        icon: <Users className="h-7 w-7 text-muted-foreground" />,
        value: "1.2k",
        label: "Total Subscribers",
        change: "+54",
        changeColor: "text-green-400"
    },
    {
        icon: <MessageSquare className="h-7 w-7 text-muted-foreground" />,
        value: "28",
        label: "Open Chats",
        badge: "Active"
    },
    {
        icon: <Eye className="h-7 w-7 text-muted-foreground" />,
        value: "8.5k",
        label: "Content Views",
    }
]

export function RevenueChart() {
  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Engagement</h2>
            <Button variant="link" className="text-primary">View detailed</Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
            {engagementStats.map(stat => (
                <Card key={stat.label} className="bg-card/80 backdrop-blur-sm p-3 space-y-3">
                    <div className="flex justify-between items-start">
                        {stat.icon}
                        {stat.change && <span className={`text-xs font-medium ${stat.changeColor}`}>{stat.change}</span>}
                         {stat.badge && <span className="text-xs font-medium bg-primary text-primary-foreground rounded-full px-2 py-0.5">{stat.badge}</span>}
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                </Card>
            ))}
        </div>
    </div>
  );
}
