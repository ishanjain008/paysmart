'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';

const playfair = Playfair_Display({ subsets: ['latin'] });

interface Product {
  title: string;
  image?: string;
  price?: string;
}

function VariantsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get('q') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        // Extract unique products by title
        const seen = new Set<string>();
        const unique: Product[] = [];
        for (const item of (data.shopping ?? [])) {
          const title = item.title ?? '';
          if (title && !seen.has(title)) {
            seen.add(title);
            unique.push({
              title,
              image: item.thumbnail,
              price: item.price,
            });
          }
        }
        setProducts(unique.slice(0, 12)); // Show top 12 variants
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  const handleSelect = (product: Product) => {
    // Go to results with exact product title
    router.push(`/results?q=${encodeURIComponent(product.title)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-4xl">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Choose a model</p>
        <h1 className={`${playfair.className} text-4xl font-bold text-gray-900 mb-2`}>
          {query}
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          {loading ? 'Finding variants…' : `${products.length} models available`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20">
            <Loader2 size={18} className="animate-spin text-gray-400" />
            <span className="text-gray-400">Fetching variants…</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 mb-4">No variants found.</p>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Try a different search →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, i) => (
              <button
                key={i}
                onClick={() => handleSelect(product)}
                className="group p-4 border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
              >
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/image?url=${encodeURIComponent(product.image)}`}
                    alt={product.title}
                    className="w-full h-32 object-contain rounded-xl mb-3 bg-gray-50"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {product.title}
                </h3>
                {product.price && (
                  <p className="text-xs text-gray-400 mb-2">{product.price}</p>
                )}
                <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                  Compare prices <ArrowRight size={12} />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function VariantsPage() {
  return (
    <Suspense fallback={<div />}>
      <VariantsContent />
    </Suspense>
  );
}
