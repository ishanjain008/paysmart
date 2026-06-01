'use client';
import { useState } from 'react';
import { CARDS, CardType } from '@/data/cards';
import { CardTile } from '@/components/CardTile';
import { BottomNav, TopNav } from '@/components/Nav';
import { useProfile } from '@/lib/useProfile';
import { ShieldCheck, Trash2 } from 'lucide-react';

const TABS: { type: CardType; label: string }[] = [
  { type: 'credit', label: 'Credit' },
  { type: 'debit',  label: 'Debit' },
  { type: 'wallet', label: 'Wallets' },
];

export default function ProfilePage() {
  const { profile, toggleCard, clearProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<CardType>('credit');

  const cardsForTab = CARDS.filter((c) => c.type === activeTab);
  const selectedCount = profile.cardIds.length;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <TopNav title="My cards" back="/" />

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {TABS.map(({ type, label }) => (
          <button key={type} onClick={() => setActiveTab(type)}
            className={`flex-1 py-2.5 text-sm transition-colors ${
              activeTab === type
                ? 'text-blue-600 font-medium border-b-2 border-blue-600'
                : 'text-gray-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 pb-24 px-4 pt-4">
        <div className="text-xs text-gray-400 mb-4">
          {selectedCount} card{selectedCount !== 1 ? 's' : ''} selected. Changes save instantly.
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
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
        <div className="flex items-start gap-2.5 bg-green-50 rounded-xl p-3 mb-4">
          <ShieldCheck size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-800 leading-relaxed">
            Your card list is stored only on this device. We never see your card numbers, account details, or personal data.
          </p>
        </div>

        {/* Clear data */}
        {selectedCount > 0 && (
          <button onClick={() => { if (confirm('Clear all saved cards?')) clearProfile(); }}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 transition-colors">
            <Trash2 size={12} />
            Clear saved cards
          </button>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
