'use client';
import { useState } from 'react';
import { CARDS, CardType } from '@/data/cards';
import { CardTile } from '@/components/CardTile';
import { DesktopNav } from '@/components/DesktopNav';
import { useProfile } from '@/lib/useProfile';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

const TABS: { type: CardType; label: string }[] = [
  { type: 'credit', label: 'Credit cards' },
  { type: 'debit',  label: 'Debit cards' },
  { type: 'wallet', label: 'Wallets' },
];

export default function ProfilePage() {
  const { profile, toggleCard, clearProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<CardType>('credit');

  const cardsForTab = CARDS.filter((c) => c.type === activeTab);
  const selectedCount = profile.cardIds.length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12">
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

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-8">
          {TABS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === type
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
          {cardsForTab.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              selected={profile.cardIds.includes(card.id)}
              onToggle={() => toggleCard(card.id)}
            />
          ))}
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-3 bg-green-50 rounded-2xl p-4 max-w-lg">
          <ShieldCheck size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800 leading-relaxed">
            Your card list is stored only on this device (or synced to your account if signed in).
            We never see your card numbers, account details, or personal data.
          </p>
        </div>
      </main>
    </div>
  );
}
