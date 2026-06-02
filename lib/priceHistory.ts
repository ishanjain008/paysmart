import { db } from '@/lib/firebase-deferred';

export interface PriceSnapshot {
  productTitle: string;
  timestamp: number;
  prices: Record<string, number>; // platform -> price
  averagePrice: number;
}

export async function recordPriceSnapshot(
  productTitle: string,
  prices: Record<string, number>
): Promise<void> {
  try {
    const database = await db();
    if (!database) {
      console.warn('Firestore not initialized for price snapshot');
      return;
    }

    const pricesArray = Object.values(prices).filter(p => p > 0);
    const averagePrice = pricesArray.length > 0
      ? Math.round(pricesArray.reduce((a, b) => a + b, 0) / pricesArray.length)
      : 0;

    const docRef = database
      .collection('prices_history')
      .doc(productTitle.toLowerCase().replace(/\s+/g, '_'))
      .collection('snapshots')
      .doc();

    await docRef.set({
      timestamp: Date.now(),
      prices,
      averagePrice,
    });
  } catch (error) {
    console.error('Error recording price snapshot:', error);
  }
}

export async function getPriceHistory(productTitle: string): Promise<PriceSnapshot[]> {
  try {
    const database = await db();
    if (!database) return [];

    const snapshot = await database
      .collection('prices_history')
      .doc(productTitle.toLowerCase().replace(/\s+/g, '_'))
      .collection('snapshots')
      .orderBy('timestamp', 'desc')
      .limit(90)
      .get();

    return snapshot.docs.map((doc: any) => ({
      productTitle,
      timestamp: doc.data().timestamp,
      prices: doc.data().prices,
      averagePrice: doc.data().averagePrice,
    }));
  } catch (error) {
    console.error('Error fetching price history:', error);
    return [];
  }
}

export async function getPriceStats(productTitle: string): Promise<{
  current: number;
  average: number;
  lowest: number;
  highest: number;
  trend: 'up' | 'down' | 'stable';
}> {
  try {
    const history = await getPriceHistory(productTitle);

    if (history.length === 0) {
      return { current: 0, average: 0, lowest: 0, highest: 0, trend: 'stable' };
    }

    const allPrices = history.flatMap(h => Object.values(h.prices)).filter(p => p > 0);
    const current = allPrices[0] || 0;
    const lowest = Math.min(...allPrices);
    const highest = Math.max(...allPrices);
    const average = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length);

    // Simple trend: compare last week average to overall average
    const lastWeekSnapshots = history.filter(
      h => Date.now() - h.timestamp < 7 * 24 * 60 * 60 * 1000
    );
    const lastWeekAverage =
      lastWeekSnapshots.length > 0
        ? Math.round(
            lastWeekSnapshots.reduce((sum, h) => sum + h.averagePrice, 0) /
              lastWeekSnapshots.length
          )
        : average;

    const trend: 'up' | 'down' | 'stable' =
      lastWeekAverage > average * 1.02 ? 'down' : lastWeekAverage < average * 0.98 ? 'up' : 'stable';

    return { current, average, lowest, highest, trend };
  } catch (error) {
    console.error('Error getting price stats:', error);
    return { current: 0, average: 0, lowest: 0, highest: 0, trend: 'stable' };
  }
}
