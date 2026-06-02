'use client';
import { DesktopNav } from '@/components/DesktopNav';
import { Footer } from '@/components/Footer';
import { CardSelector } from '@/components/CardSelector';
import { useProfile } from '@/lib/useProfile';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function ProfilePage() {
  const { profile, toggleCard, clearProfile } = useProfile();
  const selectedCount = profile.cardIds.length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-4xl">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className={`${playfair.className} text-4xl font-bold text-gray-900`}>My Cards</h1>
          {selectedCount > 0 && (
            <button
              onClick={() => { if (confirm('Clear all saved cards?')) clearProfile(); }}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={13} />
              Clear all
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-8">
          {selectedCount} card{selectedCount !== 1 ? 's' : ''} selected · changes save instantly
        </p>

        <CardSelector selectedIds={profile.cardIds} onToggle={toggleCard} />

        <div className="flex items-start gap-3 bg-green-50 rounded-2xl p-4 max-w-lg mt-10">
          <ShieldCheck size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800 leading-relaxed">
            Your card list is stored only on this device (or synced to your account if signed in).
            We never see your card numbers, account details, or personal data.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
