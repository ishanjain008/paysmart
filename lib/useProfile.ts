'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'paysmart_profile';

export interface UserProfile {
  cardIds: string[];
  setupComplete: boolean;
  lastUpdated: string;
}

const DEFAULT_PROFILE: UserProfile = { cardIds: [], setupComplete: false, lastUpdated: '' };

function fromLocal(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch { return DEFAULT_PROFILE; }
}

function toLocal(p: UserProfile) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

// Lazy Firestore helpers — only import firebase/firestore inside async functions
// so the module is never evaluated during SSR.
async function remoteGet(uid: string): Promise<UserProfile | null> {
  const { getFirebaseApp } = await import('./firebase');
  const app = getFirebaseApp();
  if (!app) return null;
  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(getFirestore(app), 'users', uid, 'data', 'profile'));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

async function remoteSet(uid: string, profile: UserProfile): Promise<void> {
  const { getFirebaseApp } = await import('./firebase');
  const app = getFirebaseApp();
  if (!app) return;
  const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(getFirestore(app), 'users', uid, 'data', 'profile'), profile);
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);

    async function load() {
      if (user) {
        try {
          const remote = await remoteGet(user.uid);
          if (remote) {
            setProfile(remote);
            toLocal(remote);
          } else {
            // First sign-in: push local data to Firestore
            const local = fromLocal();
            const withTs = { ...local, lastUpdated: new Date().toISOString() };
            setProfile(withTs);
            await remoteSet(user.uid, withTs);
          }
        } catch {
          setProfile(fromLocal());
        }
      } else {
        setProfile(fromLocal());
      }
      setLoaded(true);
    }

    load();
  }, [user]);

  const saveProfile = async (updated: UserProfile) => {
    const toSave = { ...updated, lastUpdated: new Date().toISOString() };
    setProfile(toSave);
    toLocal(toSave);
    if (user) {
      remoteSet(user.uid, toSave).catch(() => {});
    }
  };

  const toggleCard = (cardId: string) => {
    const updated = profile.cardIds.includes(cardId)
      ? { ...profile, cardIds: profile.cardIds.filter((id) => id !== cardId) }
      : { ...profile, cardIds: [...profile.cardIds, cardId] };
    saveProfile(updated);
  };

  const completeSetup = () => saveProfile({ ...profile, setupComplete: true });

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE);
    if (user) {
      remoteSet(user.uid, DEFAULT_PROFILE).catch(() => {});
    }
  };

  return { profile, loaded, toggleCard, completeSetup, clearProfile, saveProfile };
}
