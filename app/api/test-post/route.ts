import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { test } = await request.json();
    return Response.json({ success: true, received: test });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
