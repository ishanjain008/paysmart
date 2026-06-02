import admin from 'firebase-admin';

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0]!;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;

  try {
    const serviceAccount = JSON.parse(raw);
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch {
    return null;
  }
}

export function getAdminDb() {
  const app = getAdminApp();
  return app ? admin.firestore(app) : null;
}
