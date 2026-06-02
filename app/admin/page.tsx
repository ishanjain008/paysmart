'use client';
import { useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'] });

interface ExtractedOffer {
  id: string;
  cardId: string;
  platform: string;
  benefitType: string;
  value: number;
  cap: number | null;
  minTransaction: number | null;
  validTo: string;
  notes: string;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ offers: ExtractedOffer[]; updatedAt: string } | null>(null);
  const [error, setError] = useState('');

  const runExtraction = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/refresh-offers', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Extraction failed');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-4xl">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Admin</p>
        <h1 className={`${playfair.className} text-4xl font-bold text-gray-900 mb-2`}>
          Offer Extraction
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          Searches Google for current bank/card offers on each platform, extracts them with Claude, and saves to Firestore.
          Runs automatically on the 1st and 15th of each month.
        </p>

        <button
          onClick={runExtraction}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors mb-8"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Extracting offers…' : 'Run extraction now'}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-6">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {result && (
          <div>
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3 mb-6">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">
                Extracted {result.offers.length} offers · saved to Firestore · {new Date(result.updatedAt).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2">
              {result.offers.map((offer) => (
                <div key={offer.id} className="border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-4">
                  <div className="w-32 flex-shrink-0">
                    <div className="text-xs font-semibold text-gray-800 capitalize">{offer.platform.replace('_', ' ')}</div>
                    <div className="text-[11px] text-gray-400">{offer.cardId}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700">{offer.notes}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-green-700">
                      {offer.benefitType === 'flat_cashback' ? `₹${offer.value}` : `${offer.value}%`}
                      {offer.cap ? ` (cap ₹${offer.cap.toLocaleString('en-IN')})` : ''}
                    </div>
                    <div className="text-[11px] text-gray-400">valid till {offer.validTo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
