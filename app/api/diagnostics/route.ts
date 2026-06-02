import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return Response.json({
    message: 'Diagnostics endpoint is working',
    timestamp: new Date().toISOString(),
    env: {
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV,
      hasAWSKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasAWSSecret: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasAssociateId: !!process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID,
    }
  });
}
