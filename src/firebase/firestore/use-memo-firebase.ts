'use client';

import { useMemo, useRef, type DependencyList } from 'react';
import {
  Query,
  DocumentReference,
  queryEqual,
  refEqual,
} from 'firebase/firestore';

type FirebaseRef = Query | DocumentReference;

type MemoFirebase<T> = T & {__memo?: boolean};

// This is a custom hook that memoizes a Firestore query or document reference.
// It's important to prevent re-renders when the query or reference hasn't changed.
export function useMemoFirebase<T extends FirebaseRef | null>(
  factory: () => T,
  deps: DependencyList | undefined
): T {
  const ref = useRef<T | null>(null);

  const newRef = useMemo(factory, deps);

  if (newRef) {
    if (ref.current) {
        // Both are queries
        if ('_query' in newRef && '_query' in ref.current) {
            if (queryEqual(newRef as Query, ref.current as Query)) {
                return ref.current as T;
            }
        } 
        // Both are document references
        else if (newRef instanceof DocumentReference && ref.current instanceof DocumentReference) {
            if (refEqual(newRef, ref.current)) {
                return ref.current as T;
            }
        }
    }
  } else if (ref.current === null) {
      // If newRef is null and the current ref is also null, no change.
      return ref.current as T;
  }


  ref.current = newRef;
  const memoized = newRef as MemoFirebase<T>;
  if (memoized) {
    memoized.__memo = true;
  }
  return newRef;
}
