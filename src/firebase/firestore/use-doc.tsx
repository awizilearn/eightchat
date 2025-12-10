'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type DocumentReference,
  type DocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { useMemoFirebase } from './use-memo-firebase';

export const useDoc = <T extends DocumentData>(
  ref: DocumentReference<T> | null
) => {
  const [data, setData] = useState<DocumentSnapshot<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedRef = useMemoFirebase(() => ref, [ref]);

  useEffect(() => {
    if (!memoizedRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedRef,
      (snapshot) => {
        setData(snapshot);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching document:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedRef]);

  return { data, loading, error };
};
