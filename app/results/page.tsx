'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Smartphone, ChevronRight, Clock } from 'lucide-react';
import { BottomNav, TopNav } from '@/components/Nav';
import { fetchPrices } from '@/lib/fetchPrices';
import { PlatformPrice } from '@/lib/calculator';
import { PLATFORMS, Platform } from '@/data/offers';
import { useSearchHistory } from '@/lib/useSearchHistory';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get('q') ?? '';
  const [prices, setPrices] = useState<PlatformPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useSearchHistory();

  useEffect(() => {
    if (!query) return;
    push(query);
    setLoading(true);
    fetchPrices(query).then((p) => {
      setPrices(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const available = prices.filter((p) => p.available);
  const lowestPrice = available.length ? Math.min(...available.map((p) => p.price)) : 0;

  const platformOrder: Platform[] = ['amazon', 'flipkart', 'croma', 'reliance_digital', 'tata_cliq'];

  const goToRecommendation = () => {
    sessionStorage.setItem('paysmart_prices', JSON.stringify(prices));
    router.push(`/recommendation?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <TopNav back="/" />
      <main className="flex-1 pb-24">
        {/* Query bar */}
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
          <div className="flex-1 text-sm text-gray-600">
            Results for <span className="font-medium text-gray-900">{query}</span>
          </div>
          <button onClick={() => router.push('/')} className="text-blue-600 text-xs">Change</button>
        </div>

        {/* Product card */}
        <div className="mx-4 mt-4 flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-white">
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={24} className="text-gray-300" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-0.5">{query}</div>
            <div className="text-xs text-gray-400">Tap below to see best deal with your cards</div>
          </div>
        </div>

        {/* Platform prices */}
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Prices across platforms</div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock size={10} />
              {loading ? 'Loading...' : 'Just now'}
            </div>
          </div>

          <div className="space-y-2">
            {platformOrder.map((platform) => {
              const p = prices.find((x) => x.platform === platform);
              const info = PLATFORMS[platform];
              const isLowest = p?.available && p.price === lowestPrice && lowestPrice > 0;

              return (
                <div
                  key={platform}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isLowest ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{info.name}</div>
                    {isLowest && <div className="text-[10px] text-green-600 font-medium">Lowest listed price</div>}
                  </div>
                  {loading || !p ? (
                    <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
                  ) : p.available ? (
                    <div className={`text-sm font-semibold ${isLowest ? 'text-green-700' : 'text-gray-800'}`}>
                      {fmt(p.price)}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-300 italic">Not available</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-300 mt-3">
          Prices shown before card benefits
        </div>

        {/* CTA */}
        {!loading && available.length > 0 && (
          <div className="px-4 mt-6">
            <button
              onClick={goToRecommendation}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              See best deal with my cards
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {!loading && available.length === 0 && (
          <div className="px-4 mt-8 text-center text-sm text-gray-400">
            No prices found for &ldquo;{query}&rdquo;. Try a different product name.
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
