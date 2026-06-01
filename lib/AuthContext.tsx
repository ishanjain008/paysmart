'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

interface AuthCtxValue {
  user: User | null;
  authLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthCtxValue>({
  user: null,
  authLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // All Firebase imports are deferred here so they never run on the server.
    let unsubscribe: (() => void) | null = null;

    async function setup() {
      const { getFirebaseApp } = await import('./firebase');
      const app = getFirebaseApp();
      if (!app) { setAuthLoading(false); return; }

      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const auth = getAuth(app);
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthLoading(false);
      });
    }

    setup();
    return () => { unsubscribe?.(); };
  }, []);

  const signIn = async () => {
    const { getFirebaseApp } = await import('./firebase');
    const app = getFirebaseApp();
    if (!app) return;
    const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    await signInWithPopup(getAuth(app), new GoogleAuthProvider());
  };

  const signOut = async () => {
    const { getFirebaseApp } = await import('./firebase');
    const app = getFirebaseApp();
    if (!app) return;
    const { getAuth, signOut: fbSignOut } = await import('firebase/auth');
    await fbSignOut(getAuth(app));
  };

  return (
    <AuthCtx.Provider value={{ user, authLoading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
