import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') ?? '';
    if (!q || q.length < 2) {
      return Response.json({ shopping: [] });
    }

    const apiKey = process.env.SERPER_KEY;
    if (!apiKey) {
      console.warn('SERPER_KEY environment variable not set');
      return Response.json({ shopping: [] });
    }

    const res = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q, gl: 'in', hl: 'en', num: 8 }),
    });

    if (!res.ok) {
      console.warn(`Serper API responded with ${res.status}`);
      return Response.json({ shopping: [] });
    }

    const data = await res.json();
    return Response.json(data || { shopping: [] });
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({ shopping: [] });
  }
}
