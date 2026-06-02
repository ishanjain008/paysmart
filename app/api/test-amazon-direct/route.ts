import { searchAmazonProduct } from '@/lib/amazon-api';

export async function GET() {
  try {
    const result = await searchAmazonProduct('iPhone 16');
    return Response.json({ result, success: !!result });
  } catch (error) {
    return Response.json({ error: String(error), success: false }, { status: 500 });
  }
}
