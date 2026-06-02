import crypto from 'crypto';

const AMAZON_ASSOCIATE_ID = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || '';
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const AWS_REGION = 'us-east-1';
const SERVICE = 'ProductAdvertisingAPI';
const HOST = `webservices.amazon.${process.env.AMAZON_REGION_DOMAIN || 'in'}`;
const ACTION = 'SearchItems';

interface AmazonProduct {
  asin: string;
  title: string;
  price: number;
  url: string;
}

function sign(stringToSign: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('base64');
}

export async function searchAmazonProduct(query: string): Promise<AmazonProduct | null> {
  if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AMAZON_ASSOCIATE_ID) {
    return null;
  }

  try {
    const timestamp = new Date().toISOString();
    const payload = {
      KeyWords: query,
      Resources: ['Images.Primary.Medium', 'ItemInfo.Title', 'Offers.Listings.Price'],
      PartnerTag: AMAZON_ASSOCIATE_ID,
      SearchIndex: 'All',
      MaxResults: 1,
    };

    const response = await fetch(`https://${HOST}/paapi5/searchitems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'Host': HOST,
        'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`,
        'Authorization': generateAuthHeader(timestamp, payload),
        'X-Amz-Date': timestamp,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Amazon API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const item = data.SearchResult?.Items?.[0];

    if (!item) return null;

    const asin = item.ASIN;
    const title = item.ItemInfo?.Title?.DisplayValue || '';
    const price = parseInt(
      (item.Offers?.Listings?.[0]?.Price?.Amount || '0').toString().replace(/[^0-9]/g, ''),
      10
    );

    const url = `https://www.amazon.in/dp/${asin}?tag=${AMAZON_ASSOCIATE_ID}`;

    return { asin, title, price, url };
  } catch (error) {
    console.error('Error searching Amazon:', error);
    return null;
  }
}

function generateAuthHeader(timestamp: string, payload: object): string {
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${timestamp.split('T')[0]}/${AWS_REGION}/${SERVICE}/aws4_request`;
  const payloadHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');

  const canonicalRequest = [
    'POST',
    '/paapi5/searchitems',
    '',
    `host:${HOST}`,
    'x-amz-date:' + timestamp,
    '',
    'host;x-amz-date',
    payloadHash,
  ].join('\n');

  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const signature = sign(stringToSign, `AWS4${AWS_SECRET_KEY}`);
  const credential = `${AWS_ACCESS_KEY}/${credentialScope}`;

  return `${algorithm} Credential=${credential}, SignedHeaders=host;x-amz-date, Signature=${signature}`;
}
