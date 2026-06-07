import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Analytics } from '@vercel/analytics/react';

const BASE = 'https://paysmart-eight.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'PaySmart — Find Your Real Best Price',
    template: '%s — PaySmart',
  },
  description: 'Compare electronics prices across Amazon, Flipkart, Croma, Vijay Sales and Reliance Digital. See the lowest effective price after your card cashback and bank offers.',
  keywords: ['price comparison', 'cashback calculator', 'bank offers', 'electronics', 'India', 'Amazon', 'Flipkart', 'Croma'],
  openGraph: {
    title: 'PaySmart — Find Your Real Best Price',
    description: 'Know your real best price — for the cards you carry. Compare across 5 stores, apply your cashback automatically.',
    url: BASE,
    siteName: 'PaySmart',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PaySmart — Find Your Real Best Price',
    description: 'Know your real best price — for the cards you carry.',
  },
  robots: { index: true, follow: true },
  other: {
    'verify-admitad': '02783d3c66',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }} className="bg-white">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
