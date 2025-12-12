
'use client';

import { SubscriptionTierCard } from "./subscription-tier-card";
import type { SubscriptionTier } from "@/lib/chat-data";

interface SubscriptionTiersProps {
    tiers: SubscriptionTier[];
    creatorName: string;
    creatorId: string;
    disabled?: boolean;
}

export function SubscriptionTiers({ tiers, creatorName, creatorId, disabled }: SubscriptionTiersProps) {
    return (
        <section id="subscription-tiers" className="px-4 py-8">
            <h2 className="text-2xl font-bold text-center mb-6">Choose Your Tier</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {tiers.map((tier, index) => (
                    <SubscriptionTierCard 
                        key={tier.name}
                        tier={tier}
                        creatorName={creatorName}
                        creatorId={creatorId}
                        disabled={disabled}
                    />
                ))}
            </div>
        </section>
    );
}

