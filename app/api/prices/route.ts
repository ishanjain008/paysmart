import type { NextRequest } from 'next/server';

type Platform = 'amazon' | 'flipkart' | 'croma' | 'reliance_digital' | 'tata_cliq';

interface PlatformPrice {
  platform: Platform;
  price: number;
  available: boolean;
}

const PLATFORMS: Platform[] = ['amazon', 'flipkart', 'croma', 'reliance_digital', 'tata_cliq'];

// Prices in INR (MRP / typical listed price as of Jun 2026)
// TODO: Replace each platform's block with a real API call:
//   Amazon   → PA API 5.0  (affiliate-program.amazon.in)
//   Flipkart → Affiliate API (affiliate.flipkart.com)
//   Croma / Reliance / Tata Cliq → PriceAPI.com or Oxylabs
const MOCK_PRODUCTS: Record<string, Partial<Record<Platform, number>>> = {
  // ── Phones ───────────────────────────────────────────────────────
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
  'vivo x200 pro': { amazon: 89999, flipkart: 91000, croma: 92000, reliance_digital: 91500, tata_cliq: 90499 },

  // ── Laptops & Tablets ────────────────────────────────────────────
  'macbook air m3': { amazon: 114900, flipkart: 116490, croma: 117000, reliance_digital: 116000, tata_cliq: 115500 },
  'macbook air m4': { amazon: 99900, flipkart: 101490, croma: 102000, reliance_digital: 101000, tata_cliq: 100500 },
  'macbook pro m4': { amazon: 169900, flipkart: 171490, croma: 172000, reliance_digital: 171000, tata_cliq: 170500 },
  'ipad air m2': { amazon: 59900, flipkart: 61490, croma: 62000, reliance_digital: 61000, tata_cliq: 60500 },
  'ipad pro m4': { amazon: 109900, flipkart: 111490, croma: 112000, reliance_digital: 111000, tata_cliq: 110500 },
  'samsung galaxy tab s9': { amazon: 72999, flipkart: 74490, croma: 75000, reliance_digital: 74000, tata_cliq: 73499 },

  // ── Audio ────────────────────────────────────────────────────────
  'sony wh-1000xm5': { amazon: 24990, flipkart: 25990, croma: 26499, reliance_digital: 25999 },
  'sony wh-1000xm4': { amazon: 19990, flipkart: 20990, croma: 21499, reliance_digital: 20999 },
  'airpods pro 2': { amazon: 24900, flipkart: 25900, croma: 26499, reliance_digital: 25999, tata_cliq: 25499 },
  'airpods 4': { amazon: 14900, flipkart: 15900, croma: 16499, reliance_digital: 15999, tata_cliq: 15499 },
  'bose quietcomfort 45': { amazon: 31990, flipkart: 32990, croma: 33499, reliance_digital: 32999 },
  'jbl charge 5': { amazon: 16999, flipkart: 17999, croma: 18499, reliance_digital: 17999, tata_cliq: 17499 },
  'samsung galaxy buds 3': { amazon: 13999, flipkart: 14999, croma: 15499, reliance_digital: 14999, tata_cliq: 14499 },

  // ── Wearables ────────────────────────────────────────────────────
  'apple watch series 10': { amazon: 46900, flipkart: 47900, croma: 48500, reliance_digital: 47999, tata_cliq: 47499 },
  'samsung galaxy watch 7': { amazon: 29999, flipkart: 30999, croma: 31499, reliance_digital: 30999, tata_cliq: 30499 },
  'garmin forerunner 255': { amazon: 29990, flipkart: 30990, croma: 31499, reliance_digital: 30999, tata_cliq: 30499 },

  // ── Gaming ───────────────────────────────────────────────────────
  'playstation 5': { amazon: 54990, flipkart: 55990, croma: 56499, reliance_digital: 55999 },
  'xbox series x': { amazon: 49990, flipkart: 50990, croma: 51499, reliance_digital: 50999 },
  'nintendo switch': { amazon: 29990, flipkart: 30990, croma: 31499, reliance_digital: 30999 },

  // ── Appliances ───────────────────────────────────────────────────
  'dyson v15': { amazon: 52900, flipkart: 54490, croma: 54999, reliance_digital: 53999 },
  'dyson v12': { amazon: 42900, flipkart: 44490, croma: 44999, reliance_digital: 43999 },
  'lg oled tv 55': { amazon: 139990, flipkart: 141990, croma: 142999, reliance_digital: 141999, tata_cliq: 140999 },
  'samsung qled tv 65': { amazon: 109990, flipkart: 111990, croma: 112999, reliance_digital: 111999, tata_cliq: 110999 },

  // ── E-readers ────────────────────────────────────────────────────
  'kindle paperwhite': { amazon: 16999 },
  'kindle scribe': { amazon: 39999 },
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';

  // Simulate network latency (~600 ms); remove when using real APIs
  await new Promise((r) => setTimeout(r, 600));

  const key = q.toLowerCase().trim();

  const matchedKey = Object.keys(MOCK_PRODUCTS).find((k) => {
    const words = key.split(' ').slice(0, 3).join(' ');
    return key.includes(k) || k.includes(words) || words.includes(k.split(' ')[0]);
  });

  const prices = matchedKey ? MOCK_PRODUCTS[matchedKey] : {};

  // Add ±3 % random variance so repeated searches feel realistic
  const result: PlatformPrice[] = PLATFORMS.map((platform) => {
    const base = prices[platform];
    if (!base) return { platform, price: 0, available: false };
    const variance = base * (0.97 + Math.random() * 0.06);
    return {
      platform,
      price: Math.round(variance / 10) * 10,
      available: true,
    };
  });

  return Response.json(result);
}
