const AMAZON_ASSOCIATE_ID = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || '';
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

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
  if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AMAZON_ASSOCIATE_ID) {
    console.warn('Amazon API credentials not configured');
    return null;
  }

  try {
    // Get the base URL for API calls
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/amazon-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error(`Amazon search error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching Amazon:', error);
    return null;
  }
}
