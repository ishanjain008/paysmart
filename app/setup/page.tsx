'use client';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import { CardSelector } from '@/components/CardSelector';
import { useProfile } from '@/lib/useProfile';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function SetupPage() {
  const router = useRouter();
  const { profile, toggleCard, completeSetup } = useProfile();

  const handleDone = () => {
    completeSetup();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
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

      <main className="flex-1 px-8 md:px-14 py-12 max-w-4xl">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">One-time setup</p>
        <h1 className={`${playfair.className} text-4xl font-bold text-gray-900 mb-2`}>
          Which cards do you carry?
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {profile.cardIds.length > 0
            ? `${profile.cardIds.length} card${profile.cardIds.length !== 1 ? 's' : ''} selected`
            : 'Select all that apply — takes about 60 seconds'}
        </p>

        <CardSelector selectedIds={profile.cardIds} onToggle={toggleCard} />

        <div className="mt-10">
          <button
            onClick={handleDone}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            {profile.cardIds.length > 0 ? `Done — find me deals →` : 'Skip for now'}
          </button>
        </div>
      </main>
    </div>
  );
}
