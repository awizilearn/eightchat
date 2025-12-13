'use client';

import { useState, useEffect, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile, SubscriptionTier } from '@/lib/chat-data';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, PlusCircle } from 'lucide-react';

type TiersState = {
  Bronze: SubscriptionTier;
  Silver: SubscriptionTier;
  Gold: SubscriptionTier;
};

type TierAction =
  | { type: 'SET_TIERS'; payload: SubscriptionTier[] }
  | { type: 'UPDATE_PRICE'; tier: keyof TiersState; price: number }
  | { type: 'UPDATE_PERK'; tier: keyof TiersState; perkIndex: number; value: string }
  | { type: 'ADD_PERK'; tier: keyof TiersState }
  | { type: 'REMOVE_PERK'; tier: keyof TiersState; perkIndex: number };

const defaultTiers: TiersState = {
    Bronze: { name: "Bronze", price: 5, perks: ["Accès anticipé", "Contenu en coulisses"], cta: "S'abonner" },
    Silver: { name: "Silver", price: 15, perks: ["Avantages Bronze", "Tutoriels exclusifs"], cta: "S'abonner" },
    Gold: { name: "Gold", price: 30, perks: ["Avantages Silver", "Consultations personnelles"], cta: "S'abonner" },
};

function tiersReducer(state: TiersState, action: TierAction): TiersState {
  switch (action.type) {
    case 'SET_TIERS':
      const newTiersState = { ...defaultTiers };
      action.payload.forEach(tier => {
        if (tier.name in newTiersState) {
          newTiersState[tier.name as keyof TiersState] = tier;
        }
      });
      return newTiersState;
    case 'UPDATE_PRICE':
      return { ...state, [action.tier]: { ...state[action.tier], price: action.price } };
    case 'UPDATE_PERK':
      const newPerks = [...state[action.tier].perks];
      newPerks[action.perkIndex] = action.value;
      return { ...state, [action.tier]: { ...state[action.tier], perks: newPerks } };
    case 'ADD_PERK':
        const addedPerks = [...state[action.tier].perks, 'Nouvel avantage'];
        return { ...state, [action.tier]: { ...state[action.tier], perks: addedPerks } };
    case 'REMOVE_PERK':
        const removedPerks = state[action.tier].perks.filter((_, i) => i !== action.perkIndex);
        return { ...state, [action.tier]: { ...state[action.tier], perks: removedPerks } };
    default:
      return state;
  }
}

function TierEditCard({ tierName, tierData, dispatch }: { tierName: keyof TiersState, tierData: SubscriptionTier, dispatch: React.Dispatch<TierAction>}) {
    return (
        <Card className={tierName === 'Gold' ? 'border-primary' : ''}>
            <CardHeader>
                <CardTitle className={tierName === 'Gold' ? 'text-primary' : ''}>{tierName}</CardTitle>
                <CardDescription>Configurez le prix et les avantages pour le niveau {tierName}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Prix (USD)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                            type="number"
                            value={tierData.price}
                            onChange={(e) => dispatch({ type: 'UPDATE_PRICE', tier: tierName, price: parseFloat(e.target.value) || 0 })}
                            className="pl-7 h-12"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Avantages</label>
                    <div className="space-y-2">
                        {tierData.perks.map((perk, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={perk}
                                    onChange={(e) => dispatch({ type: 'UPDATE_PERK', tier: tierName, perkIndex: index, value: e.target.value })}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => dispatch({ type: 'REMOVE_PERK', tier: tierName, perkIndex: index })}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                     <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => dispatch({ type: 'ADD_PERK', tier: tierName })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un avantage
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function TiersSkeleton() {
    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-7 w-24" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export default function EditTiersPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [state, dispatch] = useReducer(tiersReducer, defaultTiers);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfileDoc, loading: profileLoading } = useDoc(userProfileRef);
  const userProfile = userProfileDoc?.data() as UserProfile | undefined;

  useEffect(() => {
    if (userProfile?.tiers) {
      dispatch({ type: 'SET_TIERS', payload: userProfile.tiers });
    }
  }, [userProfile]);

  const handleSaveChanges = async () => {
    if (!userProfileRef) return;
    setIsSaving(true);
    const updatedTiers = Object.values(state);
     try {
        await updateDoc(userProfileRef, {
            tiers: updatedTiers
        });
        toast({ title: "Niveaux mis à jour", description: "Vos niveaux d'abonnement ont été sauvegardés." });
    } catch (error) {
        console.error("Error updating tiers: ", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour les niveaux." });
    } finally {
        setIsSaving(false);
    }
  };
  
  const loading = userLoading || profileLoading;
  
  if (loading) {
    return <TiersSkeleton />;
  }

  return (
    <main className="p-4 space-y-6 max-w-4xl mx-auto pb-24">
      <TierEditCard tierName="Bronze" tierData={state.Bronze} dispatch={dispatch} />
      <TierEditCard tierName="Silver" tierData={state.Silver} dispatch={dispatch} />
      <TierEditCard tierName="Gold" tierData={state.Gold} dispatch={dispatch} />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
         <div className="max-w-4xl mx-auto">
            <Button size="lg" className="w-full h-12" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
         </div>
      </div>
    </main>
  );
}
