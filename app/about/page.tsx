import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { Footer } from '@/components/Footer';
import type { Metadata } from 'next';

const playfair = Playfair_Display({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'About — PaySmart',
  description: 'How PaySmart finds your real best price across Amazon, Flipkart, Croma, Vijay Sales and Reliance Digital.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-3xl">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">About</p>
        <h1 className={`${playfair.className} text-5xl font-bold text-gray-900 mb-6 leading-tight`}>
          The price you see is rarely the price you pay.
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p>
            Every time you buy electronics online, banks and platforms are running dozens of overlapping
            offers — 10% off with HDFC, 5% cashback with SBI, reward points that convert to cash.
            The problem is that nobody shows you the <em>combined</em> picture for <em>your specific cards</em>.
          </p>

          <p>
            PaySmart fixes that. Tell us what you want to buy. We fetch the current price from
            Amazon, Flipkart, Croma, Vijay Sales, and Reliance Digital — then apply every bank offer
            and cashback rate your cards are eligible for — and surface the single lowest effective price.
          </p>

          <h2 className={`${playfair.className} text-2xl font-bold text-gray-900 mt-10 mb-3`}>How it works</h2>

          <div className="space-y-4">
            {[
              { n: '01', t: 'Search any product', d: 'We fetch live prices from 5 major Indian electronics retailers using Google Shopping data.' },
              { n: '02', t: 'Add your cards once', d: 'Select the credit cards, debit cards, and wallets you own. Stored only on your device.' },
              { n: '03', t: 'We do the maths', d: 'For every store × card combination, we calculate your effective price after cashback, reward points, and bank offers.' },
              { n: '04', t: 'See your real best deal', d: 'The top result is the lowest price you can actually pay given your wallet.' },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex gap-5">
                <div className={`${playfair.className} text-3xl font-bold text-gray-200 flex-shrink-0 w-10`}>{n}</div>
                <div>
                  <div className="font-semibold text-gray-800 mb-1">{t}</div>
                  <div className="text-sm text-gray-500">{d}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className={`${playfair.className} text-2xl font-bold text-gray-900 mt-10 mb-3`}>What we cover</h2>
          <p>
            PaySmart currently focuses on <strong>consumer electronics and home appliances</strong> —
            phones, laptops, tablets, headphones, TVs, and large appliances — across Amazon, Flipkart,
            Croma, Vijay Sales, and Reliance Digital.
          </p>

          <h2 className={`${playfair.className} text-2xl font-bold text-gray-900 mt-10 mb-3`}>Accuracy & freshness</h2>
          <p>
            Prices are fetched live from Google Shopping. Bank offers are updated periodically and
            verified manually. Prices and offers can change without notice — always confirm the final
            amount at checkout before completing a payment.
          </p>

          <h2 className={`${playfair.className} text-2xl font-bold text-gray-900 mt-10 mb-3`}>Your data</h2>
          <p>
            We store only which cards you have selected — no card numbers, no transaction history,
            no personal financial data. If you sign in with Google, your card list syncs across your
            devices via Firebase. If you don&apos;t sign in, everything stays in your browser only.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
