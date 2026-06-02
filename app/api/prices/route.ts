import type { NextRequest } from 'next/server';

type Platform = 'amazon' | 'flipkart' | 'croma' | 'vijay_sales' | 'reliance_digital';

interface PlatformPrice {
  platform: Platform;
  price: number;
  available: boolean;
  title?: string;
  image?: string;
  link?: string;
}

const PLATFORMS: Platform[] = ['amazon', 'flipkart', 'croma', 'vijay_sales', 'reliance_digital'];

const SOURCE_MAP: { platform: Platform; patterns: string[] }[] = [
  { platform: 'amazon',           patterns: ['amazon'] },
  { platform: 'flipkart',         patterns: ['flipkart'] },
  { platform: 'croma',            patterns: ['croma'] },
  { platform: 'vijay_sales',      patterns: ['vijay sales', 'vijaysales'] },
  { platform: 'reliance_digital', patterns: ['reliance digital', 'reliancedigital'] },
];

function matchPlatform(source: string): Platform | null {
  const s = source.toLowerCase();
  for (const { platform, patterns } of SOURCE_MAP) {
    if (patterns.some((p) => s.includes(p))) return platform;
  }
  return null;
}

// Extract ASIN from Amazon URLs and build direct product links with affiliate tag
function buildAmazonLink(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    // Extract ASIN from /dp/ or /gp/product/ format
    const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
    if (match) {
      const asin = match[1];
      const associateId = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID;
      if (associateId) {
        return `https://www.amazon.in/dp/${asin}?tag=${associateId}`;
      }
    }
  } catch (e) {
    // Silent fail
  }
  return undefined;
}

// ── Serper.dev helpers ────────────────────────────────────────────

function serperHeaders() {
  return { 'X-API-KEY': process.env.SERPER_KEY ?? '', 'Content-Type': 'application/json' };
}

// Google Shopping — covers Amazon, Reliance Digital, Croma
async function fetchLivePrices(
  query: string
): Promise<{ prices: Partial<Record<Platform, { price: number; title?: string; image?: string; link?: string }>>; productImage: string | null }> {
  if (!process.env.SERPER_KEY) return { prices: {}, productImage: null };
  try {
    const res = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: serperHeaders(),
      body: JSON.stringify({ q: query, gl: 'in', hl: 'en' }),
      next: { revalidate: 10800 },
    });
    if (!res.ok) return { prices: {}, productImage: null };

    const data = await res.json();
    const items: { source?: string; price?: string; thumbnail?: string; title?: string; link?: string }[] = data.shopping ?? [];

    // Grab the first product image from any result
    const productImage = items.find((r) => r.thumbnail)?.thumbnail ?? null;

    const prices: Partial<Record<Platform, { price: number; title?: string; image?: string; link?: string }>> = {};
    for (const r of items) {
      const price = parseInt((r.price ?? '').replace(/[₹,\s]/g, ''), 10);
      if (isNaN(price) || price <= 0) continue;
      const platform = matchPlatform(r.source ?? '');
      if (platform && (!prices[platform] || price < prices[platform].price)) {
        let link = r.link;
        // For Amazon results, try to build direct product links
        if (platform === 'amazon') {
          const directLink = buildAmazonLink(link);
          if (directLink) link = directLink;
        }
        prices[platform] = {
          price,
          title: r.title,
          image: r.thumbnail,
          link,
        };
      }
    }
    return { prices, productImage };
  } catch { return { prices: {}, productImage: null }; }
}

// Fetch Amazon product link via organic search (site:amazon.in)
async function fetchAmazonLink(query: string): Promise<string | undefined> {
  if (!process.env.SERPER_KEY) return undefined;
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: serperHeaders(),
      body: JSON.stringify({ q: `${query} site:amazon.in`, gl: 'in', hl: 'en', num: 5 }),
      next: { revalidate: 10800 },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    // Find first result with /dp/ pattern (Amazon product page)
    for (const r of (data.organic ?? [])) {
      if (r.link && r.link.includes('/dp/')) {
        const directLink = buildAmazonLink(r.link);
        if (directLink) return directLink;
      }
    }
  } catch (e) {
    // Serper API failure - continue without Amazon direct link
  }
  return undefined;
}

// Organic site: search — for stores that block Google Shopping (Flipkart, Vijay Sales)
async function fetchSitePrice(query: string, site: string): Promise<number | null> {
  if (!process.env.SERPER_KEY) return null;
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: serperHeaders(),
      body: JSON.stringify({ q: `${query} site:${site}`, gl: 'in', hl: 'en' }),
      next: { revalidate: 10800 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const r of (data.organic ?? []).slice(0, 5)) {
      const text = (r.snippet ?? '') + ' ' + (r.title ?? '');
      const match = text.match(/₹\s*([\d,]+)/);
      if (match) return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return null;
  } catch { return null; }
}

const fetchFlipkartPrice = (q: string) => fetchSitePrice(q, 'flipkart.com');
const fetchVijayPrice    = (q: string) => fetchSitePrice(q, 'vijaysales.com');

// ── Mock fallback ─────────────────────────────────────────────────
const MOCK_PRODUCTS: Record<string, Partial<Record<Platform, number>>> = {
  'samsung galaxy s25': { amazon: 74999, flipkart: 76490, croma: 77000, vijay_sales: 75499, reliance_digital: 76999 },
  'samsung galaxy s25 ultra': { amazon: 129999, flipkart: 131490, croma: 132000, vijay_sales: 130999, reliance_digital: 131000 },
  'samsung galaxy s24': { amazon: 59999, flipkart: 61490, croma: 62000, vijay_sales: 60499, reliance_digital: 61999 },
  'iphone 16 128gb': { amazon: 79900, flipkart: 80490, croma: 81000, vijay_sales: 79499, reliance_digital: 80999 },
  'iphone 16 pro': { amazon: 119900, flipkart: 121490, croma: 122000, vijay_sales: 119499, reliance_digital: 121999 },
  'iphone 16 pro max': { amazon: 139900, flipkart: 141490, croma: 142000, vijay_sales: 139499, reliance_digital: 141999 },
  'iphone 15': { amazon: 69900, flipkart: 71490, croma: 72000, vijay_sales: 69499, reliance_digital: 71999 },
  'oneplus 12': { amazon: 64999, flipkart: 65999, croma: 66500, vijay_sales: 64499, reliance_digital: 66000 },
  'oneplus 13': { amazon: 69999, flipkart: 70999, croma: 71500, vijay_sales: 69499, reliance_digital: 71000 },
  'nothing phone 3': { amazon: 49999, flipkart: 50999, croma: 51500, vijay_sales: 49499, reliance_digital: 51000 },
  'google pixel 9': { amazon: 79999, flipkart: 81000, croma: 82000, vijay_sales: 79499, reliance_digital: 81500 },
  'google pixel 9 pro': { amazon: 109999, flipkart: 111000, croma: 112000, vijay_sales: 109499, reliance_digital: 111500 },
  'xiaomi 14': { amazon: 59999, flipkart: 60999, croma: 61500, vijay_sales: 59499, reliance_digital: 61000 },
  'macbook air m3': { amazon: 114900, flipkart: 116490, croma: 117000, vijay_sales: 114499, reliance_digital: 116000 },
  'macbook air m4': { amazon: 99900, flipkart: 101490, croma: 102000, vijay_sales: 99499, reliance_digital: 101000 },
  'macbook pro m4': { amazon: 169900, flipkart: 171490, croma: 172000, vijay_sales: 169499, reliance_digital: 171000 },
  'ipad air m2': { amazon: 59900, flipkart: 61490, croma: 62000, vijay_sales: 59499, reliance_digital: 61000 },
  'ipad pro m4': { amazon: 109900, flipkart: 111490, croma: 112000, vijay_sales: 109499, reliance_digital: 111000 },
  'sony wh-1000xm5': { amazon: 24990, flipkart: 25990, croma: 26499, vijay_sales: 24499, reliance_digital: 25999 },
  'sony wh-1000xm4': { amazon: 19990, flipkart: 20990, croma: 21499, vijay_sales: 19499, reliance_digital: 20999 },
  'airpods pro 2': { amazon: 24900, flipkart: 25900, croma: 26499, vijay_sales: 24499, reliance_digital: 25999 },
  'airpods 4': { amazon: 14900, flipkart: 15900, croma: 16499, vijay_sales: 14499, reliance_digital: 15999 },
  'bose quietcomfort 45': { amazon: 31990, flipkart: 32990, croma: 33499, vijay_sales: 31499, reliance_digital: 32999 },
  'jbl charge 5': { amazon: 16999, flipkart: 17999, croma: 18499, vijay_sales: 16499, reliance_digital: 17999 },
  'apple watch series 10': { amazon: 46900, flipkart: 47900, croma: 48500, vijay_sales: 46499, reliance_digital: 47999 },
  'samsung galaxy watch 7': { amazon: 29999, flipkart: 30999, croma: 31499, vijay_sales: 29499, reliance_digital: 30999 },
  'playstation 5': { amazon: 54990, flipkart: 55990, croma: 56499, vijay_sales: 54499, reliance_digital: 55999 },
  'xbox series x': { amazon: 49990, flipkart: 50990, croma: 51499, vijay_sales: 49499, reliance_digital: 50999 },
  'dyson v15': { amazon: 52900, flipkart: 54490, croma: 54999, vijay_sales: 52499, reliance_digital: 53999 },
  'dyson v12': { amazon: 42900, flipkart: 44490, croma: 44999, vijay_sales: 42499, reliance_digital: 43999 },
  'lg oled tv 55': { amazon: 139990, flipkart: 141990, croma: 142999, vijay_sales: 139499, reliance_digital: 141999 },
  'samsung qled tv 65': { amazon: 109990, flipkart: 111990, croma: 112999, vijay_sales: 109499, reliance_digital: 111999 },
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

  console.log('[prices/route] Starting with query:', q);

  const [{ prices: live, productImage }, flipkartPrice, vijayPrice, mock] = await Promise.all([
    fetchLivePrices(q),
    fetchFlipkartPrice(q),
    fetchVijayPrice(q),
    Promise.resolve(mockFallback(q)),
  ]);

  if (flipkartPrice) live['flipkart']    = { price: flipkartPrice };
  if (vijayPrice)    live['vijay_sales'] = { price: vijayPrice };

  // Fetch direct Amazon link if we have an Amazon result
  if (live['amazon']) {
    const amazonLink = await fetchAmazonLink(q);
    if (amazonLink) {
      live['amazon'].link = amazonLink;
    }
  }

  const prices: PlatformPrice[] = PLATFORMS.map((platform) => {
    const liveData = live[platform];
    if (liveData) return { platform, price: liveData.price, title: liveData.title, image: liveData.image, link: liveData.link, available: true };

    const base = mock[platform];
    if (!base) return { platform, price: 0, available: false };
    const variance = base * (0.97 + Math.random() * 0.06);
    return { platform, price: Math.round(variance / 10) * 10, available: true };
  });

  return Response.json({ prices, productImage });
}
