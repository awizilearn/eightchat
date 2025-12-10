'use client';

import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { PropsWithChildren, useEffect, useState } from 'react';

import { initializeFirebase } from '.';
import { FirebaseProvider, type FirebaseProps } from './provider';

export function FirebaseClientProvider({ children }: PropsWithChildren) {
  const [firebase, setFirebase] = useState<FirebaseProps | null>(null);

  useEffect(() => {
    const apps = initializeFirebase();
    setFirebase(apps);
  }, []);

  if (!firebase) {
    // TODO: Add a loading spinner
    return null;
  }

  return <FirebaseProvider {...firebase}>{children}</FirebaseProvider>;
}
