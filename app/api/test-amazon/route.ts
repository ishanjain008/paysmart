import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    console.log('[test-amazon] Testing from:', baseUrl);
    console.log('[test-amazon] Calling:', `${baseUrl}/api/amazon-search`);

    const response = await fetch(`${baseUrl}/api/amazon-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'iPhone 16' }),
    });

    console.log('[test-amazon] Response status:', response.status);

    const data = await response.json();
    console.log('[test-amazon] Response data:', data);

    return Response.json({
      status: response.status,
      success: response.ok,
      data
    });
  } catch (error) {
    console.error('[test-amazon] Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
