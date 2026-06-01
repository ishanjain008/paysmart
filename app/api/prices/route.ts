import type { NextRequest } from 'next/server';

type Platform = 'amazon' | 'flipkart' | 'croma' | 'reliance_digital' | 'tata_cliq';

interface PlatformPrice {
  platform: Platform;
  price: number;
  available: boolean;
}

const PLATFORMS: Platform[] = ['amazon', 'flipkart', 'croma', 'reliance_digital', 'tata_cliq'];

// Map SerpAPI's "source" field to our platform IDs
const SOURCE_MAP: { platform: Platform; patterns: string[] }[] = [
  { platform: 'amazon',           patterns: ['amazon'] },
  { platform: 'flipkart',         patterns: ['flipkart'] },
  { platform: 'croma',            patterns: ['croma'] },
  { platform: 'reliance_digital', patterns: ['reliance digital', 'reliancedigital'] },
  { platform: 'tata_cliq',        patterns: ['tata cliq', 'tatacliq'] },
];

function matchPlatform(source: string): Platform | null {
  const s = source.toLowerCase();
  for (const { platform, patterns } of SOURCE_MAP) {
    if (patterns.some((p) => s.includes(p))) return platform;
  }
  return null;
}

// ── Live prices via SerpAPI Google Shopping ───────────────────────
async function fetchLivePrices(query: string): Promise<Partial<Record<Platform, number>>> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return {};

  const url =
    `https://www.searchapi.io/api/v1/search` +
    `?engine=google_shopping` +
    `&q=${encodeURIComponent(query)}` +
    `&gl=in` +
    `&hl=en` +
    `&google_domain=google.co.in` +
    `&api_key=${apiKey}`;

  try {
    // Cache each query for 3 hours to avoid burning API credits on repeat searches
    const res = await fetch(url, { next: { revalidate: 10800 } });
    if (!res.ok) return {};

    const data = await res.json();
    const results: { source: string; price: number }[] = (data.shopping_results ?? [])
      .filter((r: { extracted_price?: number }) => r.extracted_price)
      .map((r: { seller?: string; source?: string; extracted_price: number }) => ({
        source: r.seller ?? r.source ?? '',
        price: r.extracted_price,
      }));

    // Keep the lowest price found per platform
    const prices: Partial<Record<Platform, number>> = {};
    for (const { source, price } of results) {
      const platform = matchPlatform(source);
      if (platform && (!prices[platform] || price < prices[platform]!)) {
        prices[platform] = price;
      }
    }
    return prices;
  } catch {
    return {};
  }
}

// ── Mock fallback (used when SerpAPI has no result for a platform) ─
const MOCK_PRODUCTS: Record<string, Partial<Record<Platform, number>>> = {
  'samsung galaxy s25': { amazon: 74999, flipkart: 76490, croma: 77000, reliance_digital: 76999, tata_cliq: 75999 },
  'samsung galaxy s25 ultra': { amazon: 129999, flipkart: 131490, croma: 132000, reliance_digital: 131000, tata_cliq: 130499 },
  'samsung galaxy s24': { amazon: 59999, flipkart: 61490, croma: 62000, reliance_digital: 61999, tata_cliq: 60999 },
  'iphone 16 128gb': { amazon: 79900, flipkart: 80490, croma: 81000, reliance_digital: 80999, tata_cliq: 79999 },
  'iphone 16 pro': { amazon: 119900, flipkart: 121490, croma: 122000, reliance_digital: 121999, tata_cliq: 120999 },
  'iphone 16 pro max': { amazon: 139900, flipkart: 141490, croma: 142000, reliance_digital: 141999, tata_cliq: 140999 },
  'iphone 15': { amazon: 69900, flipkart: 71490, croma: 72000, reliance_digital: 71999, tata_cliq: 70999 },
  'oneplus 12': { amazon: 64999, flipkart: 65999, croma: 66500, reliance_digital: 66000, tata_cliq: 65499 },
  'oneplus 13': { amazon: 69999, flipkart: 70999, croma: 71500, reliance_digital: 71000, tata_cliq: 70499 },
  'nothing phone 3': { amazon: 49999, flipkart: 50999, croma: 51500, reliance_digital: 51000, tata_cliq: 50499 },
  'google pixel 9': { amazon: 79999, flipkart: 81000, croma: 82000, reliance_digital: 81500, tata_cliq: 80499 },
  'google pixel 9 pro': { amazon: 109999, flipkart: 111000, croma: 112000, reliance_digital: 111500, tata_cliq: 110499 },
  'xiaomi 14': { amazon: 59999, flipkart: 60999, croma: 61500, reliance_digital: 61000, tata_cliq: 60499 },
  'macbook air m3': { amazon: 114900, flipkart: 116490, croma: 117000, reliance_digital: 116000, tata_cliq: 115500 },
  'macbook air m4': { amazon: 99900, flipkart: 101490, croma: 102000, reliance_digital: 101000, tata_cliq: 100500 },
  'macbook pro m4': { amazon: 169900, flipkart: 171490, croma: 172000, reliance_digital: 171000, tata_cliq: 170500 },
  'ipad air m2': { amazon: 59900, flipkart: 61490, croma: 62000, reliance_digital: 61000, tata_cliq: 60500 },
  'ipad pro m4': { amazon: 109900, flipkart: 111490, croma: 112000, reliance_digital: 111000, tata_cliq: 110500 },
  'sony wh-1000xm5': { amazon: 24990, flipkart: 25990, croma: 26499, reliance_digital: 25999 },
  'sony wh-1000xm4': { amazon: 19990, flipkart: 20990, croma: 21499, reliance_digital: 20999 },
  'airpods pro 2': { amazon: 24900, flipkart: 25900, croma: 26499, reliance_digital: 25999, tata_cliq: 25499 },
  'airpods 4': { amazon: 14900, flipkart: 15900, croma: 16499, reliance_digital: 15999, tata_cliq: 15499 },
  'bose quietcomfort 45': { amazon: 31990, flipkart: 32990, croma: 33499, reliance_digital: 32999 },
  'jbl charge 5': { amazon: 16999, flipkart: 17999, croma: 18499, reliance_digital: 17999, tata_cliq: 17499 },
  'apple watch series 10': { amazon: 46900, flipkart: 47900, croma: 48500, reliance_digital: 47999, tata_cliq: 47499 },
  'samsung galaxy watch 7': { amazon: 29999, flipkart: 30999, croma: 31499, reliance_digital: 30999, tata_cliq: 30499 },
  'playstation 5': { amazon: 54990, flipkart: 55990, croma: 56499, reliance_digital: 55999 },
  'xbox series x': { amazon: 49990, flipkart: 50990, croma: 51499, reliance_digital: 50999 },
  'dyson v15': { amazon: 52900, flipkart: 54490, croma: 54999, reliance_digital: 53999 },
  'dyson v12': { amazon: 42900, flipkart: 44490, croma: 44999, reliance_digital: 43999 },
  'lg oled tv 55': { amazon: 139990, flipkart: 141990, croma: 142999, reliance_digital: 141999, tata_cliq: 140999 },
  'samsung qled tv 65': { amazon: 109990, flipkart: 111990, croma: 112999, reliance_digital: 111999, tata_cliq: 110999 },
  'kindle paperwhite': { amazon: 16999 },
};

function mockFallback(query: string): Partial<Record<Platform, number>> {
  const key = query.toLowerCase().trim();
  const matched = Object.keys(MOCK_PRODUCTS).find((k) => {
    const words = key.split(' ').slice(0, 3).join(' ');
    return key.includes(k) || k.includes(words) || words.includes(k.split(' ')[0]);
  });
  return matched ? MOCK_PRODUCTS[matched] : {};
}

// ── Route handler ─────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q) return Response.json([]);

  const [live, mock] = await Promise.all([
    fetchLivePrices(q),
    Promise.resolve(mockFallback(q)),
  ]);

  const result: PlatformPrice[] = PLATFORMS.map((platform) => {
    // Prefer live price; fall back to mock with slight variance
    const livePrice = live[platform];
    if (livePrice) return { platform, price: livePrice, available: true };

    const base = mock[platform];
    if (!base) return { platform, price: 0, available: false };
    const variance = base * (0.97 + Math.random() * 0.06);
    return { platform, price: Math.round(variance / 10) * 10, available: true };
  });

  return Response.json(result);
}
