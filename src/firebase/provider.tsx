'use client';

import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { initializeFirebase } from '.';

type MaybeFirebase = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<MaybeFirebase>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export type FirebaseProps = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export function FirebaseProvider({ children }: PropsWithChildren) {
  const [firebase, setFirebase] = useState<FirebaseProps | null>(null);

  useEffect(() => {
    const apps = initializeFirebase();
    setFirebase(apps);
  }, []);

  if (!firebase) {
    // TODO: Add a loading spinner.
    return null;
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const firebase = useContext(FirebaseContext);

  if (!firebase) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return firebase;
}

export function useFirebaseApp() {
  const { firebaseApp } = useFirebase();

  if (!firebaseApp) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider.');
  }

  return firebaseApp;
}

export function useAuth() {
  const { auth } = useFirebase();

  if (!auth) {
    throw new Error('useAuth must be used within a FirebaseProvider.');
  }

  return auth;
}

export function useFirestore() {
  const { firestore } = useFirebase();

  if (!firestore) {
    throw new Error('useFirestore must be used within a FirebaseProvider.');
  }

  return firestore;
}
