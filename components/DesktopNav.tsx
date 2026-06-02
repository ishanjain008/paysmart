'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { UserButton } from './Nav';
import { useProfile } from '@/lib/useProfile';

const playfair = Playfair_Display({ subsets: ['latin'] });

interface DesktopNavProps {
  back?: string;
  backLabel?: string;
}

export function DesktopNav({ back, backLabel = 'Back' }: DesktopNavProps) {
  const { profile, loaded } = useProfile();
  const cardCount = profile.cardIds.length;

  return (
    <header className="flex items-center justify-between px-8 md:px-14 py-5 border-b border-gray-100">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className={`${playfair.className} text-xl font-bold text-gray-900 tracking-tight`}>
            PaySmart
          </span>
        </Link>
        {back && (
          <Link
            href={back}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors"
        >
          <span className="text-base">👜</span>
          <span className="text-sm text-gray-500">Wallet</span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-sm font-semibold text-gray-900">
            {loaded ? cardCount : '—'} cards
          </span>
        </Link>
        <UserButton />
      </div>
    </header>
  );
}
