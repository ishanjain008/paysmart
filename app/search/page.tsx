'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, X } from 'lucide-react';
import { BottomNav, TopNav } from '@/components/Nav';
import { useSearchHistory } from '@/lib/useSearchHistory';

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
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <TopNav />
      <main className="flex-1 pb-20 px-5">
        <div className="pt-6 pb-4">
          <div className="flex items-center gap-2 border border-blue-300 rounded-xl px-4 py-3 bg-white shadow-sm ring-1 ring-blue-200">
            <Search size={16} className="text-blue-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for a product..."
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              autoFocus
            />
            {query ? (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Live suggestions while typing */}
        {filtered.length > 0 && (
          <div className="mb-5">
            <div className="space-y-0.5">
              {filtered.map((s) => (
                <button key={s} onClick={() => handleSearch(s)}
                  className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                  <Search size={13} className="text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent search history */}
        {!query && history.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Recent</div>
            <div className="space-y-0.5">
              {history.map((item) => (
                <button key={item} onClick={() => handleSearch(item)}
                  className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                  <Clock size={13} className="text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1">{item}</span>
                  <Search size={12} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions when no history */}
        {!query && history.length === 0 && (
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Popular</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleSearch(s)}
                  className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
