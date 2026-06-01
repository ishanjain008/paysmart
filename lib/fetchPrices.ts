import { PlatformPrice } from './calculator';

export async function fetchPrices(query: string): Promise<PlatformPrice[]> {
  const res = await fetch(`/api/prices?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch prices');
  return res.json();
}
