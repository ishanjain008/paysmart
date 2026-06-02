import { getAdminDb } from '@/lib/firebase-admin';
import { OFFERS } from '@/data/offers';

export async function GET() {
  const db = getAdminDb();
  if (db) {
    try {
      const snap = await db.collection('config').doc('offers').get();
      if (snap.exists) {
        const data = snap.data();
        if (data?.offers?.length) {
          return Response.json({ offers: data.offers, updatedAt: data.updatedAt, source: 'firestore' });
        }
      }
    } catch {}
  }

  // Fall back to static offers from data/offers.ts
  return Response.json({ offers: OFFERS, updatedAt: null, source: 'static' });
}
