'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trophy, ExternalLink, AlertCircle, CreditCard, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BottomNav, TopNav } from '@/components/Nav';
import { computeRecommendations, daysUntilExpiry, Recommendation } from '@/lib/calculator';
import { PlatformPrice } from '@/lib/calculator';
import { PLATFORMS } from '@/data/offers';
import { CARDS } from '@/data/cards';
import { useProfile } from '@/lib/useProfile';

function fmt(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function cardName(id: string) {
  const c = CARDS.find((c) => c.id === id);
  return c ? `${c.bank} ${c.name}` : id;
}

function RecoContent() {
  const params = useSearchParams();
  const query = params.get('q') ?? '';
  const { profile, loaded } = useProfile();
  const [recos, setRecos] = useState<Recommendation[]>([]);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const raw = sessionStorage.getItem('paysmart_prices');
    if (!raw) {
      setNoData(true);
      return;
    }
    try {
      const prices: PlatformPrice[] = JSON.parse(raw);
      const cardIds = profile.cardIds.length > 0
        ? profile.cardIds
        : CARDS.filter((c) => c.type === 'credit').slice(0, 4).map((c) => c.id);
      const results = computeRecommendations(prices, cardIds);
      setRecos(results);
    } catch {
      setNoData(true);
    }
  }, [loaded, profile.cardIds]);

  const best = recos[0];
  const rest = recos.slice(1);

  if (noData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
        <TopNav back={`/results?q=${encodeURIComponent(query)}`} />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <p className="text-sm text-gray-500">Price data expired. Go back and search again.</p>
          <Link href={`/results?q=${encodeURIComponent(query)}`}
            className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
            <ArrowLeft size={14} /> Back to results
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <TopNav back={`/results?q=${encodeURIComponent(query)}`} />

      <main className="flex-1 pb-24">
        <div className="px-4 py-2 text-xs text-gray-400 flex items-center gap-1.5">
          <CreditCard size={12} />
          {query}
        </div>

        {!best ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            <p>No cards set up yet.</p>
            <a href="/setup" className="text-blue-600 underline mt-1 block">Set up your cards →</a>
          </div>
        ) : (
          <>
            {/* Hero recommendation */}
            <div className="mx-4 mt-2 rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
              <div className="bg-blue-600 px-4 py-3 flex items-center gap-2">
                <Trophy size={15} className="text-white opacity-90" />
                <div>
                  <div className="text-xs font-medium text-white">Best deal found</div>
                  <div className="text-[10px] text-blue-200">
                    Based on {profile.cardIds.length || 'your'} card{profile.cardIds.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Platform + card badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-md"
                    style={{
                      backgroundColor: PLATFORMS[best.platform].color + '20',
                      color: PLATFORMS[best.platform].color,
                    }}
                  >
                    {PLATFORMS[best.platform].name}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <CreditCard size={11} />
                    {cardName(best.cardId)}
                  </span>
                </div>

                {/* Breakdown */}
                <table className="w-full text-sm">
                  <tbody>
                    {best.breakdown.map((line, i) => (
                      <tr key={i}>
                        <td className={`py-1 ${line.type === 'price' ? 'text-gray-500' : line.amount < 0 ? 'text-gray-500' : 'text-orange-500'}`}>
                          {line.label}
                          {line.offerValidTo && (
                            <span className="ml-1 text-[10px] text-gray-400">
                              (exp. {line.offerValidTo})
                            </span>
                          )}
                        </td>
                        <td className={`py-1 text-right font-medium ${
                          line.type === 'price' ? 'text-gray-800'
                          : line.amount < 0 ? 'text-green-600'
                          : 'text-orange-600'
                        }`}>
                          {line.amount < 0 ? `−${fmt(Math.abs(line.amount))}` : fmt(line.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} className="pt-2 pb-1">
                        <div className="border-t border-gray-100" />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-sm font-semibold text-gray-900 py-1">Effective price</td>
                      <td className="text-lg font-bold text-blue-700 text-right py-1">{fmt(best.effectivePrice)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Expiry warning */}
                {best.appliedOffer && daysUntilExpiry(best.appliedOffer.validTo) <= 7 && (
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] rounded-lg px-3 py-2 mt-3">
                    <AlertCircle size={12} />
                    Offer expires in {daysUntilExpiry(best.appliedOffer.validTo)} days
                  </div>
                )}

                {best.appliedOffer && daysUntilExpiry(best.appliedOffer.validTo) > 7 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-2">
                    <AlertCircle size={10} />
                    Bank offer valid till {best.appliedOffer.validTo} · {daysUntilExpiry(best.appliedOffer.validTo)} days left
                  </div>
                )}

                {/* CTA */}
                <a
                  href={`https://www.${best.platform === 'reliance_digital' ? 'reliancedigital.in' : best.platform === 'tata_cliq' ? 'tatacliq.com' : best.platform + '.in'}/s?k=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  Buy on {PLATFORMS[best.platform].name}
                  <ExternalLink size={14} />
                </a>

                <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
                  Verify offer at checkout. T&Cs apply. Prices updated ~3 hrs ago.
                </p>
              </div>
            </div>

            {/* All options */}
            <div className="px-4 mt-5">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                All combinations — ranked by effective price
              </div>

              <div className="space-y-2">
                {[best, ...rest].map((r, i) => (
                  <div key={`${r.platform}-${r.cardId}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border bg-white ${i === 0 ? 'border-blue-100' : 'border-gray-100'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      i === 0 ? 'bg-blue-100 text-blue-600 font-semibold' : 'bg-gray-100 text-gray-400'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800">{PLATFORMS[r.platform].name}</div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {r.totalSaving > 0 ? cardName(r.cardId) : 'No offer available for your cards'}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-semibold ${i === 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                        {fmt(r.effectivePrice)}
                      </div>
                      {r.totalSaving > 0 && (
                        <div className="text-[10px] text-green-600">Save {fmt(r.totalSaving)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 bg-gray-100 rounded-xl p-3">
                <Info size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Reward points converted at standard redemption value. Actual value may vary.
                  Always verify the bank offer is applied at checkout before confirming payment.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
      <BottomNav />
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
