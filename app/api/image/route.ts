import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new Response('Missing url', { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { 'Referer': 'https://www.google.com/' },
    });
    if (!res.ok) return new Response('Image not found', { status: 404 });

    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Failed to fetch image', { status: 500 });
  }
}
