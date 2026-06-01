'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CARDS, CardType } from '@/data/cards';
import { CardTile } from '@/components/CardTile';
import { TopNav } from '@/components/Nav';
import { useProfile } from '@/lib/useProfile';

const STEPS: { type: CardType; label: string; sub: string }[] = [
  { type: 'credit', label: 'Credit cards', sub: 'Select all that apply' },
  { type: 'debit',  label: 'Debit cards',  sub: 'Select all that apply' },
  { type: 'wallet', label: 'Wallets',      sub: 'Select all that apply' },
];

export default function SetupPage() {
  const router = useRouter();
  const { profile, toggleCard, completeSetup } = useProfile();
  const [step, setStep] = useState(0);

  const currentStep = STEPS[step];
  const cardsForStep = CARDS.filter((c) => c.type === currentStep.type);
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      completeSetup();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 bg-white z-10">
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="text-base font-semibold text-blue-700">PaySmart</div>
          <button onClick={() => { completeSetup(); router.push('/'); }}
            className="text-xs text-gray-400 hover:text-gray-600">
            Skip
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className="flex-1 px-5 pt-6 pb-24">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Which cards do you have?</h2>
          <p className="text-sm text-gray-500">Takes about 60 seconds. No account needed.</p>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium text-gray-700">{currentStep.label}</div>
          <div className="text-xs text-gray-400">Step {step + 1} of {STEPS.length}</div>
        </div>
        <div className="text-xs text-gray-400 mb-4">{currentStep.sub}</div>

        <div className="grid grid-cols-2 gap-2">
          {cardsForStep.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              selected={profile.cardIds.includes(card.id)}
              onToggle={() => toggleCard(card.id)}
            />
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-5 py-4 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-gray-300">
            Back
          </button>
        )}
        <button onClick={handleNext}
          className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">
          {step < STEPS.length - 1 ? 'Continue →' : 'Done'}
        </button>
      </div>
    </div>
  );
}
