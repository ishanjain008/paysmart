'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, X, Link2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Suggestion {
  title: string;
  image?: string;
  isBroad?: boolean;
}

export function SearchWithAutocomplete() {
  const router = useRouter();
  const [mode, setMode] = useState<'text' | 'link'>('text');
  const [query, setQuery] = useState<string>('');
  const [linkInput, setLinkInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [linkLoading, setLinkLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string>('');
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
          .map((item: { title?: string; thumbnail?: string; imageUrl?: string }) => ({
            title: item.title ?? '',
            image: item.thumbnail || item.imageUrl,
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

  const handleLinkSubmit = async () => {
    if (!linkInput.trim()) return;
    setLinkError('');
    setLinkLoading(true);

    try {
      const res = await fetch('/api/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLinkError(data.error || 'Failed to extract product');
        setLinkLoading(false);
        return;
      }

      // Navigate to results with the extracted product title
      router.push(`/results?q=${encodeURIComponent(data.title)}`);
    } catch (error) {
      setLinkError('Failed to process the link. Please try again.');
      setLinkLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-3 border-b border-gray-100">
        <button
          onClick={() => { setMode('text'); setQuery(''); setSuggestions([]); setShowSuggestions(false); setLinkError(''); }}
          className={`pb-2 text-sm font-medium transition-colors ${
            mode === 'text'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-[2px]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => { setMode('link'); setLinkInput(''); setLinkError(''); }}
          className={`pb-2 text-sm font-medium transition-colors flex items-center gap-1 ${
            mode === 'link'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-[2px]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Link2 size={14} /> Paste link
        </button>
      </div>

      {/* Text search mode */}
      {mode === 'text' && (
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
      )}

      {/* Link paste mode */}
      {mode === 'link' && (
        <div className="space-y-2">
          <div className="relative">
            <Link2 size={16} className="absolute left-4 top-3.5 text-gray-300" />
            <input
              type="text"
              placeholder="Paste Amazon, Flipkart, Croma, Vijay Sales, or Reliance Digital product link…"
              value={linkInput}
              onChange={e => { setLinkInput(e.target.value); setLinkError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLinkSubmit()}
              disabled={linkLoading}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 disabled:opacity-50"
            />
            {linkInput && !linkLoading && (
              <button
                onClick={() => { setLinkInput(''); setLinkError(''); }}
                className="absolute right-3 top-3 text-gray-300 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            {linkLoading && (
              <Loader2 size={16} className="absolute right-3 top-3 text-blue-400 animate-spin" />
            )}
          </div>
          {linkError && (
            <p className="text-xs text-red-500">{linkError}</p>
          )}
          <button
            onClick={handleLinkSubmit}
            disabled={!linkInput.trim() || linkLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {linkLoading ? 'Extracting product…' : 'Compare prices'}
          </button>
        </div>
      )}

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
