'use client';
import { useState } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { CARDS, Card, CardType } from '@/data/cards';

interface Props {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

// Map keywords in binlist bank names → our bank display names
const BANK_KEYWORDS: [string, string][] = [
  ['HDFC',               'HDFC Bank'],
  ['AXIS',               'Axis Bank'],
  ['ICICI',              'ICICI Bank'],
  ['STATE BANK',         'SBI Card'],
  ['SBI',                'SBI Card'],
  ['KOTAK',              'Kotak Bank'],
  ['IDFC',               'IDFC First'],
  ['AMERICAN EXPRESS',   'American Express'],
  ['AMEX',               'American Express'],
  ['YES BANK',           'YES Bank'],
  ['AU SMALL',           'AU Small Finance'],
  ['STANDARD CHARTERED', 'Standard Chartered'],
  ['ONE97',              'OneCard'],
];

function matchBankFromBin(rawName: string): string | null {
  const upper = rawName.toUpperCase();
  for (const [kw, name] of BANK_KEYWORDS) {
    if (upper.includes(kw)) return name;
  }
  return null;
}

async function fetchBin(bin: string): Promise<string | null> {
  try {
    const res = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { 'Accept-Version': '3' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return matchBankFromBin(data?.bank?.name ?? '');
  } catch { return null; }
}

// Group credit cards by bank, preserving order
function groupByBank(cards: Card[]): Map<string, Card[]> {
  const map = new Map<string, Card[]>();
  for (const card of cards) {
    const list = map.get(card.bank) ?? [];
    list.push(card);
    map.set(card.bank, list);
  }
  return map;
}

function CardRow({ card, selected, onToggle }: { card: Card; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
        selected ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'
      }`}
    >
      <div
        className="w-10 h-6 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
        style={{ backgroundColor: card.color }}
      >
        {card.shortName}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-800 truncate">{card.name}</div>
        <div className="text-[10px] text-gray-400">{card.bank}</div>
      </div>
      {selected && <Check size={14} className="text-blue-600 flex-shrink-0" />}
    </button>
  );
}

function BankAccordion({
  bank, cards, selectedIds, onToggle, open, onToggleOpen,
}: {
  bank: string; cards: Card[]; selectedIds: string[];
  onToggle: (id: string) => void; open: boolean; onToggleOpen: () => void;
}) {
  const selectedCount = cards.filter(c => selectedIds.includes(c.id)).length;

  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${open ? 'border-blue-200' : 'border-gray-100'}`}>
      <button
        onClick={onToggleOpen}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${open ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-3">
          <span className={`font-semibold text-sm ${open ? 'text-blue-700' : 'text-gray-800'}`}>{bank}</span>
          {selectedCount > 0 && (
            <span className="text-[11px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
              {selectedCount}
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180 text-blue-500' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cards.map(card => (
            <CardRow
              key={card.id}
              card={card}
              selected={selectedIds.includes(card.id)}
              onToggle={() => onToggle(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CardSelector({ selectedIds, onToggle }: Props) {
  const [binInput, setBinInput]     = useState('');
  const [binLoading, setBinLoading] = useState(false);
  const [binHint, setBinHint]       = useState('');
  const [expandedBank, setExpandedBank] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<CardType>('credit');

  const handleBinChange = async (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    setBinInput(digits);
    setBinHint('');

    if (digits.length === 6) {
      setBinLoading(true);
      const bank = await fetchBin(digits);
      setBinLoading(false);
      if (bank) {
        setActiveType('credit');
        setExpandedBank(bank);
        setBinHint(`Found: ${bank} — select your card below`);
      } else {
        setBinHint('Card not found — browse your bank below');
      }
    }
  };

  const creditByBank = groupByBank(CARDS.filter(c => c.type === 'credit'));
  const debitCards   = CARDS.filter(c => c.type === 'debit');
  const wallets      = CARDS.filter(c => c.type === 'wallet');

  const TABS: { type: CardType; label: string }[] = [
    { type: 'credit', label: 'Credit cards' },
    { type: 'debit',  label: 'Debit cards' },
    { type: 'wallet', label: 'Wallets' },
  ];

  return (
    <div>
      {/* BIN finder */}
      <div className="mb-8 p-5 bg-gray-50 rounded-2xl max-w-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          Know your card number?
        </p>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            maxLength={7}
            placeholder="Enter first 6 digits…"
            value={binInput.replace(/^(\d{4})(\d)/, '$1 $2')}
            onChange={e => handleBinChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 pr-10 tracking-widest"
          />
          {binLoading && (
            <Loader2 size={15} className="absolute right-3 top-3 text-blue-500 animate-spin" />
          )}
        </div>
        {binHint && (
          <p className={`text-xs mt-1.5 ${binHint.startsWith('Found') ? 'text-green-600' : 'text-amber-600'}`}>
            {binHint}
          </p>
        )}
        <p className="text-[11px] text-gray-400 mt-1.5">We never store or transmit your card number.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
        {TABS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Credit: bank accordion */}
      {activeType === 'credit' && (
        <div className="space-y-2">
          {Array.from(creditByBank.entries()).map(([bank, cards]) => (
            <BankAccordion
              key={bank}
              bank={bank}
              cards={cards}
              selectedIds={selectedIds}
              onToggle={onToggle}
              open={expandedBank === bank}
              onToggleOpen={() => setExpandedBank(expandedBank === bank ? null : bank)}
            />
          ))}
        </div>
      )}

      {/* Debit: flat grid */}
      {activeType === 'debit' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {debitCards.map(card => (
            <CardRow
              key={card.id}
              card={card}
              selected={selectedIds.includes(card.id)}
              onToggle={() => onToggle(card.id)}
            />
          ))}
        </div>
      )}

      {/* Wallets: flat grid */}
      {activeType === 'wallet' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {wallets.map(card => (
            <CardRow
              key={card.id}
              card={card}
              selected={selectedIds.includes(card.id)}
              onToggle={() => onToggle(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
