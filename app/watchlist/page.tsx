'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, TrendingDown, Heart, Loader2 } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { useAuth } from '@/lib/AuthContext';
import { getWatchlist, removeFromWatchlist, WatchlistItem } from '@/lib/watchlist';

const playfair = Playfair_Display({ subsets: ['latin'] });

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function WatchlistContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      try {
        const watchlist = await getWatchlist(user.uid);
        setItems(watchlist);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const handleRemove = async (itemId: string) => {
    if (!user?.uid) return;

    setDeleting(itemId);
    try {
      await removeFromWatchlist(user.uid, itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setDeleting(null);
    }
  };

  const handleCompare = (productTitle: string) => {
    router.push(`/results?q=${encodeURIComponent(productTitle)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-4xl">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Your watchlist</p>
          <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold text-gray-900`}>
            Watched products
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {loading ? 'Loading…' : `${items.length} product${items.length !== 1 ? 's' : ''} being tracked`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20">
            <Loader2 size={18} className="animate-spin text-gray-400" />
            <span className="text-gray-400">Loading watchlist…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center border border-gray-100 rounded-2xl">
            <Heart size={32} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 mb-4">No products being watched yet</p>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Search for products to watch →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const savingVsPending = item.targetPrice ? item.currentPrice - item.targetPrice : 0;
              const savingPercent = item.targetPrice
                ? Math.round((savingVsPending / item.currentPrice) * 100)
                : 0;

              return (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {item.productImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/image?url=${encodeURIComponent(item.productImage)}`}
                        alt={item.productTitle}
                        className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.productTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{item.platforms.join(', ')}</span>
                        <span>·</span>
                        <span>{new Date(item.addedAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Current price</p>
                      <p className="text-lg font-bold text-gray-900">{fmt(item.currentPrice)}</p>
                      {item.targetPrice && item.targetPrice < item.currentPrice && (
                        <p className="text-xs text-green-600 mt-1 flex items-center justify-end gap-1">
                          <TrendingDown size={12} />
                          {fmt(savingVsPending)} below target
                        </p>
                      )}
                      {item.targetPrice && item.targetPrice >= item.currentPrice && (
                        <p className="text-xs text-gray-500 mt-1">Target: {fmt(item.targetPrice)}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCompare(item.productTitle)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Compare
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={deleting === item.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === item.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense fallback={<div />}>
      <WatchlistContent />
    </Suspense>
  );
}
