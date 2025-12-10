'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  type Query,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

export const useCollection = <T extends DocumentData>(
  q: Query<T> | null
) => {
  const [data, setData] = useState<QuerySnapshot<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching collection:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
};
