import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q || q.length < 2) return Response.json({ shopping: [] });

  const apiKey = process.env.SERPER_KEY;
  if (!apiKey) {
    console.error('SERPER_KEY not set in environment');
    return Response.json({ shopping: [], error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q, gl: 'in', hl: 'en', num: 8 }),
    });
    if (!res.ok) {
      console.error('Serper API error:', res.status, res.statusText);
      return Response.json({ shopping: [] });
    }
    return res.json();
  } catch (e) {
    console.error('Search API error:', e);
    return Response.json({ shopping: [] });
  }
}
