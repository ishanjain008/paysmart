import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    console.log('[test-amazon] Testing POST routes from:', baseUrl);

    // Test 1: Minimal POST route
    console.log('[test-amazon] Test 1: Calling /api/test-post');
    const testPostResponse = await fetch(`${baseUrl}/api/test-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'hello' }),
    });
    console.log('[test-amazon] test-post status:', testPostResponse.status);
    const testPostText = await testPostResponse.text();
    console.log('[test-amazon] test-post response text:', testPostText.substring(0, 200));

    let testPostData: any;
    try {
      testPostData = JSON.parse(testPostText);
    } catch (e) {
      testPostData = { parseError: testPostText.substring(0, 100) };
    }

    // Test 2: Amazon search route
    console.log('[test-amazon] Test 2: Calling /api/amazon-search');
    const amazonResponse = await fetch(`${baseUrl}/api/amazon-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'iPhone 16' }),
    });
    console.log('[test-amazon] amazon-search status:', amazonResponse.status);
    const amazonText = await amazonResponse.text();
    console.log('[test-amazon] amazon-search response text:', amazonText.substring(0, 200));

    let amazonData: any;
    try {
      amazonData = JSON.parse(amazonText);
    } catch (e) {
      amazonData = { parseError: amazonText.substring(0, 100) };
    }

    return Response.json({
      testPost: { status: testPostResponse.status, data: testPostData },
      amazonSearch: { status: amazonResponse.status, data: amazonData }
    });
  } catch (error) {
    console.error('[test-amazon] Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
