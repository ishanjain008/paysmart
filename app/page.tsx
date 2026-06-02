'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { useSearchHistory } from '@/lib/useSearchHistory';
import { useProfile } from '@/lib/useProfile';
import { useAuth } from '@/lib/AuthContext';
import { UserButton } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SearchWithAutocomplete } from '@/components/SearchWithAutocomplete';

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] });

const SUGGESTIONS = ['portable speaker', 'inverter AC', 'coffee maker', 'iPhone 16', 'Samsung S25', 'AirPods Pro'];

export default function HomePage() {
  const router = useRouter();
  const { history, push } = useSearchHistory();
  const { profile, loaded } = useProfile();
  const { user } = useAuth();

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
      <main className="flex-1 px-8 md:px-14 pt-12 md:pt-20 pb-16 flex items-center">
        <div className="w-full">
          <div className="flex items-start gap-12 mb-6">
            <div className="flex-1">
              <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-8">
                Before you buy
              </p>

              <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold leading-[1.1] text-gray-900 mb-7`}>
                Know your{' '}
                <em className="text-blue-600 italic">real</em>
                {' '}best price — for
                <br />
                the cards you
                <br />
                carry.
              </h1>

              <p className="text-base md:text-lg text-gray-400 mb-10 leading-relaxed max-w-xl">
                Tell me what you&apos;re after. I&apos;ll find it across stores and show the
                price <em className="text-gray-500">after</em> your card&apos;s offer.
              </p>

              {/* ── Search bar with auto-complete ── */}
              <div className="mb-5 max-w-2xl">
                <SearchWithAutocomplete />
              </div>

              {/* ── Suggestion chips ── */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-400 mr-1">Try:</span>
                {(history.length > 0 ? history.slice(0, 5) : SUGGESTIONS).map((s) => (
                  <button
                    key={s}
                    onClick={() => { push(s); router.push(`/variants?q=${encodeURIComponent(s)}`); }}
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
            </div>

            {/* ── Hero image ── */}
            <div className="hidden lg:block flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1579621970563-430f63602d4a?w=400&h=500&fit=crop&q=80"
                alt="Credit cards and shopping"
                className="w-64 h-80 object-cover rounded-3xl shadow-2xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
