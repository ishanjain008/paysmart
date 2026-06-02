import { searchAmazonProduct } from '@/lib/amazon-api';

export async function GET() {
  console.log('[test-amazon-api] Starting test');
  console.log('[test-amazon-api] AWS_ACCESS_KEY_ID:', !!process.env.AWS_ACCESS_KEY_ID);
  console.log('[test-amazon-api] AWS_SECRET_ACCESS_KEY:', !!process.env.AWS_SECRET_ACCESS_KEY);
  console.log('[test-amazon-api] NEXT_PUBLIC_AMAZON_ASSOCIATE_ID:', process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID);

  try {
    const result = await searchAmazonProduct('Samsung Galaxy S25');
    console.log('[test-amazon-api] Result:', result);
    return Response.json({
      result,
      credentials: {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        associateId: process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID,
      }
    });
  } catch (error) {
    console.error('[test-amazon-api] Error:', error);
    return Response.json({
      error: String(error),
      credentials: {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        associateId: process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID,
      }
    }, { status: 500 });
  }
}
