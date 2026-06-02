import crypto from 'crypto';

const AWS_REGION = 'us-east-1';
const HOST = 'webservices.amazon.in';

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

export async function GET() {
  try {
    const AMAZON_ASSOCIATE_ID = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || '';
    const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
    const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

    if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AMAZON_ASSOCIATE_ID) {
      return Response.json({ error: 'Credentials missing' });
    }

    const query = 'iPhone 16';
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

    console.log('[debug-amazon] Making request with auth header:', authorizationHeader.substring(0, 100));

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

    console.log('[debug-amazon] Response status:', response.status);

    const responseText = await response.text();
    console.log('[debug-amazon] Response text:', responseText.substring(0, 300));

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { parseError: responseText.substring(0, 200) };
    }

    return Response.json({
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      credentialScope,
      signatureKeyHash: crypto.createHash('sha256').update(signingKey.toString('hex')).digest('hex'),
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
