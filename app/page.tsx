'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Clock, Info, CreditCard } from 'lucide-react';
import { BottomNav, TopNav } from '@/components/Nav';
import { LAST_UPDATED } from '@/data/offers';
import { useSearchHistory } from '@/lib/useSearchHistory';
import { useProfile } from '@/lib/useProfile';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { history, push } = useSearchHistory();
  const { profile, loaded } = useProfile();

  const handleSearch = (q: string) => {
    const term = q.trim();
    if (!term) return;
    push(term);
    router.push(`/results?q=${encodeURIComponent(term)}`);
  };

  const showSetupNudge = loaded && !profile.setupComplete && profile.cardIds.length === 0;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <TopNav />
      <main className="flex-1 pb-20">
        <div className="px-5 pt-10 pb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight mb-2">
            What are you buying today?
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            We find the lowest effective price after your card cashback and bank offers.
          </p>
        </div>

        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for a product..."
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              autoFocus
            />
            <button
              onClick={() => handleSearch(query)}
              className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* First-time nudge */}
        {showSetupNudge && (
          <div className="mx-5 mb-5 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
            <CreditCard size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-800 mb-0.5">Add your cards once, save every time</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                We&apos;ll factor in your cashback & bank offers to find the true lowest price.
              </p>
              <Link href="/setup" className="inline-block mt-2 text-xs font-medium text-blue-600 underline">
                Set up cards (60 sec) →
              </Link>
            </div>
          </div>
        )}

        <div className="px-5 mb-6">
          <div className="flex rounded-xl overflow-hidden border border-gray-100">
            {[
              { n: '1', t: 'Search any product' },
              { n: '2', t: 'Add your cards once' },
              { n: '3', t: 'See best deal' },
            ].map(({ n, t }, i) => (
              <div key={n} className={`flex-1 text-center py-4 px-2 bg-gray-50 ${i < 2 ? 'border-r border-gray-100' : ''}`}>
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center mx-auto mb-1.5">{n}</div>
                <div className="text-[11px] text-gray-500 leading-snug">{t}</div>
              </div>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div className="px-5 mb-6">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Recent searches</div>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 6).map((r) => (
                <button key={r} onClick={() => handleSearch(r)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  <Clock size={11} />{r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-5 flex items-start gap-2.5 bg-blue-50 rounded-xl p-3">
          <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Offers database last updated <strong>{LAST_UPDATED}</strong>. Prices refresh every 3 hrs.{' '}
            <Link href="/profile" className="underline">Manage your cards →</Link>
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
