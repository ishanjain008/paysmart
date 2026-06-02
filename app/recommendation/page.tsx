'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Trophy, ExternalLink, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { computeRecommendations, daysUntilExpiry, Recommendation } from '@/lib/calculator';
import { PlatformPrice } from '@/lib/calculator';
import { PLATFORMS } from '@/data/offers';
import { CARDS } from '@/data/cards';
import { useProfile } from '@/lib/useProfile';

const playfair = Playfair_Display({ subsets: ['latin'] });

function fmt(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function cardName(id: string) {
  const c = CARDS.find((c) => c.id === id);
  return c ? `${c.bank} ${c.name}` : id;
}

function buyUrl(platform: string, query: string) {
  const domain =
    platform === 'reliance_digital' ? 'reliancedigital.in' :
    platform === 'vijay_sales' ? 'vijaysales.com' :
    `${platform}.in`;
  return `https://www.${domain}/s?k=${encodeURIComponent(query)}`;
}

function RecoContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get('q') ?? '';
  const { profile, loaded } = useProfile();
  const [recos, setRecos] = useState<Recommendation[]>([]);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const raw = sessionStorage.getItem('paysmart_prices');
    if (!raw) { setNoData(true); return; }

    async function compute() {
      try {
        const prices: PlatformPrice[] = JSON.parse(raw!);
        const cardIds = profile.cardIds.length > 0
          ? profile.cardIds
          : CARDS.filter((c) => c.type === 'credit').slice(0, 4).map((c) => c.id);

        // Fetch live offers (falls back to static if Firestore not set up)
        let liveOffers;
        try {
          const res = await fetch('/api/offers');
          const data = await res.json();
          liveOffers = data.offers;
        } catch {}

        setRecos(computeRecommendations(prices, cardIds, liveOffers));
      } catch { setNoData(true); }
    }

    compute();
  }, [loaded, profile.cardIds]);

  const best = recos[0];
  const rest = recos.slice(1);

  if (noData) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <DesktopNav back={`/results?q=${encodeURIComponent(query)}`} backLabel="Back to results" />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500">Price data expired. Go back and search again.</p>
          <Link href={`/results?q=${encodeURIComponent(query)}`} className="text-blue-600 font-medium hover:underline">
            ← Back to results
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back={`/results?q=${encodeURIComponent(query)}`} backLabel="Back to results" />

      <main className="flex-1 px-8 md:px-14 py-12">
        {/* Heading */}
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Best deal found</p>
        <h1 className={`${playfair.className} text-3xl md:text-4xl font-bold text-gray-900 mb-10`}>
          {query}
        </h1>

        {!best ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 mb-3">No cards set up yet.</p>
            <Link href="/setup" className="text-blue-600 font-medium hover:underline">Set up your cards →</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left: hero card ── */}
            <div className="w-full lg:w-[480px] flex-shrink-0 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Card header */}
              <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                <Trophy size={16} className="text-yellow-400" />
                <div>
                  <div className="text-sm font-semibold text-white">Lowest effective price</div>
                  <div className="text-xs text-gray-400">
                    Based on {profile.cardIds.length || 'top'} cards · {PLATFORMS[best.platform].name}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Platform + card */}
                <div className="flex items-center gap-2 mb-6">
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: PLATFORMS[best.platform].color + '18', color: PLATFORMS[best.platform].color }}
                  >
                    {PLATFORMS[best.platform].name}
                  </span>
                  <span className="text-xs text-gray-400">{cardName(best.cardId)}</span>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 mb-4">
                  {best.breakdown.map((line, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-sm ${line.type === 'price' ? 'text-gray-500' : line.amount < 0 ? 'text-gray-500' : 'text-orange-500'}`}>
                        {line.label}
                        {line.offerValidTo && (
                          <span className="ml-1.5 text-[10px] text-gray-400">exp. {line.offerValidTo}</span>
                        )}
                      </span>
                      <span className={`text-sm font-semibold ${
                        line.type === 'price' ? 'text-gray-800' :
                        line.amount < 0 ? 'text-green-600' : 'text-orange-500'
                      }`}>
                        {line.amount < 0 ? `−${fmt(Math.abs(line.amount))}` : fmt(line.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between mb-6">
                  <span className="font-semibold text-gray-900">Effective price</span>
                  <span className={`${playfair.className} text-3xl font-bold text-blue-700`}>
                    {fmt(best.effectivePrice)}
                  </span>
                </div>

                {/* Expiry */}
                {best.appliedOffer && daysUntilExpiry(best.appliedOffer.validTo) <= 7 && (
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs rounded-xl px-4 py-2.5 mb-4">
                    <AlertCircle size={13} />
                    Offer expires in {daysUntilExpiry(best.appliedOffer.validTo)} days — buy soon
                  </div>
                )}

                <a
                  href={buyUrl(best.platform, query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
                  Buy on {PLATFORMS[best.platform].name}
                  <ExternalLink size={15} />
                </a>
                <p className="text-[11px] text-gray-400 text-center mt-3">
                  Verify offer at checkout · T&Cs apply
                </p>
              </div>
            </div>

            {/* ── Right: ranked list ── */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold tracking-[0.15em] text-gray-400 uppercase mb-4">
                All combinations · ranked by effective price
              </div>

              <div className="space-y-2">
                {[best, ...rest].map((r, i) => (
                  <div
                    key={`${r.platform}-${r.cardId}`}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                      i === 0 ? 'border-blue-100 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800">
                        {PLATFORMS[r.platform].name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {r.totalSaving > 0 ? cardName(r.cardId) : 'No active offer'}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold ${i === 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                        {fmt(r.effectivePrice)}
                      </div>
                      {r.totalSaving > 0 && (
                        <div className="text-[11px] text-green-600 font-medium">
                          save {fmt(r.totalSaving)}
                        </div>
                      )}
                    </div>
                    {i === 0 && (
                      <button
                        onClick={() => router.push(`/recommendation?q=${encodeURIComponent(query)}`)}
                        className="flex-shrink-0"
                        title="Best deal"
                      >
                        <Trophy size={14} className="text-blue-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
                <Info size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Reward points converted at standard redemption value.
                  Always verify bank offer is applied at checkout before confirming payment.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RecommendationPage() {
  return (
    <Suspense>
      <RecoContent />
    </Suspense>
  );
}
