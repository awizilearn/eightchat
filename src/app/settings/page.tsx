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
  Edit,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function BitcoinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-blue-500">
      <path d="M16.6695 11.237C17.2635 10.7423 17.6183 10.0249 17.6183 9.243C17.6183 7.821 16.5923 6.666 15.3128 6.516V6.513C15.3128 6.003 15.1095 5.514 14.7503 5.157L14.7533 5.154C14.7533 5.154 14.7533 5.154 14.7533 5.154C13.8293 4.23 12.5123 4.23 11.5883 5.154L8.33783 8.4045C8.16233 8.226 7.97483 8.0595 7.77833 7.905L7.77533 7.908C7.77533 7.908 7.77533 7.908 7.77533 7.908C6.85133 7.005 5.53433 7.005 4.61033 7.908C3.68633 8.832 3.68633 10.149 4.61033 11.073L4.61333 11.076C4.61333 11.076 4.61333 11.076 4.61333 11.076L7.86383 14.3265C8.04233 14.502 8.22983 14.6685 8.42633 14.823L8.42933 14.82C8.42933 14.82 8.42933 14.82 8.42933 14.82C9.35333 15.744 10.6703 15.744 11.5943 14.82L14.8448 11.5695C15.0203 11.748 15.2078 11.9145 15.4043 12.069L15.4073 12.066C15.4073 12.066 15.4073 12.066 15.4073 12.066C16.3313 12.969 17.6483 12.969 18.5723 12.066C19.5113 11.127 19.4963 9.798 18.5723 8.874C17.6483 7.95 16.3313 7.95 15.4073 8.874L15.4043 8.877C15.1958 9.042 14.9978 9.219 14.8133 9.405L11.5943 12.624C11.1323 13.086 10.3943 13.086 9.93233 12.624C9.47033 12.162 9.47033 11.424 9.93233 10.962L13.1513 7.743C13.6133 7.281 14.3513 7.281 14.8133 7.743C15.2753 8.205 15.2753 8.943 14.8133 9.405L13.9103 10.308C13.6283 10.59 13.6283 11.052 13.9103 11.334C14.1923 11.616 14.6543 11.616 14.9363 11.334L15.8393 10.431C16.0373 10.233 16.2713 10.08 16.5173 9.984C16.6675 10.347 16.713 10.749 16.6695 11.237Z" />
    </svg>
  );
}

function StripeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M10.2311 13.9358H13.3117C14.8698 13.9358 15.8458 12.9868 15.8458 11.5369C15.8458 10.087 14.8698 9.13799 13.3117 9.13799H10.2311V13.9358Z" fill="#6A73CF"/>
        <path d="M15.0831 6H8V17H13.6277C16.2917 17 18.0001 15.234 18.0001 12.5C18.0001 9.766 16.2917 6 13.6277 6H15.0831Z" fill="#6A73CF"/>
        <path d="M6 6H12.6467C15.3108 6 17.0192 7.766 17.0192 10.5C17.0192 13.234 15.3108 15 12.6467 15H6V6Z" fill="#6A73CF"/>
      </svg>
    )
}

const SettingsItem = ({
  icon,
  title,
  subtitle,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    className="flex items-center gap-4 py-4 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
      {icon}
    </div>
    <div className="flex-grow">
      <p className="font-semibold">{title}</p>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {action}
  </div>
);

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props} className="w-5 h-5">
      <path
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props} className="w-6 h-6">
            <radialGradient id="a" cx="192.35" cy="46.35" r="236.4" gradientUnits="userSpaceOnUse">
            <stop offset=".001" stopColor="#fd5" />
            <stop offset=".24" stopColor="#f77" />
            <stop offset=".5" stopColor="#c13" />
            <stop offset=".75" stopColor="#a23" />
            <stop offset="1" stopColor="#63c" />
            </radialGradient>
            <path fill="url(#a)" d="M128 82.7A45.3 45.3 0 10173.3 128 45.3 45.3 0 00128 82.7zm0 74.6a29.3 29.3 0 1129.3-29.3 29.3 29.3 0 01-29.3 29.3zM181.7 60a11.3 11.3 0 1011.3 11.3 11.3 11.3 0 00-11.3-11.3z" />
            <path fill="url(#a)" d="M160.9 0H95.1C42.6 0 0 42.6 0 95.1v65.8C0 213.4 42.6 256 95.1 256h65.8c52.5 0 95.1-42.6 95.1-95.1V95.1C256 42.6 213.4 0 160.9 0zm61.5 160.9c0 34-27.6 61.5-61.5 61.5H95.1c-34 0-61.5-27.6-61.5-61.5V95.1C33.6 61.1 61.1 33.6 95.1 33.6h65.8c34 0 61.5 27.6 61.5 61.5v65.8z" />
        </svg>
    )
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: 'Déconnexion réussie' });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de déconnexion',
        description: 'Une erreur est survenue lors de la déconnexion.',
      });
    }
  };

  const showToast = (title: string, description: string) => {
    toast({ title, description });
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="p-4 flex items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="font-semibold text-lg text-center flex-grow">Settings</h1>
        <div className="w-10"></div>
      </header>

      <main className="p-4 space-y-8 pb-24 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-primary">
              <AvatarImage src={user?.photoURL ?? undefined} />
              <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 rounded-full border-2 border-background">
                <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            <h2 className="text-2xl font-bold">{user?.displayName || "Jane Doe"}</h2>
            <ShieldCheck className="h-6 w-6 text-primary fill-current" />
          </div>
          <p className="text-muted-foreground">@{user?.displayName?.toLowerCase().replace(' ', '') || "janedoe"}</p>
        </div>

        <Button size="lg" className="w-full h-12 text-base" onClick={() => showToast('Edit Profile', 'Profile editing will be available soon.')}>
          Edit Profile
        </Button>
        

        <section>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
            Monetization & Payouts
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
        </section>

         <section>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
            Security & Privacy
          </h3>
          <Card>
            <CardContent className="p-2 divide-y divide-border">
                <SettingsItem 
                    icon={<Lock className="h-6 w-6 text-green-400" />} 
                    title="Signal Encryption" 
                    subtitle="End-to-end verified" 
                    action={<ShieldCheck className="h-5 w-5 text-primary fill-primary" />} 
                />
                <SettingsItem 
                    icon={<KeyRound className="h-6 w-6 text-orange-400" />} 
                    title="Two-Factor Auth" 
                    subtitle="Extra security layer" 
                    action={<Switch defaultChecked={false}/>} 
                />
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
            Notifications
          </h3>
          <Card>
            <CardContent className="p-2 divide-y divide-border">
                <SettingsItem 
                    title="New Subscribers" 
                    icon={<div />}
                    action={<Switch defaultChecked={true}/>} 
                />
                <SettingsItem 
                    title="Tip Received" 
                     icon={<div />}
                    action={<Switch defaultChecked={true}/>} 
                />
                <SettingsItem 
                    title="DM Requests" 
                     icon={<div />}
                    action={<Switch defaultChecked={false}/>} 
                />
            </CardContent>
          </Card>
        </section>
        
        <section>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2">
            Linked Accounts
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Card className="flex flex-col items-center justify-center p-4 gap-2 aspect-square bg-card/50">
                <InstagramIcon />
                <p className="text-sm font-medium">Instagram</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4 gap-2 aspect-square bg-card/50">
                <XIcon />
                <p className="text-sm font-medium">Twitter</p>
            </Card>
             <Card className="flex flex-col items-center justify-center p-4 gap-2 aspect-square bg-card/50 border-dashed border-2 border-border">
                <span className="text-2xl text-muted-foreground">+</span>
                <p className="text-sm font-medium text-muted-foreground">Connect</p>
            </Card>
          </div>
        </section>

        <section className="text-center space-y-4 pt-4">
            <Button variant="secondary" className="w-full max-w-sm h-12" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" />
                Log Out
            </Button>
            <Button variant="link" className="text-destructive text-sm" onClick={() => showToast('Suppression du compte', 'La fonction de suppression du compte sera bientôt disponible.',)}>
                Delete Account
            </Button>
            <p className="text-xs text-muted-foreground">Version 2.4.0 (Build 392)</p>
        </section>
      </main>
    </div>
  );
}
