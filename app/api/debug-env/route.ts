import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return Response.json({
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    hasAssociateId: !!process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID,
    associateId: process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || 'NOT SET',
    vercelUrl: process.env.VERCEL_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
