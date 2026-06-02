'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { fetchPrices } from '@/lib/fetchPrices';
import { PlatformPrice } from '@/lib/calculator';
import { PLATFORMS, Platform } from '@/data/offers';
import { useSearchHistory } from '@/lib/useSearchHistory';

const playfair = Playfair_Display({ subsets: ['latin'] });

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

const PLATFORM_ORDER: Platform[] = ['amazon', 'flipkart', 'croma', 'vijay_sales', 'reliance_digital'];

function buyUrl(platform: string, query: string) {
  const domain =
    platform === 'reliance_digital' ? 'reliancedigital.in' :
    platform === 'vijay_sales' ? 'vijaysales.com' :
    `${platform}.in`;
  return `https://www.${domain}/s?k=${encodeURIComponent(query)}`;
}

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get('q') ?? '';
  const [prices, setPrices] = useState<PlatformPrice[]>([]);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { push } = useSearchHistory();

  useEffect(() => {
    if (!query) return;
    push(query);
    setLoading(true);
    fetchPrices(query)
      .then(({ prices: p, productImage: img }) => {
        setPrices(p);
        setProductImage(img);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const available = prices.filter((p) => p.available);
  const lowestPrice = available.length ? Math.min(...available.map((p) => p.price)) : 0;

  const goToRecommendation = () => {
    sessionStorage.setItem('paysmart_prices', JSON.stringify(prices));
    sessionStorage.setItem('paysmart_product_image', productImage ?? '');
    router.push(`/recommendation?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="New search" />

      <main className="flex-1 px-8 md:px-14 py-12">
        {/* Product header */}
        <div className="flex items-center gap-6 mb-2">
          {productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/image?url=${encodeURIComponent(productImage)}`}
              alt={query}
              className="w-20 h-20 object-contain rounded-2xl bg-gray-50 border border-gray-100 flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : loading ? (
            <div className="w-20 h-20 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
          ) : null}
          <div>
            <div className="flex items-baseline gap-4">
              <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold text-gray-900`}>
                {query}
              </h1>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={12} /> Change
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? 'Fetching live prices…' : `${available.length} stores · prices before your card benefits`}
            </p>
          </div>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 mt-10">
          {PLATFORM_ORDER.map((platform) => {
            const p = prices.find((x) => x.platform === platform);
            const info = PLATFORMS[platform];
            const isLowest = p?.available && p.price === lowestPrice && lowestPrice > 0;

            return (
              <a
                key={platform}
                href={p?.available ? buyUrl(platform, query) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all cursor-pointer ${
                  isLowest
                    ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-200 hover:bg-blue-100'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                } ${!p?.available ? 'pointer-events-none opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {info.name}
                  </span>
                </div>

                {loading ? (
                  <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                ) : p?.available ? (
                  <>
                    <div className={`text-2xl font-bold ${isLowest ? 'text-blue-700' : 'text-gray-900'}`}>
                      {fmt(p.price)}
                    </div>
                    {isLowest && (
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 rounded-full px-2.5 py-0.5 self-start">
                        Lowest
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-300 italic mt-1">Not listed</div>
                )}
              </a>
            );
          })}
        </div>

        <p className="text-xs text-gray-300 mb-8">Prices above are listed prices — before any card offers or cashback.</p>

        {!loading && available.length > 0 && (
          <button
            onClick={goToRecommendation}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-colors"
          >
            See best deal with my cards
            <ArrowRight size={18} />
          </button>
        )}

        {!loading && available.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-400 mb-4">No prices found for &ldquo;{query}&rdquo;.</p>
            <button onClick={() => router.push('/')} className="text-blue-600 text-sm font-medium hover:underline">
              Try a different search →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div />}>
      <ResultsContent />
    </Suspense>
  );
}
