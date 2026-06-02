import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q || q.length < 2) return Response.json({ shopping: [] });

  try {
    const res = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q, gl: 'in', hl: 'en', num: 8 }),
    });
    if (!res.ok) return Response.json({ shopping: [] });
    return res.json();
  } catch {
    return Response.json({ shopping: [] });
  }
}
