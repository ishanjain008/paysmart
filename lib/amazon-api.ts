interface AmazonProduct {
  asin: string;
  title: string;
  price: number;
  url: string;
}

/**
 * Search for a product on Amazon using Product Advertising API
 * Returns direct product link with affiliate tag
 */
export async function searchAmazonProduct(query: string): Promise<AmazonProduct | null> {
  // Read environment variables at runtime, not module load time
  const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
  const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
  const AMAZON_ASSOCIATE_ID = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || '';

  console.log('[searchAmazonProduct] Starting with query:', query);
  console.log('[searchAmazonProduct] AWS_ACCESS_KEY exists:', !!AWS_ACCESS_KEY);
  console.log('[searchAmazonProduct] AWS_SECRET_KEY exists:', !!AWS_SECRET_KEY);
  console.log('[searchAmazonProduct] AMAZON_ASSOCIATE_ID:', AMAZON_ASSOCIATE_ID);

  if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AMAZON_ASSOCIATE_ID) {
    console.warn('[searchAmazonProduct] Credentials not configured');
    return null;
  }

  try {
    // Get the base URL for API calls
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    console.log('[searchAmazonProduct] Base URL:', baseUrl);
    const fetchUrl = `${baseUrl}/api/amazon-search`;
    console.log('[searchAmazonProduct] Fetching from:', fetchUrl);

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    console.log('[searchAmazonProduct] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[searchAmazonProduct] Error: ${response.status}`, errorText);
      return null;
    }

    const result = await response.json();
    console.log('[searchAmazonProduct] Success:', result);
    return result;
  } catch (error) {
    console.error('[searchAmazonProduct] Exception:', error);
    return null;
  }
}
