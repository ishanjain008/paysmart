import type { NextRequest } from 'next/server';

type Platform = 'amazon' | 'flipkart' | 'croma' | 'vijay_sales' | 'reliance_digital';

interface ExtractedProduct {
  title: string;
  platform: Platform;
  error?: string;
}

function getPlatformFromUrl(url: string): Platform | null {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('amazon.in')) return 'amazon';
  if (urlLower.includes('flipkart.com')) return 'flipkart';
  if (urlLower.includes('croma.com')) return 'croma';
  if (urlLower.includes('vijaysales.com')) return 'vijay_sales';
  if (urlLower.includes('reliancedigital')) return 'reliance_digital';
  return null;
}

async function extractFromUrl(url: string): Promise<string | null> {
  try {
    // For Amazon URLs, try to extract from the URL itself first
    if (url.includes('amazon.')) {
      const asinMatch = url.match(/\/dp\/([A-Z0-9]+)/);
      const titleMatch = url.match(/^.*?\/([^/]+?)(?:\/dp\/|$)/);
      if (titleMatch) {
        let title = titleMatch[1]
          .replace(/-/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        // Clean up common URL artifacts
        title = title.replace(/ref=.*$/i, '').trim();
        if (title.length > 5) return title;
      }
    }

    // For Flipkart URLs, extract product name from URL
    if (url.includes('flipkart.')) {
      const pathMatch = url.match(/\/p\/([^?]+)/);
      if (pathMatch) {
        let title = pathMatch[1]
          .replace(/-/g, ' ')
          .replace(/[a-z0-9]{16}$/, '') // Remove SKU
          .trim();
        if (title.length > 5) return title;
      }
    }

    // Fetch the page content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const html = await res.text();

    // Try to extract from Open Graph meta tag (most reliable)
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      let title = ogTitleMatch[1].trim();
      title = title.replace(/\s*[-|]\s*(Amazon|Flipkart|Croma|Vijay Sales|Reliance Digital|Online Shopping|Buy.*?|Price.*?|Product).*$/i, '');
      return title.trim();
    }

    // Try to extract from title tag
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      let title = titleMatch[1];
      title = title.replace(/\s*[-|]\s*(Amazon|Flipkart|Croma|Vijay Sales|Reliance Digital|Online Shopping|Buy.*?|Price.*?|Product).*$/i, '');
      if (title.trim().length > 5) return title.trim();
    }

    // Try to extract from h1 tag
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      const title = h1Match[1].trim();
      if (title.length > 5) return title;
    }

    // Last resort: look for common product title patterns
    const spanMatch = html.match(/<span[^>]*id=["']productTitle["'][^>]*>([^<]+)<\/span>/i);
    if (spanMatch) return spanMatch[1].trim();

    return null;
  } catch (error) {
    console.error('Error extracting product from URL:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return Response.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Check if platform is supported
    const platform = getPlatformFromUrl(validUrl.toString());
    if (!platform) {
      return Response.json({
        error: 'Unsupported platform. Please use: Amazon, Flipkart, Croma, Vijay Sales, or Reliance Digital',
      }, { status: 400 });
    }

    // Extract product title from the URL
    const title = await extractFromUrl(validUrl.toString());

    if (!title) {
      return Response.json({
        error: 'Could not extract product details from the URL. Please try another link.',
      }, { status: 400 });
    }

    return Response.json({ title, platform });
  } catch (error) {
    console.error('Extract product error:', error);
    return Response.json({ error: 'Failed to process URL' }, { status: 500 });
  }
}
