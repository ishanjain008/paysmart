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

// ── Mock data for development ─────────────────────────────────────
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
};

function mockFallback(query: string): Partial<Record<Platform, number>> {
  const q = query.toLowerCase();
  for (const [key, prices] of Object.entries(MOCK_PRODUCTS)) {
    if (key.includes(q) || q.includes(key.split(' ')[0])) {
      // Add variance to mock prices
      const varied: Partial<Record<Platform, number>> = {};
      for (const [platform, price] of Object.entries(prices)) {
        const variance = price * (0.97 + Math.random() * 0.06);
        varied[platform as Platform] = Math.round(variance / 10) * 10;
      }
      return varied;
    }
  }
  // Generic fallback
  return {
    amazon: 50000,
    flipkart: 52000,
    croma: 53000,
    vijay_sales: 51000,
    reliance_digital: 52500,
  };
}

// Extract ASIN from Amazon URLs and build direct affiliate links
function buildAmazonLink(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
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

// Fetch Amazon product link and price via organic search
async function fetchAmazonLinkAndPrice(query: string): Promise<{ link?: string; price?: number }> {
  const serperKey = process.env.SERPER_KEY;
  if (!serperKey) return {};
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${query} site:amazon.in`, gl: 'in', hl: 'en', num: 5 }),
      next: { revalidate: 10800 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    for (const r of (data.organic ?? [])) {
      if (r.link && r.link.includes('/dp/')) {
        const link = buildAmazonLink(r.link);
        // Try to extract price from snippet
        let price: number | undefined;
        if (r.snippet) {
          const priceMatch = r.snippet.match(/₹[\s,]*([0-9,]+)/);
          if (priceMatch) {
            price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
          }
        }
        return { link, price };
      }
    }
  } catch (e) {
    // Serper API failure
  }
  return {};
}

// ── Route handler ─────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q) return Response.json([]);

  console.log('[prices/route] Query:', q);

  // Get mock prices
  const mockPrices = mockFallback(q);
  const live: Partial<Record<Platform, { price: number; title?: string; link?: string }>> = {};

  // For Amazon, fetch real price and affiliate link
  const amazonData = await fetchAmazonLinkAndPrice(q);
  if (amazonData.link || mockPrices['amazon']) {
    live['amazon'] = {
      price: amazonData.price ?? mockPrices['amazon'] ?? 0,
      ...(amazonData.link && { link: amazonData.link }),
    };
  }

  // For other platforms, just use mock prices
  for (const platform of PLATFORMS) {
    if (platform !== 'amazon' && mockPrices[platform]) {
      live[platform] = { price: mockPrices[platform] };
    }
  }

  // Build response
  const prices: PlatformPrice[] = PLATFORMS.map((platform) => {
    const data = live[platform];
    if (data) {
      return {
        platform,
        price: data.price,
        available: true,
        ...(data.title && { title: data.title }),
        ...(data.link && { link: data.link }),
      };
    }
    return { platform, price: 0, available: false };
  });

  return Response.json({ prices, productImage: null });
}
