'use client';

import { useUser, useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Crown } from 'lucide-react';
import { Label } from '@/components/ui/label';

const availableRoles = [
  { value: 'abonne', label: 'Abonné' },
  { value: 'createur', label: 'Créateur' },
  { value: 'moderateur', label: 'Modérateur' },
  { value: 'agence', label: 'Agence' },
];

export default function CompleteProfilePage() {
  const { user, loading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // If user document already exists, redirect them away
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          router.push('/');
        }
      });
    }
    // If user is not logged in, send them to login page
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, firestore]);

  const handleSubmit = async () => {
    if (!user || !selectedRole) {
      // Maybe show a toast or an error message
      return;
    }
    setIsSubmitting(true);
    const userDocRef = doc(firestore, 'users', user.uid);

    try {
      await setDoc(userDocRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: selectedRole,
      });
      router.push('/');
    } catch (error) {
      console.error('Error creating user profile:', error);
      setIsSubmitting(false);
      // Handle error, maybe show a toast
    }
  };
  
  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex items-center gap-2 mb-8">
        <Crown className="h-10 w-10 text-primary" />
        <span className="font-headline text-4xl font-bold tracking-tight text-primary whitespace-nowrap">
          Golden Enclave
        </span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Finaliser votre profil</CardTitle>
          <CardDescription>
            Choisissez votre rôle pour commencer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-select">Quel est votre rôle ?</Label>
            <Select onValueChange={setSelectedRole} value={selectedRole}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
          >
            {isSubmitting ? 'Sauvegarde...' : 'Terminer'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
