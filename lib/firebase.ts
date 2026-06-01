import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

const cfg = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Returns null when no API key is configured (e.g. during build or before .env.local is filled in)
export function getFirebaseApp(): FirebaseApp | null {
  if (!cfg.apiKey) return null;
  return getApps().length ? getApps()[0] : initializeApp(cfg);
}
