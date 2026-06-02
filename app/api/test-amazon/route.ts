import type { NextRequest } from 'next/server';
import { searchAmazonProduct } from '@/lib/amazon-api';

export async function GET(request: NextRequest) {
  try {
    console.log('[test-amazon] Starting test');
    const result = await searchAmazonProduct('iPhone 16');
    console.log('[test-amazon] Result:', result);
    return Response.json({ success: true, result });
  } catch (error) {
    console.error('[test-amazon] Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
