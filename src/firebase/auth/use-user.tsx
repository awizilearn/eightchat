'use client';

import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth } from '../provider';
import Cookies from 'js-cookie';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Set or remove a cookie for middleware to check auth status
      if (user) {
        Cookies.set('firebaseAuth', 'true', { expires: 7, path: '/' });
      } else {
        Cookies.remove('firebaseAuth', { path: '/' });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
};
