let firestore: any = null;

export async function db() {
  if (typeof window === 'undefined') {
    return null; // Only works on client side
  }

  if (firestore) {
    return firestore;
  }

  try {
    const { getFirestore } = await import('firebase/firestore');
    const { getFirebaseApp } = await import('@/lib/firebase');

    const app = getFirebaseApp();
    if (!app) return null;

    firestore = getFirestore(app);
    return firestore;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    return null;
  }
}
