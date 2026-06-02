import { PlatformPrice } from './calculator';

export interface PriceResult {
  prices: PlatformPrice[];
  productImage: string | null;
}

export async function fetchPrices(query: string): Promise<PriceResult> {
  const res = await fetch(`/api/prices?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch prices');
  return res.json();
}
