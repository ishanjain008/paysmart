import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { Footer } from '@/components/Footer';
import type { Metadata } from 'next';

const playfair = Playfair_Display({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Privacy Policy — PaySmart',
  description: 'How PaySmart collects, uses, and protects your data.',
};

const SECTIONS = [
  {
    title: 'What we collect',
    body: `When you use PaySmart without signing in, we collect nothing. Your card selections are stored locally in your browser and never leave your device.

If you choose to sign in with Google, we receive your name, email address, and profile photo from Google. We use these only to identify your account and sync your card list across devices. We do not store payment credentials, card numbers, CVVs, or any financial account information.

We also collect standard server logs (IP address, browser type, pages visited) to operate and improve the service. These logs are retained for a maximum of 30 days.`,
  },
  {
    title: 'How we use it',
    body: `We use your information solely to provide the PaySmart service:
• Your card list is used to calculate personalised effective prices
• Your email is used to identify your account — we do not send marketing emails
• Server logs are used for debugging and abuse prevention`,
  },
  {
    title: 'Data storage',
    body: `Card preferences for signed-in users are stored in Google Firebase (Firestore), hosted in the United States. Google's privacy policy applies to data stored in Firebase.

If you are not signed in, all data is stored in your browser's localStorage and never transmitted to our servers.`,
  },
  {
    title: 'Third-party services',
    body: `PaySmart uses the following third-party services:
• Google Firebase — authentication and database
• Serper.dev — fetching price data from Google Shopping
• Vercel — website hosting and analytics
• Anthropic — AI-powered offer extraction (no user data is sent)

Each service has its own privacy policy governing its data use.`,
  },
  {
    title: 'Your rights',
    body: `You can delete your account data at any time by signing in and clicking "Clear saved cards", which removes all stored data from our systems. You can also sign out to stop syncing and revert to local-only storage.

To request complete deletion of your account data, email us at the address below.`,
  },
  {
    title: 'Cookies',
    body: `PaySmart uses only functional cookies required to maintain your session when signed in. We do not use advertising or tracking cookies.`,
  },
  {
    title: 'Changes to this policy',
    body: `We may update this policy as the service evolves. Material changes will be noted on this page with an updated date.`,
  },
  {
    title: 'Contact',
    body: `For privacy questions or data deletion requests: ishanjain008@gmail.com`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-3xl">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Legal</p>
        <h1 className={`${playfair.className} text-5xl font-bold text-gray-900 mb-2`}>Privacy Policy</h1>
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
