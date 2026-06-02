import { db } from '@/lib/firebase-deferred';

export interface WatchlistItem {
  id: string;
  productTitle: string;
  productImage?: string;
  currentPrice: number;
  targetPrice?: number;
  platforms: string[];
  addedAt: number;
  notifyOnPriceDrop: boolean;
  notifyOnBetterDeal: boolean;
}

export async function addToWatchlist(
  userId: string,
  item: Omit<WatchlistItem, 'id' | 'addedAt'>
): Promise<string> {
  try {
    const database = await db();
    if (!database) throw new Error('Firebase not initialized');

    const ref = database.collection('users').doc(userId).collection('watchlist').doc();
    await ref.set({
      ...item,
      addedAt: Date.now(),
    });
    return ref.id;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
}

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  try {
    const database = await db();
    if (!database) return [];

    const snapshot = await database
      .collection('users')
      .doc(userId)
      .collection('watchlist')
      .orderBy('addedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as WatchlistItem));
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
}

export async function removeFromWatchlist(userId: string, itemId: string): Promise<void> {
  try {
    const database = await db();
    if (!database) throw new Error('Firebase not initialized');

    await database
      .collection('users')
      .doc(userId)
      .collection('watchlist')
      .doc(itemId)
      .delete();
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
}

export async function updateWatchlistItem(
  userId: string,
  itemId: string,
  updates: Partial<WatchlistItem>
): Promise<void> {
  try {
    const database = await db();
    if (!database) throw new Error('Firebase not initialized');

    await database
      .collection('users')
      .doc(userId)
      .collection('watchlist')
      .doc(itemId)
      .update(updates);
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    throw error;
  }
}
