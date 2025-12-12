'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/chat-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function ProfileSkeleton() {
    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-7 w-32" />
            </header>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}


export default function AdminProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfileDoc, loading: profileLoading } = useDoc(userProfileRef);
  const userProfile = userProfileDoc?.data() as UserProfile | undefined;

  useEffect(() => {
      if (userProfile) {
          setDisplayName(userProfile.displayName || '');
          setBio(userProfile.bio || '');
      }
  }, [userProfile]);

  const handleSaveChanges = async () => {
    if (!userProfileRef) return;
    setIsSaving(true);
    try {
        await updateDoc(userProfileRef, {
            displayName: displayName,
            bio: bio,
        });
        toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées." });
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le profil." });
    } finally {
        setIsSaving(false);
    }
  };
  
  const loading = userLoading || profileLoading;

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
          </Button>
          <h1 className="font-semibold text-lg">Edit Profile</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
         <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={userProfile?.photoURL} />
                        <AvatarFallback>{displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                    </Button>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="displayName" className="text-sm font-medium text-muted-foreground">Display Name</label>
                    <Input 
                        id="displayName" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-card border-border/50 h-12"
                    />
                </div>

                 <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</label>
                    <Input 
                        id="email" 
                        value={userProfile?.email || ''}
                        disabled
                        className="bg-card border-border/50 h-12"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium text-muted-foreground">Bio</label>
                    <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a little about yourself"
                        className="bg-card border-border/50 min-h-[100px]"
                    />
                </div>

                <Button 
                    size="lg" 
                    className="w-full h-12"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </CardContent>
         </Card>
      </main>
    </div>
  );
}
