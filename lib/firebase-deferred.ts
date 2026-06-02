let firestore: any = null;
let initializing = false;

export async function db() {
  if (typeof window === 'undefined') {
    return null; // Only works on client side
  }

  if (firestore) {
    return firestore;
  }

  // Prevent multiple concurrent initialization attempts
  if (initializing) {
    let attempts = 0;
    while (!firestore && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    return firestore;
  }

  initializing = true;

  try {
    const { getFirestore } = await import('firebase/firestore');
    const { getFirebaseApp } = await import('@/lib/firebase');

    const app = getFirebaseApp();
    if (!app) {
      initializing = false;
      return null;
    }

    firestore = getFirestore(app);
    initializing = false;
    return firestore;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    initializing = false;
    return null;
  }
}
