'use client';
import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { getPriceStats } from '@/lib/priceHistory';

interface PriceIndicatorProps {
  productTitle: string;
  currentPrice: number;
}

export function PriceIndicator({ productTitle, currentPrice }: PriceIndicatorProps) {
  const [stats, setStats] = useState<{
    average: number;
    lowest: number;
    highest: number;
    trend: 'up' | 'down' | 'stable';
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPriceStats(productTitle);
        if (data.average > 0) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching price stats:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [productTitle]);

  if (loading || !stats || stats.average === 0) {
    return null; // No historical data yet
  }

  const savingVsAvg = stats.average - currentPrice;
  const savingPercent = Math.round((savingVsAvg / stats.average) * 100);
  const isGoodDeal = savingVsAvg > 0;
  const isLowest = currentPrice === stats.lowest;

  return (
    <div className="mt-4 space-y-2 text-xs">
      {isLowest && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100">
          ✓ Lowest price in 90 days: {savingPercent > 0 && `Save ₹${Math.round(savingVsAvg)}`}
        </div>
      )}

      {isGoodDeal && !isLowest && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100 flex items-center gap-2">
          <TrendingDown size={14} />
          Below 90-day average by ₹{Math.round(savingVsAvg)} ({savingPercent}%)
        </div>
      )}

      {!isGoodDeal && (
        <div className="bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-100 flex items-center gap-2">
          <TrendingUp size={14} />
          Above 90-day average (usually ₹{stats.average.toLocaleString('en-IN')})
        </div>
      )}

      <p className="text-gray-500 text-[11px]">
        Range: ₹{stats.lowest.toLocaleString('en-IN')} – ₹{stats.highest.toLocaleString('en-IN')}
      </p>
    </div>
  );
}
