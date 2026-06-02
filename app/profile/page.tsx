'use client';
import { useState } from 'react';
import { Plus, X, ShieldCheck, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { DesktopNav } from '@/components/DesktopNav';
import { Footer } from '@/components/Footer';
import { CardSelector } from '@/components/CardSelector';
import { useProfile } from '@/lib/useProfile';
import { CARDS, CardType } from '@/data/cards';

const playfair = Playfair_Display({ subsets: ['latin'] });

const TYPE_LABEL: Record<CardType, string> = {
  credit: 'Credit card',
  debit:  'Debit card',
  wallet: 'Wallet',
};

const TYPE_ICON: Record<CardType, typeof CreditCard> = {
  credit: CreditCard,
  debit:  CreditCard,
  wallet: Wallet,
};

export default function ProfilePage() {
  const { profile, toggleCard, clearProfile } = useProfile();
  const [showAdd, setShowAdd] = useState(false);

  const selectedCards = CARDS.filter(c => profile.cardIds.includes(c.id));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DesktopNav back="/" backLabel="Home" />

      <main className="flex-1 px-8 md:px-14 py-12 max-w-2xl">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className={`${playfair.className} text-4xl font-bold text-gray-900`}>My Wallet</h1>
          {selectedCards.length > 0 && (
            <button
              onClick={() => { if (confirm('Remove all saved cards?')) clearProfile(); }}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-10">
          {selectedCards.length === 0
            ? 'No payment methods added yet.'
            : `${selectedCards.length} payment method${selectedCards.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── Saved cards list ── */}
        {selectedCards.length > 0 && (
          <div className="space-y-3 mb-6">
            {selectedCards.map(card => {
              const Icon = TYPE_ICON[card.type];
              return (
                <div
                  key={card.id}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors"
                >
                  {/* Card colour badge */}
                  <div
                    className="w-14 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: card.color }}
                  >
                    {card.shortName}
                  </div>

                  {/* Card info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{card.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon size={11} className="text-gray-300" />
                      <span className="text-xs text-gray-400">{card.bank} · {TYPE_LABEL[card.type]}</span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => toggleCard(card.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                    aria-label={`Remove ${card.name}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Add card button ── */}
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2.5 text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-2xl px-5 py-3.5 transition-colors text-sm font-medium w-full max-w-xs"
          >
            <Plus size={16} />
            Add a card or payment method
          </button>
        )}

        {/* ── Inline add section ── */}
        {showAdd && (
          <div className="border border-blue-100 rounded-2xl p-6 bg-blue-50/30">
            <div className="flex items-center justify-between mb-5">
              <h2 className={`${playfair.className} text-xl font-bold text-gray-900`}>
                Add a payment method
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <CardSelector selectedIds={profile.cardIds} onToggle={toggleCard} />

            <button
              onClick={() => setShowAdd(false)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* ── Privacy note ── */}
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
