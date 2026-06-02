'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, X } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { useSearchHistory } from '@/lib/useSearchHistory';

const playfair = Playfair_Display({ subsets: ['latin'] });

const SUGGESTIONS = [
  'iPhone 16', 'Samsung Galaxy S25', 'MacBook Air M3',
  'Sony WH-1000XM5', 'Dyson V15', 'AirPods Pro 2',
  'OnePlus 13', 'iPad Air M2', 'PlayStation 5',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { history, push } = useSearchHistory();

  const handleSearch = (q: string) => {
    const term = q.trim();
    if (!term) return;
    push(term);
    router.push(`/results?q=${encodeURIComponent(term)}`);
  };

  const filtered = query.trim()
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-3xl">
        <h1 className={`${playfair.className} text-4xl font-bold text-gray-900 mb-8`}>
          Search
        </h1>

        {/* Search bar */}
        <div className="flex items-center bg-gray-100 rounded-2xl p-2 mb-8">
          <input
            type="text"
            placeholder="I want to buy a Bluetooth speaker..."
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-base px-4 py-3 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 px-2">
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => handleSearch(query)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-colors"
          >
            Find it <ArrowRight size={15} />
          </button>
        </div>

        {/* Live suggestions */}
        {filtered.length > 0 && (
          <div className="mb-8 space-y-1">
            {filtered.map((s) => (
              <button key={s} onClick={() => handleSearch(s)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
                <span className="text-gray-700">{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Recent history */}
        {!query && history.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Recent</p>
            <div className="space-y-1">
              {history.map((item) => (
                <button key={item} onClick={() => handleSearch(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                  <Clock size={14} className="text-gray-300 flex-shrink-0" />
                  <span className="text-gray-700 flex-1">{item}</span>
                  <ArrowRight size={13} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular */}
        {!query && history.length === 0 && (
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Popular</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleSearch(s)}
                  className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
