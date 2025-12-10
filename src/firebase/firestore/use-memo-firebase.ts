'use client';

import { useMemo, type DependencyList } from 'react';
import {
  Query,
  DocumentReference,
  queryEqual,
  refEqual,
} from 'firebase/firestore';

type FirebaseRef = Query | DocumentReference;

let prevRef: FirebaseRef | null = null;

// This is a custom hook that memoizes a Firestore query or document reference.
// It's important to prevent re-renders when the query or reference hasn't changed.
export function useMemoFirebase<T extends FirebaseRef>(
  factory: () => T | null,
  deps: DependencyList | undefined
): T | null {
  const newRef = useMemo(factory, deps);

  // This is a bit of a hack to prevent re-renders when the query or reference
  // is the same as the previous render. Firestore objects are always different
  // instances, so we need to use the `queryEqual` and `refEqual` helpers.
  if (newRef) {
    if (prevRef) {
      if (newRef instanceof Query && prevRef instanceof Query) {
        if (queryEqual(newRef, prevRef)) {
          return prevRef as T;
        }
      } else if (newRef instanceof DocumentReference && prevRef instanceof DocumentReference) {
        if (refEqual(newRef, prevRef)) {
          return prevRef as T;
        }
      }
    }
  }

  prevRef = newRef;
  return newRef;
}
