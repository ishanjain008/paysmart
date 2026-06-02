'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { useSearchHistory } from '@/lib/useSearchHistory';
import { useProfile } from '@/lib/useProfile';
import { useAuth } from '@/lib/AuthContext';
import { UserButton } from '@/components/Nav';
import { Footer } from '@/components/Footer';

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] });

const SUGGESTIONS = ['portable speaker', 'inverter AC', 'coffee maker', 'iPhone 16', 'Samsung S25', 'AirPods Pro'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { history, push } = useSearchHistory();
  const { profile, loaded } = useProfile();
  const { user } = useAuth();

  const handleSearch = (q: string) => {
    const term = q.trim();
    if (!term) return;
    push(term);
    router.push(`/results?q=${encodeURIComponent(term)}`);
  };

  const cardCount = profile.cardIds.length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Nav ── */}
      <header className="flex items-center justify-between px-8 md:px-14 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className={`${playfair.className} text-xl font-bold text-gray-900 tracking-tight`}>
            PaySmart
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors"
          >
            <span className="text-base">👜</span>
            <span className="text-sm text-gray-500">Wallet</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-sm font-semibold text-gray-900">
              {loaded ? cardCount : '—'} cards
            </span>
          </Link>
          <UserButton />
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 px-8 md:px-14 pt-12 md:pt-20 pb-16 max-w-5xl">
        <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-8">
          Before you buy
        </p>

        <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold leading-[1.08] text-gray-900 mb-7`}>
          Know your{' '}
          <em className="text-blue-600 italic">real</em>
          <br />
          best price — for
          <br />
          the cards you
          <br />
          carry.
        </h1>

        <p className="text-base md:text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">
          Tell me what you&apos;re after. I&apos;ll find it across stores and show the
          price <em className="text-gray-500">after</em> your card&apos;s offer.
        </p>

        {/* ── Search bar ── */}
        <div className="flex items-center bg-gray-100 rounded-2xl p-2 mb-5 max-w-2xl">
          <input
            type="text"
            placeholder="I want to buy a Bluetooth speaker..."
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-base px-4 py-3 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            autoFocus
          />
          <button
            onClick={() => handleSearch(query)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-colors flex-shrink-0"
          >
            Find it <ArrowRight size={15} />
          </button>
        </div>

        {/* ── Suggestion chips ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400 mr-1">Try:</span>
          {(history.length > 0 ? history.slice(0, 5) : SUGGESTIONS).map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-1.5 transition-colors"
            >
              {s}
            </button>
          ))}
          {history.length > 0 && (
            <button
              onClick={() => { push(''); router.refresh(); }}
              className="text-sm text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-1.5 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={11} />
              Start over
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
