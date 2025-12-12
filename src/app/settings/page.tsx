'use client';
import {
  ArrowLeft,
  KeyRound,
  MessageSquare,
  ShieldCheck,
  Bell,
  Palette,
  Globe,
  LogOut,
  CreditCard,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';

function BitcoinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6695 11.237C17.2635 10.7423 17.6183 10.0249 17.6183 9.243C17.6183 7.821 16.5923 6.666 15.3128 6.516V6.513C15.3128 6.003 15.1095 5.514 14.7503 5.157L14.7533 5.154C14.7533 5.154 14.7533 5.154 14.7533 5.154C13.8293 4.23 12.5123 4.23 11.5883 5.154L8.33783 8.4045C8.16233 8.226 7.97483 8.0595 7.77833 7.905L7.77533 7.908C7.77533 7.908 7.77533 7.908 7.77533 7.908C6.85133 7.005 5.53433 7.005 4.61033 7.908C3.68633 8.832 3.68633 10.149 4.61033 11.073L4.61333 11.076C4.61333 11.076 4.61333 11.076 4.61333 11.076L7.86383 14.3265C8.04233 14.502 8.22983 14.6685 8.42633 14.823L8.42933 14.82C8.42933 14.82 8.42933 14.82 8.42933 14.82C9.35333 15.744 10.6703 15.744 11.5943 14.82L14.8448 11.5695C15.0203 11.748 15.2078 11.9145 15.4043 12.069L15.4073 12.066C15.4073 12.066 15.4073 12.066 15.4073 12.066C16.3313 12.969 17.6483 12.969 18.5723 12.066C19.5113 11.127 19.4963 9.798 18.5723 8.874C17.6483 7.95 16.3313 7.95 15.4073 8.874L15.4043 8.877C15.1958 9.042 14.9978 9.219 14.8133 9.405L11.5943 12.624C11.1323 13.086 10.3943 13.086 9.93233 12.624C9.47033 12.162 9.47033 11.424 9.93233 10.962L13.1513 7.743C13.6133 7.281 14.3513 7.281 14.8133 7.743C15.2753 8.205 15.2753 8.943 14.8133 9.405L13.9103 10.308C13.6283 10.59 13.6283 11.052 13.9103 11.334C14.1923 11.616 14.6543 11.616 14.9363 11.334L15.8393 10.431C16.0373 10.233 16.2713 10.08 16.5173 9.984C16.6675 10.347 16.713 10.749 16.6695 11.237Z" />
    </svg>
  );
}

const SettingsItem = ({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) => (
  <div className="flex items-center gap-4 py-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
      {icon}
    </div>
    <div className="flex-grow">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    {action}
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="p-4 flex items-center border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="font-semibold text-lg text-center flex-grow">Settings</h1>
        <div className="w-10"></div>
      </header>

      <main className="p-4 space-y-8 pb-24 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={user?.photoURL ?? undefined} />
              <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">{user?.displayName}</h2>
          <p className="text-muted-foreground">@{user?.displayName?.toLowerCase().replace(' ', '')} • Premium Member</p>
        </div>

        <section>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2 flex justify-between items-center">
            <span>Wallet & Payments</span>
            <Lock className="h-4 w-4" />
          </h3>
          <Card>
            <CardContent className="p-3 divide-y divide-border">
              <div className="flex items-center gap-4 py-3">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <BitcoinIcon className="h-6 w-6"/>
                 </div>
                 <div className="flex-grow">
                    <p className="font-semibold">Coinbase Commerce</p>
                    <Badge variant="outline" className="border-green-500/50 bg-green-500/20 text-green-400 mt-1 font-normal">Connected</Badge>
                 </div>
                 <Button variant="secondary" size="sm">Manage</Button>
              </div>
              <div className="flex items-center gap-4 py-3">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6772E5] text-white">
                    <CreditCard className="h-6 w-6"/>
                 </div>
                 <div className="flex-grow">
                    <p className="font-semibold">Stripe</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                 </div>
                 <Button size="sm">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
            Active Subscriptions
          </h3>
          <Card>
            <CardContent className="p-3 divide-y divide-border">
                <div className="flex items-center gap-4 py-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="https://i.pravatar.cc/150?u=creatorjohn" />
                        <AvatarFallback>CJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">Creator John</p>
                        <p className="text-sm text-muted-foreground">$5.99/mo</p>
                    </div>
                    <div className="text-right">
                        <Switch defaultChecked={true} />
                        <p className="text-xs text-muted-foreground mt-1">Auto-renew</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4 py-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="https://i.pravatar.cc/150?u=sarahsmith" />
                        <AvatarFallback>SS</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">Sarah Smith</p>
                        <p className="text-sm text-muted-foreground">$10.00/mo</p>
                    </div>
                    <div className="text-right">
                        <Switch defaultChecked={false} />
                        <p className="text-xs text-muted-foreground mt-1">Expires in 3d</p>
                    </div>
                </div>
            </CardContent>
          </Card>
          <Button variant="secondary" className="w-full mt-4">Find More Creators</Button>
        </section>

         <section>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
            Privacy & Security
          </h3>
          <Card>
            <CardContent className="p-3 divide-y divide-border">
                <SettingsItem icon={<KeyRound/>} title="Signal Protocol Keys" subtitle="Last updated 2 days ago" action={<Button variant="secondary" size="sm">Regenerate</Button>} />
                <SettingsItem icon={<MessageSquare/>} title="Direct Messages" subtitle="Subscribers only" action={<ChevronRight className="text-muted-foreground" />} />
                <SettingsItem icon={<ShieldCheck/>} title="2FA Authentication" subtitle="" action={<Switch defaultChecked={true}/>} />
            </CardContent>
          </Card>
        </section>

         <section>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
            App Preferences
          </h3>
          <Card>
            <CardContent className="p-3 divide-y divide-border">
                <SettingsItem icon={<Bell/>} title="Notifications" subtitle="" action={<ChevronRight className="text-muted-foreground" />} />
                <SettingsItem icon={<Palette/>} title="Display & Appearance" subtitle="" action={<ChevronRight className="text-muted-foreground" />} />
                <SettingsItem icon={<Globe/>} title="Language" subtitle="English (US)" action={<ChevronRight className="text-muted-foreground" />} />
            </CardContent>
          </Card>
        </section>

        <section className="text-center space-y-4 pt-4">
            <Button variant="secondary" className="w-full max-w-sm">Log Out</Button>
            <Button variant="link" className="text-destructive text-sm">Delete Account</Button>
            <p className="text-xs text-muted-foreground">Version 3.4.1 (Build 209)</p>
        </section>
      </main>
    </div>
  );
}
