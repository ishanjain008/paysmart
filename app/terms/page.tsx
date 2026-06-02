import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { Footer } from '@/components/Footer';
import type { Metadata } from 'next';

const playfair = Playfair_Display({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Terms of Use — PaySmart',
  description: 'Terms and conditions for using PaySmart.',
};

const SECTIONS = [
  {
    title: 'Service description',
    body: `PaySmart is a price comparison and card-benefit calculator for Indian consumer electronics and home appliances. We aggregate publicly available price data and bank offer information to help users estimate the lowest effective price for a product given their payment cards.`,
  },
  {
    title: 'Accuracy disclaimer',
    body: `Prices, cashback rates, and bank offers displayed on PaySmart are indicative only. They are sourced from publicly available data and updated periodically but may not reflect real-time changes.

Prices can vary by seller, availability, pincode, and time. Bank offers may have eligibility conditions, caps, or validity periods not fully captured here. PaySmart makes no warranty that the effective price shown will match the amount charged at checkout.

Always verify the final price, applicable offer, and total payable amount before completing a purchase.`,
  },
  {
    title: 'No financial advice',
    body: `Nothing on PaySmart constitutes financial, banking, or investment advice. Information about credit cards and their benefits is provided for comparison purposes only. Consult your bank for accurate, personalised information about your card's benefits.`,
  },
  {
    title: 'Acceptable use',
    body: `You agree not to:
• Scrape, crawl, or systematically extract data from PaySmart
• Use the service for any unlawful purpose
• Attempt to reverse engineer, disable, or circumvent any part of the service
• Submit false or misleading information`,
  },
  {
    title: 'Intellectual property',
    body: `All content, design, and code on PaySmart is owned by PaySmart or its licensors. You may not reproduce or redistribute any part without prior written permission.`,
  },
  {
    title: 'Limitation of liability',
    body: `PaySmart is provided "as is" without any warranty. To the fullest extent permitted by law, PaySmart and its operators shall not be liable for any direct, indirect, incidental, or consequential loss arising from your use of this service or reliance on price or offer information displayed.`,
  },
  {
    title: 'Third-party links',
    body: `PaySmart links to retailer product pages. We are not responsible for the content, pricing, or practices of third-party websites. Clicking a "Buy on [store]" link takes you to that store's website, governed by their own terms.`,
  },
  {
    title: 'Changes to terms',
    body: `We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the revised terms.`,
  },
  {
    title: 'Governing law',
    body: `These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.`,
  },
  {
    title: 'Contact',
    body: `Questions about these terms: ishanjain008@gmail.com`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-3xl">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Legal</p>
        <h1 className={`${playfair.className} text-5xl font-bold text-gray-900 mb-2`}>Terms of Use</h1>
        <p className="text-sm text-gray-400 mb-12">Last updated: 2 June 2026</p>

        <div className="space-y-10">
          {SECTIONS.map(({ title, body }) => (
            <div key={title}>
              <h2 className={`${playfair.className} text-xl font-bold text-gray-900 mb-3`}>{title}</h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{body}</div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
