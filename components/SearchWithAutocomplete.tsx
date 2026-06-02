'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Suggestion {
  title: string;
  image?: string;
  isBroad?: boolean;
}

export function SearchWithAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isBroadSearch = (q: string): boolean => {
    const broad = ['phone', 'laptop', 'tablet', 'watch', 'headphone', 'speaker', 'tv', 'camera', 'appliance'];
    return broad.some(b => q.toLowerCase().includes(b));
  };

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const items = (data.shopping ?? [])
          .slice(0, 6)
          .map((item: { title?: string; thumbnail?: string }) => ({
            title: item.title ?? '',
            image: item.thumbnail,
            isBroad: isBroadSearch(query),
          }))
          .filter((s: Suggestion) => s.title);
        setSuggestions(items);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const handleSelect = (suggestion: Suggestion) => {
    if (suggestion.isBroad && !suggestion.title.toLowerCase().includes(query.toLowerCase())) {
      router.push(`/variants?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/results?q=${encodeURIComponent(suggestion.title)}`);
    }
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    if (isBroadSearch(query) && suggestions.length === 0) {
      router.push(`/variants?q=${encodeURIComponent(query)}`);
    } else if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else {
      router.push(`/results?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-3.5 text-gray-300" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products (e.g., iPhone 16, MacBook, Samsung TV)…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
            className="absolute right-3 top-3 text-gray-300 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 size={14} className="animate-spin text-gray-400" />
              <span className="text-xs text-gray-400">Searching…</span>
            </div>
          )}

          {!loading && suggestions.length === 0 && query.trim() && (
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400">No products found</p>
              <button
                onClick={handleSearch}
                className="mt-2 text-xs text-blue-600 font-medium hover:underline"
              >
                Search anyway →
              </button>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="divide-y divide-gray-100">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(suggestion)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {suggestion.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/image?url=${encodeURIComponent(suggestion.image)}`}
                      alt={suggestion.title}
                      className="w-10 h-10 object-contain rounded-lg bg-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {suggestion.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
