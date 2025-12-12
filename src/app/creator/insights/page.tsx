
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { Bell, DollarSign, Eye, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}

const retentionData = [
    { name: '0:00', value: 50 },
    { name: '2:30', value: 65 },
    { name: '4:20', value: 78 },
    { name: '5:00', value: 70 },
    { name: '7:30', value: 60 },
    { name: '10:00', value: 55 },
];

const trafficSources = [
    { source: 'Direct', percentage: 45 },
    { source: 'Explore Page', percentage: 32 },
    { source: 'External (Twitter/X)', percentage: 18 },
];

const hotTrends = ['#Bitcoin', '#CreatorEconomy', '#Vlog', '#TechSetup', '#Photography', '#Workflow'];

export default function ContentInsightsPage() {
    const { user } = useUser();
    const [timeframe, setTimeframe] = useState('7d');

    return (
        <div className="bg-background text-foreground pb-24">
            <header className="sticky top-0 z-20 w-full p-4 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.photoURL ?? undefined} />
                            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-lg font-bold">Content Insights</h1>
                            <p className="text-sm text-muted-foreground">@{user?.displayName?.toLowerCase().replace(' ', '_')}_creator</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-6 w-6" />
                        <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                    </Button>
                </div>
            </header>

            <main className="p-4 space-y-6">
                <div className="flex justify-between items-center bg-card p-1 rounded-full">
                    {['24h', '7d', '30d', 'All'].map(t => (
                        <Button key={t} onClick={() => setTimeframe(t)} variant={timeframe === t ? 'default' : 'ghost'} className="flex-1 rounded-full h-8 text-sm">
                            {t === '7d' ? '7d' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </Button>
                    ))}
                </div>

                <Card className="p-5 bg-card/80">
                    <CardContent className="p-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground">TOTAL ENGAGEMENT</p>
                                <p className="text-4xl font-bold my-1">154.2K</p>
                                <div className="flex items-center gap-1 text-green-400 font-medium">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>+24%</span>
                                    <span className="text-muted-foreground text-xs ml-1">vs. previous 7 days</span>
                                </div>
                            </div>
                            <BarChartIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-card/80">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Eye className="h-4 w-4" />
                                <span className="text-xs font-bold">AVG VIEWS</span>
                            </div>
                            <p className="text-3xl font-bold">42.8K</p>
                        </CardContent>
                    </Card>
                     <Card className="p-4 bg-card/80">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs font-bold">TIPS (USD)</span>
                            </div>
                            <p className="text-3xl font-bold">$1,240</p>
                        </CardContent>
                    </Card>
                </div>
                
                <Card className="p-4 bg-card/80">
                    <CardContent className="p-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Audience Retention</h3>
                            <Button variant="link" size="sm" className="text-primary h-auto p-0">Details</Button>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                             <div>
                                <p className="text-xs text-muted-foreground">Avg. Retention Rate</p>
                                <p className="text-3xl font-bold">65.4%</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className="rounded-full h-7">Video</Button>
                                <Button variant="ghost" size="sm" className="rounded-full h-7">Audio</Button>
                            </div>
                        </div>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={retentionData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis hide={true} domain={[0, 100]}/>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                                        formatter={(value) => [`${value}%`, 'Retention']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorRetention)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <h3 className="font-semibold mb-3">Top Performing</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/80 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative">
                                    <Image src="https://images.unsplash.com/photo-1599949986349-f47c94b79116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx2aWRlbyUyMGNhbWVyYXxlbnwwfHx8fDE3MjE4MzYzNjd8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="BTS Vlog" width={300} height={200} className="w-full h-auto object-cover" />
                                    <div className="absolute top-2 left-2">
                                        <div className="text-xs font-bold bg-primary text-primary-foreground rounded-md px-1.5 py-0.5">Trending</div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 text-xs bg-black/50 text-white rounded px-1.5 py-0.5">12:04</div>
                                </div>
                                <div className="p-3">
                                    <p className="font-semibold text-sm truncate">Exclusive BTS Vlog: Studio...</p>
                                    <p className="text-xs text-muted-foreground">Posted 2 days ago</p>
                                    <div className="flex justify-between mt-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">VIEWS</p>
                                            <p className="font-bold text-sm">12.4K</p>
                                        </div>
                                         <div>
                                            <p className="text-xs text-muted-foreground">RETENTION</p>
                                            <p className="font-bold text-sm">98%</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/80 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative">
                                    <Image src="https://images.unsplash.com/photo-1640283083654-720b0b8c4a1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjeWJlcnB1bmclMjBhcnR8ZW58MHx8fHwxNzIxODM2Mzg0fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Crypto AI" width={300} height={200} className="w-full h-auto object-cover" />
                                </div>
                                <div className="p-3">
                                    <p className="font-semibold text-sm truncate">Crypto AI Art</p>
                                    <p className="text-xs text-muted-foreground">Posted 5 days ago</p>
                                    <div className="flex justify-between mt-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">VIEWS</p>
                                            <p className="font-bold text-sm">8.1K</p>
                                        </div>
                                         <div>
                                            <p className="text-xs text-muted-foreground">RETENTION</p>
                                            <p className="font-bold text-sm">82%</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                 <Card className="p-4 bg-card/80">
                    <CardContent className="p-0">
                         <h3 className="font-semibold mb-4">Traffic Sources</h3>
                         <div className="space-y-4">
                            {trafficSources.map(source => (
                                <div key={source.source}>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-muted-foreground">{source.source}</span>
                                        <span className="font-medium">{source.percentage}%</span>
                                    </div>
                                    <Progress value={source.percentage} className="h-2" />
                                </div>
                            ))}
                         </div>
                    </CardContent>
                </Card>

                 <Card className="p-4 bg-card/80">
                    <CardContent className="p-0">
                         <h3 className="font-semibold mb-4">Hot Trends</h3>
                         <div className="flex flex-wrap gap-2">
                            {hotTrends.map(trend => (
                                <Button key={trend} variant={trend === '#Bitcoin' || trend === '#TechSetup' ? 'default' : 'secondary'} size="sm" className="rounded-full h-7 font-normal">
                                    {trend}
                                </Button>
                            ))}
                         </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
