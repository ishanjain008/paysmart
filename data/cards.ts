export type CardType = 'credit' | 'debit' | 'wallet';

export interface Card {
  id: string;
  name: string;
  bank: string;
  type: CardType;
  color: string;
  shortName: string;
}

export const CARDS: Card[] = [
  // ── HDFC Bank ───────────────────────────────────────────────────
  { id: 'hdfc_infinia',      name: 'Infinia Metal',    bank: 'HDFC Bank',          type: 'credit', color: '#003087', shortName: 'HDFC' },
  { id: 'hdfc_diners_black', name: 'Diners Club Black',bank: 'HDFC Bank',          type: 'credit', color: '#003087', shortName: 'HDFC' },
  { id: 'hdfc_regalia',      name: 'Regalia Gold',     bank: 'HDFC Bank',          type: 'credit', color: '#003087', shortName: 'HDFC' },
  { id: 'hdfc_millennia',    name: 'Millennia',        bank: 'HDFC Bank',          type: 'credit', color: '#003087', shortName: 'HDFC' },

  // ── Axis Bank ───────────────────────────────────────────────────
  { id: 'axis_magnus',       name: 'Magnus',           bank: 'Axis Bank',          type: 'credit', color: '#800000', shortName: 'AXIS' },
  { id: 'axis_ace',          name: 'ACE',              bank: 'Axis Bank',          type: 'credit', color: '#800000', shortName: 'AXIS' },
  { id: 'axis_flipkart',     name: 'Flipkart Axis',    bank: 'Axis Bank',          type: 'credit', color: '#800000', shortName: 'AXIS' },

  // ── ICICI Bank ──────────────────────────────────────────────────
  { id: 'icici_amazon',      name: 'Amazon Pay',       bank: 'ICICI Bank',         type: 'credit', color: '#C41E3A', shortName: 'ICICI' },
  { id: 'icici_emeralde',    name: 'Emeralde Private', bank: 'ICICI Bank',         type: 'credit', color: '#C41E3A', shortName: 'ICICI' },

  // ── SBI Card ────────────────────────────────────────────────────
  { id: 'sbi_cashback',      name: 'Cashback',         bank: 'SBI Card',           type: 'credit', color: '#CC0000', shortName: 'SBI' },
  { id: 'sbi_elite',         name: 'Elite',            bank: 'SBI Card',           type: 'credit', color: '#CC0000', shortName: 'SBI' },

  // ── Other banks ─────────────────────────────────────────────────
  { id: 'kotak_811',         name: '811 #DreamDifferent', bank: 'Kotak Bank',      type: 'credit', color: '#EF4444', shortName: 'KTK' },
  { id: 'idfc_wealth',       name: 'Wealth',           bank: 'IDFC First',         type: 'credit', color: '#7C3AED', shortName: 'IDFC' },
  { id: 'amex_plat_travel',  name: 'Platinum Travel',  bank: 'American Express',   type: 'credit', color: '#007BC1', shortName: 'AMEX' },
  { id: 'amex_mrcc',         name: 'Membership Rewards',bank: 'American Express',  type: 'credit', color: '#007BC1', shortName: 'AMEX' },
  { id: 'onecard',           name: 'OneCard',          bank: 'OneCard',            type: 'credit', color: '#1A1A1A', shortName: 'ONE' },
  { id: 'au_lit',            name: 'LIT',              bank: 'AU Small Finance',   type: 'credit', color: '#E63946', shortName: 'AU' },
  { id: 'yes_first',         name: 'First Preferred',  bank: 'YES Bank',           type: 'credit', color: '#003580', shortName: 'YES' },
  { id: 'sc_smart',          name: 'Smart',            bank: 'Standard Chartered', type: 'credit', color: '#0072AA', shortName: 'SC' },

  // ── Debit cards ─────────────────────────────────────────────────
  { id: 'sbi_simplysave',    name: 'SimplyClick',      bank: 'SBI',                type: 'debit',  color: '#CC0000', shortName: 'SBI' },

  // ── Wallets ─────────────────────────────────────────────────────
  { id: 'paytm_wallet',      name: 'Paytm Wallet',     bank: 'One97 Comms',        type: 'wallet', color: '#00BAF2', shortName: 'PAY' },
  { id: 'amazon_pay',        name: 'Amazon Pay',       bank: 'Amazon',             type: 'wallet', color: '#FF9900', shortName: 'APay' },
  { id: 'phonepe_wallet',    name: 'PhonePe Wallet',   bank: 'PhonePe',            type: 'wallet', color: '#5F259F', shortName: 'PhPe' },
];
