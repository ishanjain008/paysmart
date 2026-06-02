'use client';
import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';

interface WatchButtonProps {
  productTitle: string;
  productImage?: string;
  currentPrice: number;
  platforms: string[];
  isWatched?: boolean;
  watchlistId?: string;
  onWatchChange?: (watched: boolean) => void;
}

export function WatchButton({
  productTitle,
  productImage,
  currentPrice,
  platforms,
  isWatched = false,
  watchlistId,
  onWatchChange,
}: WatchButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [watched, setWatched] = useState(isWatched);
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());

  const handleWatch = async () => {
    if (!user?.uid) {
      alert('Please sign in to watch products');
      return;
    }

    setLoading(true);
    try {
      await addToWatchlist(user.uid, {
        productTitle,
        productImage,
        currentPrice,
        targetPrice: parseInt(targetPrice),
        platforms,
        notifyOnPriceDrop: true,
        notifyOnBetterDeal: true,
      });
      setWatched(true);
      setShowModal(false);
      onWatchChange?.(true);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add to watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleUnwatch = async () => {
    if (!user?.uid || !watchlistId) return;

    setLoading(true);
    try {
      await removeFromWatchlist(user.uid, watchlistId);
      setWatched(false);
      onWatchChange?.(false);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      alert('Failed to remove from watchlist');
    } finally {
      setLoading(false);
    }
  };

  if (watched && watchlistId) {
    return (
      <button
        onClick={handleUnwatch}
        disabled={loading}
        className="flex items-center gap-2 text-red-500 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} fill="currentColor" />}
        {loading ? 'Removing…' : 'Watching'}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} />}
        Watch price
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Watch this product</h3>
            <p className="text-sm text-gray-500 mb-6">{productTitle}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Current price</label>
                <p className="text-2xl font-bold text-gray-900">₹{currentPrice.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Alert me when price drops below</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-600">₹</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={e => setTargetPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 You'll also get alerts when your added cards have better cashback or offers
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWatch}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg transition-colors"
              >
                {loading ? 'Saving…' : 'Watch price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
