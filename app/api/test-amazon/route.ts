import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    console.log('[test-amazon] Testing POST routes');

    // Test 1: Minimal POST route
    console.log('[test-amazon] Test 1: Calling /api/test-post');
    const testPostResponse = await fetch(`${baseUrl}/api/test-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'hello' }),
    });
    console.log('[test-amazon] test-post status:', testPostResponse.status);
    const testPostData = await testPostResponse.json();
    console.log('[test-amazon] test-post response:', testPostData);

    // Test 2: Amazon search route
    console.log('[test-amazon] Test 2: Calling /api/amazon-search');
    const amazonResponse = await fetch(`${baseUrl}/api/amazon-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'iPhone 16' }),
    });
    console.log('[test-amazon] amazon-search status:', amazonResponse.status);
    const amazonData = await amazonResponse.json();
    console.log('[test-amazon] amazon-search response:', amazonData);

    return Response.json({
      testPost: { status: testPostResponse.status, data: testPostData },
      amazonSearch: { status: amazonResponse.status, data: amazonData }
    });
  } catch (error) {
    console.error('[test-amazon] Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
