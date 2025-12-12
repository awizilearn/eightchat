
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Lock, Edit, Calendar, Check, Rocket, Bitcoin, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function BitcoinIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.6695 11.237C17.2635 10.7423 17.6183 10.0249 17.6183 9.243C17.6183 7.821 16.5923 6.666 15.3128 6.516V6.513C15.3128 6.003 15.1095 5.514 14.7503 5.157L14.7533 5.154C14.7533 5.154 14.7533 5.154 14.7533 5.154C13.8293 4.23 12.5123 4.23 11.5883 5.154L8.33783 8.4045C8.16233 8.226 7.97483 8.0595 7.77833 7.905L7.77533 7.908C7.77533 7.908 7.77533 7.908 7.77533 7.908C6.85133 7.005 5.53433 7.005 4.61033 7.908C3.68633 8.832 3.68633 10.149 4.61033 11.073L4.61333 11.076C4.61333 11.076 4.61333 11.076 4.61333 11.076L7.86383 14.3265C8.04233 14.502 8.22983 14.6685 8.42633 14.823L8.42933 14.82C8.42933 14.82 8.42933 14.82 8.42933 14.82C9.35333 15.744 10.6703 15.744 11.5943 14.82L14.8448 11.5695C15.0203 11.748 15.2078 11.9145 15.4043 12.069L15.4073 12.066C15.4073 12.066 15.4073 12.066 15.4073 12.066C16.3313 12.969 17.6483 12.969 18.5723 12.066C19.5113 11.127 19.4963 9.798 18.5723 8.874C17.6483 7.95 16.3313 7.95 15.4073 8.874L15.4043 8.877C15.1958 9.042 14.9978 9.219 14.8133 9.405L11.5943 12.624C11.1323 13.086 10.3943 13.086 9.93233 12.624C9.47033 12.162 9.47033 11.424 9.93233 10.962L13.1513 7.743C13.6133 7.281 14.3513 7.281 14.8133 7.743C15.2753 8.205 15.2753 8.943 14.8133 9.405L13.9103 10.308C13.6283 10.59 13.6283 11.052 13.9103 11.334C14.1923 11.616 14.6543 11.616 14.9363 11.334L15.8393 10.431C16.0373 10.233 16.2713 10.08 16.5173 9.984C16.6675 10.347 16.713 10.749 16.6695 11.237Z" />
        </svg>
    )
}

export default function NewPostPage() {
  const [caption, setCaption] = useState('');
  const [access, setAccess] = useState<'public' | 'subscribers' | 'pay-per-view'>('pay-per-view');
  const [includedTiers, setIncludedTiers] = useState<string[]>(['VIP Gold']);

  const toggleTier = (tier: string) => {
    setIncludedTiers(prev => 
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  return (
    <main className="p-4 space-y-6 pb-24">
      {/* Media Section */}
      <Card className="bg-card/50 border-0 shadow-none">
        <CardContent className="p-0">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdvbGR8ZW58MHx8fHwxNzY1MzM0NDE4fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Exclusive content media"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute top-3 right-3">
              <Button variant="secondary" size="sm" className="rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20">
                <Edit className="h-4 w-4 mr-2" />
                Edit Media
              </Button>
            </div>
            <div className="absolute bottom-3 left-3 text-white">
                <p className="font-semibold">Exclusive_Content_vFinal....</p>
                <p className="text-sm text-white/80">04:20 • 4K HDR</p>
            </div>
            <div className="absolute bottom-3 right-3">
              <Badge variant="outline" className="text-white border-white/50 bg-black/30">HD</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caption Section */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <Textarea
            placeholder="Write a caption... #exclusive #premium"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
            className="bg-transparent border-0 focus-visible:ring-0 text-base h-24 p-0"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">{caption.length}/2200</p>
            <Button variant="link" className="text-primary h-auto p-0">
                ADD TAGS
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Access & Monetization Section */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-primary" />
                Access & Monetization
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => setAccess('public')} variant={access === 'public' ? 'default' : 'secondary'} className="rounded-full">Public</Button>
                <Button onClick={() => setAccess('subscribers')} variant={access === 'subscribers' ? 'default' : 'secondary'} className="rounded-full">Subscribers</Button>
                <Button onClick={() => setAccess('pay-per-view')} variant={access === 'pay-per-view' ? 'default' : 'secondary'} className="rounded-full">Pay-Per-View</Button>
            </div>
            
            {access === 'pay-per-view' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">SET PRICE</label>
                         <div className="relative mt-1">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
                            <Input defaultValue="9.99" className="h-14 bg-background/50 text-lg font-bold pl-8 pr-20"/>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <BitcoinIcon className="h-6 w-6 text-orange-400" />
                                <CreditCard className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Platform fee (5%) applies. Payouts via Stripe or Coinbase.
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">INCLUDED IN TIERS</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {['VIP Gold', 'Silver', 'Bronze'].map(tier => (
                                <Button 
                                    key={tier}
                                    onClick={() => toggleTier(tier)}
                                    variant={includedTiers.includes(tier) ? 'default' : 'secondary'}
                                    className="rounded-lg h-12"
                                >
                                     {includedTiers.includes(tier) && <Check className="h-4 w-4 mr-2"/>}
                                     {tier}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      
      {/* Schedule Post Section */}
       <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-secondary-foreground" />
                 </div>
                 <div>
                    <p className="font-semibold">Schedule Post</p>
                    <p className="text-sm text-muted-foreground">Publish automatically later</p>
                 </div>
            </div>
            <Switch />
        </CardContent>
      </Card>
      
      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
         <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
            <Button variant="secondary" size="lg" className="h-12">Save Draft</Button>
            <Button size="lg" className="h-12">
                Publish Now 
                <Rocket className="h-4 w-4 ml-2"/>
            </Button>
         </div>
      </div>
    </main>
  );
}
