import crypto from 'crypto';

const AWS_REGION = 'us-east-1';
const HOST = 'webservices.amazon.in';

interface AmazonProduct {
  asin: string;
  title: string;
  price: number;
  url: string;
}

function hmacSha256(data: string, key: string | Buffer): Buffer {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = hmacSha256(dateStamp, `AWS4${key}`);
  const kRegion = hmacSha256(regionName, kDate);
  const kService = hmacSha256(serviceName, kRegion);
  const kSigning = hmacSha256('aws4_request', kService);
  return kSigning;
}

/**
 * Search for a product on Amazon using Product Advertising API
 * Returns direct product link with affiliate tag
 * This function contains the actual API logic - no internal HTTP calls
 */
export async function searchAmazonProduct(query: string): Promise<AmazonProduct | null> {
  try {
    // Read environment variables at runtime
    const AMAZON_ASSOCIATE_ID = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || '';
    const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
    const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

    console.log('[searchAmazonProduct] Starting with query:', query);

    if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AMAZON_ASSOCIATE_ID) {
      console.warn('[searchAmazonProduct] Credentials not configured');
      return null;
    }

    const timestamp = new Date().toISOString();
    const amzDate = timestamp.replace(/[:-]|\.\d{3}/g, '');
    const datestamp = amzDate.split('T')[0];

    const payload = {
      KeyWords: query,
      Resources: ['ItemInfo.Title', 'Offers.Listings.Price'],
      PartnerTag: AMAZON_ASSOCIATE_ID,
      SearchIndex: 'All',
      MaxResults: 1,
    };

    const payloadStr = JSON.stringify(payload);
    const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

    const canonicalUri = '/paapi5/searchitems';
    const canonicalQuerystring = '';
    const canonicalHeaders = `content-type:application/x-amz-json-1.1\nhost:${HOST}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-date';

    const canonicalRequest = `POST\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');

    const credentialScope = `${datestamp}/${AWS_REGION}/ProductAdvertisingAPI/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

    const signingKey = getSignatureKey(AWS_SECRET_KEY, datestamp, AWS_REGION, 'ProductAdvertisingAPI');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(`https://${HOST}/paapi5/searchitems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'Host': HOST,
        'X-Amz-Date': amzDate,
        'Authorization': authorizationHeader,
      },
      body: payloadStr,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[searchAmazonProduct] API error: ${response.status}`, error.substring(0, 200));
      return null;
    }

    const data = await response.json();
    console.log('[searchAmazonProduct] API response:', JSON.stringify(data).substring(0, 500));
    const item = data.SearchResult?.Items?.[0];

    if (!item?.ASIN) {
      console.warn('[searchAmazonProduct] No products found', {
        hasSearchResult: !!data.SearchResult,
        itemCount: data.SearchResult?.Items?.length,
        dataKeys: Object.keys(data).join(',')
      });
      return null;
    }

    const asin = item.ASIN;
    const title = item.ItemInfo?.Title?.DisplayValue || query;
    const priceStr = item.Offers?.Listings?.[0]?.Price?.Amount || '0';
    const price = parseInt(priceStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
    console.log('[searchAmazonProduct] Extracted:', { asin, titleLength: title.length, price });

    const product: AmazonProduct = {
      asin,
      title,
      price,
      url: `https://www.amazon.in/dp/${asin}?tag=${AMAZON_ASSOCIATE_ID}`,
    };

    console.log('[searchAmazonProduct] Found:', product.title);
    return product;
  } catch (error) {
    console.error('[searchAmazonProduct] Exception:', error);
    return null;
  }
}
