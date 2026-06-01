'use client';
import { Check } from 'lucide-react';
import { Card } from '@/data/cards';

interface CardTileProps {
  card: Card;
  selected: boolean;
  onToggle: () => void;
}

export function CardTile({ card, selected, onToggle }: CardTileProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div
        className="w-9 h-6 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
        style={{ backgroundColor: card.color }}
      >
        {card.shortName}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-800 truncate">{card.name}</div>
        <div className="text-[10px] text-gray-500">{card.bank}</div>
      </div>
      <div className={`flex-shrink-0 transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}>
        <Check size={14} className="text-blue-600" />
      </div>
    </button>
  );
}
