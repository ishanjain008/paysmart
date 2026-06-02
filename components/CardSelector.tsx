'use client';
import { useState } from 'react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { CARDS, Card, CardType } from '@/data/cards';

interface Props {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

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
      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all w-full ${
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
        <div className="text-sm font-semibold text-gray-800 truncate">{card.name}</div>
        <div className="text-xs text-gray-400">{card.bank}</div>
      </div>
      {selected && <Check size={14} className="text-blue-600 flex-shrink-0" />}
    </button>
  );
}

function DropdownSection({
  type, cardsByGroup, selectedIds, onToggle,
  selectedBank, setSelectedBank,
  label, placeholder, emptyText, subLabel,
}: {
  type: CardType;
  cardsByGroup: Map<string, Card[]>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  selectedBank: string;
  setSelectedBank: (b: string) => void;
  label: string;
  placeholder: string;
  emptyText: string;
  subLabel: string;
}) {
  const groups = Array.from(cardsByGroup.keys());
  const cardsForGroup = selectedBank ? (cardsByGroup.get(selectedBank) ?? []) : [];
  const selectedOfType = selectedIds.filter(id => CARDS.find(c => c.id === id && c.type === type));

  return (
    <div>
      {/* Dropdown */}
      <div className="relative mb-6 max-w-xs">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
          {label}
        </label>
        <div className="relative">
          <select
            value={selectedBank}
            onChange={e => setSelectedBank(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 pr-10 cursor-pointer"
          >
            <option value="">{placeholder}</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Cards for selected group */}
      {selectedBank && cardsForGroup.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-3">{subLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cardsForGroup.map(card => (
              <CardRow key={card.id} card={card}
                selected={selectedIds.includes(card.id)} onToggle={() => onToggle(card.id)} />
            ))}
          </div>
        </div>
      )}

      {!selectedBank && <p className="text-sm text-gray-400">{emptyText}</p>}

      {/* Selected chips summary */}
      {selectedOfType.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Selected</p>
          <div className="flex flex-wrap gap-2">
            {selectedOfType
              .map(id => CARDS.find(c => c.id === id))
              .filter(Boolean)
              .map(card => card && (
                <div key={card.id}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full pl-2 pr-3 py-1">
                  <div className="w-6 h-4 rounded text-[8px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: card.color }}>
                    {card.shortName}
                  </div>
                  <span className="text-xs font-medium text-blue-800">{card.name}</span>
                  <button onClick={() => onToggle(card.id)} className="text-blue-400 hover:text-blue-600 ml-0.5">
                    <X size={11} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TABS: { type: CardType; label: string }[] = [
  { type: 'credit', label: 'Credit cards' },
  { type: 'debit',  label: 'Debit cards' },
  { type: 'wallet', label: 'Wallets' },
];

export function CardSelector({ selectedIds, onToggle }: Props) {
  const [activeType, setActiveType]   = useState<CardType>('credit');
  const [selectedBank, setSelectedBank] = useState('');
  const [binInput, setBinInput]       = useState('');
  const [binLoading, setBinLoading]   = useState(false);
  const [binMessage, setBinMessage]   = useState('');
  const [binStatus, setBinStatus]     = useState<'idle' | 'found' | 'notfound'>('idle');

  const creditByBank = groupByBank(CARDS.filter(c => c.type === 'credit'));
  const debitCards   = CARDS.filter(c => c.type === 'debit');
  const wallets      = CARDS.filter(c => c.type === 'wallet');
  const banks        = Array.from(creditByBank.keys());

  const cardsForBank = selectedBank ? (creditByBank.get(selectedBank) ?? []) : [];

  const handleBinChange = async (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    setBinInput(digits);
    setBinMessage('');
    setBinStatus('idle');

    if (digits.length === 6) {
      setBinLoading(true);
      try {
        const res = await fetch(`/api/bin?bin=${digits}`);
        const data = await res.json();
        if (data.cardId) {
          // Direct card match — auto-select it
          const card = CARDS.find(c => c.id === data.cardId);
          if (card) {
            setActiveType('credit');
            setSelectedBank(card.bank);
            if (!selectedIds.includes(data.cardId)) onToggle(data.cardId);
            setBinMessage(`Found: ${card.name} · added to your wallet`);
            setBinStatus('found');
          }
        } else if (data.bank) {
          // Bank identified — switch to it
          setActiveType('credit');
          setSelectedBank(data.bank);
          setBinMessage(`Found: ${data.bank} — select your card below`);
          setBinStatus('found');
        } else {
          setBinMessage("Couldn't identify this card — select your bank from the dropdown below");
          setBinStatus('notfound');
        }
      } catch {
        setBinMessage('Lookup failed — select your bank below');
        setBinStatus('notfound');
      } finally {
        setBinLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl">
      {/* ── BIN finder ── */}
      <div className="mb-8 p-5 bg-gray-50 rounded-2xl">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Know your card number?
        </p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter first 6 digits"
              value={binInput.replace(/^(\d{4})(\d{1,2})/, '$1 $2')}
              onChange={e => handleBinChange(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 tracking-widest pr-9"
            />
            {binLoading && (
              <Loader2 size={15} className="absolute right-3 top-3 text-blue-500 animate-spin" />
            )}
            {binInput && !binLoading && (
              <button onClick={() => { setBinInput(''); setBinMessage(''); setBinStatus('idle'); }}
                className="absolute right-3 top-3 text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>
          {binMessage && (
            <p className={`text-xs ${binStatus === 'found' ? 'text-green-600' : 'text-amber-600'}`}>
              {binMessage}
            </p>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">We never store or transmit your card number.</p>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {TABS.map(({ type, label }) => (
          <button key={type} onClick={() => { setActiveType(type); setSelectedBank(''); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Dropdown → cards (same pattern for all three tabs) ── */}
      <DropdownSection
        type={activeType}
        cardsByGroup={
          activeType === 'credit' ? creditByBank :
          activeType === 'debit'  ? groupByBank(debitCards) :
          groupByBank(wallets)
        }
        selectedIds={selectedIds}
        onToggle={onToggle}
        selectedBank={selectedBank}
        setSelectedBank={setSelectedBank}
        label={activeType === 'wallet' ? 'Select provider' : 'Select your bank'}
        placeholder={activeType === 'wallet' ? 'Choose a provider…' : 'Choose a bank…'}
        emptyText={activeType === 'wallet' ? 'Choose a provider above to see wallets.' : 'Choose a bank above to see its cards.'}
        subLabel={activeType === 'wallet' ? 'Select your wallets' : `Select all ${selectedBank} cards you hold`}
      />
    </div>
  );
}
