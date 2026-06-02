'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CARDS, CardType } from '@/data/cards';
import { CardTile } from '@/components/CardTile';
import { useProfile } from '@/lib/useProfile';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

const STEPS: { type: CardType; label: string; sub: string }[] = [
  { type: 'credit', label: 'Credit cards',  sub: 'Select all that apply' },
  { type: 'debit',  label: 'Debit cards',   sub: 'Select all that apply' },
  { type: 'wallet', label: 'Wallets',       sub: 'Select all that apply' },
];

export default function SetupPage() {
  const router = useRouter();
  const { profile, toggleCard, completeSetup } = useProfile();
  const [step, setStep] = useState(0);

  const currentStep = STEPS[step];
  const cardsForStep = CARDS.filter((c) => c.type === currentStep.type);

  const handleDone = () => {
    completeSetup();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 md:px-14 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className={`${playfair.className} text-xl font-bold text-gray-900`}>PaySmart</span>
        </div>
        <button
          onClick={handleDone}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <main className="flex-1 px-8 md:px-14 py-12 max-w-4xl">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className={`${playfair.className} text-4xl font-bold text-gray-900 mb-2`}>
          {currentStep.label}
        </h1>
        <p className="text-gray-400 text-sm mb-10">{currentStep.sub} · takes about 60 seconds total</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
          {cardsForStep.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              selected={profile.cardIds.includes(card.id)}
              onToggle={() => toggleCard(card.id)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="border border-gray-200 text-gray-600 text-sm font-medium px-6 py-3 rounded-xl hover:border-gray-300 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={step < STEPS.length - 1 ? () => setStep(step + 1) : handleDone}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            {step < STEPS.length - 1 ? 'Continue →' : 'Done — find me deals'}
          </button>
        </div>
      </main>
    </div>
  );
}
