export type BenefitType = 'flat_cashback' | 'percentage_cashback' | 'reward_points' | 'bank_offer';
export type Platform = 'amazon' | 'flipkart' | 'croma' | 'reliance_digital' | 'tata_cliq';

export interface Offer {
  id: string;
  cardId: string;
  platform: Platform;
  benefitType: BenefitType;
  // For cashback: rupee value or percentage (0–100)
  value: number;
  // Max benefit in ₹ (null = uncapped)
  cap: number | null;
  // Minimum purchase to trigger (null = no minimum)
  minTransaction: number | null;
  validFrom: string; // ISO date
  validTo: string;   // ISO date
  // Can this stack with other benefit types?
  stackableWith: BenefitType[];
  // Extra fee for using this card on this platform (%)
  convenienceFee: number;
  notes: string;
  sourceUrl: string;
}

// ── Point-to-rupee conversion rates ──────────────────────────────
// Used to compute effective rupee value of reward points
export const POINTS_VALUE: Record<string, number> = {
  hdfc_infinia:   0.033, // 1 point = ₹0.33 (SmartBuy 10x → ₹1, base 3.3%)
  hdfc_regalia:   0.020,
  axis_magnus:    0.020,
  axis_ace:       0.020,
  axis_flipkart:  0.015,
  icici_amazon:   0.010,
  sbi_cashback:   0.010,
  kotak_811:      0.010,
  idfc_wealth:    0.015,
  hdfc_millennia: 0.010,
  sbi_simplysave: 0.010,
  paytm_wallet:   0,
  amazon_pay:     0,
  phonepe_wallet: 0,
};

// ── Earn rates (% of spend earned as points / cashback) ──────────
export const EARN_RATES: Record<string, Partial<Record<Platform, number>>> = {
  hdfc_infinia:   { amazon: 3.3, flipkart: 3.3, croma: 3.3, reliance_digital: 3.3, tata_cliq: 3.3 },
  hdfc_regalia:   { amazon: 2.0, flipkart: 2.0, croma: 2.0, reliance_digital: 2.0, tata_cliq: 2.0 },
  axis_magnus:    { amazon: 1.2, flipkart: 1.2, croma: 1.2, reliance_digital: 1.2, tata_cliq: 1.2 },
  axis_ace:       { amazon: 2.0, flipkart: 1.5, croma: 1.5, reliance_digital: 1.5, tata_cliq: 1.5 },
  axis_flipkart:  { amazon: 1.5, flipkart: 5.0, croma: 1.5, reliance_digital: 1.5, tata_cliq: 1.5 },
  icici_amazon:   { amazon: 5.0, flipkart: 1.0, croma: 1.0, reliance_digital: 1.0, tata_cliq: 1.0 },
  sbi_cashback:   { amazon: 5.0, flipkart: 5.0, croma: 5.0, reliance_digital: 5.0, tata_cliq: 5.0 },
  kotak_811:      { amazon: 2.0, flipkart: 2.0, croma: 2.0, reliance_digital: 2.0, tata_cliq: 2.0 },
  idfc_wealth:    { amazon: 1.5, flipkart: 1.5, croma: 1.5, reliance_digital: 1.5, tata_cliq: 1.5 },
  hdfc_millennia: { amazon: 1.0, flipkart: 1.0, croma: 1.0, reliance_digital: 1.0, tata_cliq: 1.0 },
  sbi_simplysave: { amazon: 1.0, flipkart: 1.0, croma: 1.0, reliance_digital: 1.0, tata_cliq: 1.0 },
  paytm_wallet:   { amazon: 0,   flipkart: 0,   croma: 0,   reliance_digital: 0,   tata_cliq: 0   },
  amazon_pay:     { amazon: 1.0, flipkart: 0,   croma: 0,   reliance_digital: 0,   tata_cliq: 0   },
  phonepe_wallet: { amazon: 0,   flipkart: 0,   croma: 0,   reliance_digital: 0,   tata_cliq: 0   },
};

// ── Active bank offers ────────────────────────────────────────────
// Update this section every 2 weeks when banks announce new offers
export const OFFERS: Offer[] = [
  {
    id: 'hdfc_amazon_jun26',
    cardId: 'hdfc_infinia',
    platform: 'amazon',
    benefitType: 'bank_offer',
    value: 10,           // 10% off
    cap: 1500,           // capped at ₹1,500
    minTransaction: 5000,
    validFrom: '2026-06-01',
    validTo: '2026-06-30',
    stackableWith: ['reward_points'],
    convenienceFee: 0,
    notes: 'HDFC Bank cards get 10% instant discount on Amazon. Max ₹1,500 per transaction. Min order ₹5,000.',
    sourceUrl: 'https://www.hdfcbank.com/content/bbp/repositories/723fb80a-2dde-42a3-9793-7ae1be57c87f/?folderPath=/OTP/PDF&fileName=Amazon-India-10-Off-TandC.pdf',
  },
  {
    id: 'hdfc_regalia_amazon_jun26',
    cardId: 'hdfc_regalia',
    platform: 'amazon',
    benefitType: 'bank_offer',
    value: 10,
    cap: 1500,
    minTransaction: 5000,
    validFrom: '2026-06-01',
    validTo: '2026-06-30',
    stackableWith: ['reward_points'],
    convenienceFee: 0,
    notes: 'HDFC Bank cards get 10% instant discount on Amazon. Max ₹1,500 per transaction. Min order ₹5,000.',
    sourceUrl: 'https://www.hdfcbank.com/',
  },
  {
    id: 'axis_flipkart_extra',
    cardId: 'axis_flipkart',
    platform: 'flipkart',
    benefitType: 'bank_offer',
    value: 5,
    cap: 750,
    minTransaction: 3000,
    validFrom: '2026-06-01',
    validTo: '2026-06-30',
    stackableWith: ['reward_points'],
    convenienceFee: 0,
    notes: 'Flipkart Axis Bank credit card: extra 5% off on Flipkart. Capped at ₹750.',
    sourceUrl: 'https://www.axisbank.com/retail/cards/credit-card/flipkart-axis-bank-credit-card',
  },
  {
    id: 'sbi_cashback_amazon',
    cardId: 'sbi_cashback',
    platform: 'amazon',
    benefitType: 'percentage_cashback',
    value: 5,
    cap: 5000,
    minTransaction: null,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    stackableWith: [],
    convenienceFee: 0,
    notes: 'SBI Cashback card: flat 5% cashback on all online spends including Amazon. Capped ₹5,000/month.',
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/shopping/sbi-card-cashback.page',
  },
  {
    id: 'sbi_cashback_flipkart',
    cardId: 'sbi_cashback',
    platform: 'flipkart',
    benefitType: 'percentage_cashback',
    value: 5,
    cap: 5000,
    minTransaction: null,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    stackableWith: [],
    convenienceFee: 0,
    notes: 'SBI Cashback card: flat 5% cashback on all online spends including Flipkart. Capped ₹5,000/month.',
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/shopping/sbi-card-cashback.page',
  },
  {
    id: 'icici_amazon_prime',
    cardId: 'icici_amazon',
    platform: 'amazon',
    benefitType: 'percentage_cashback',
    value: 5,
    cap: null,
    minTransaction: null,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    stackableWith: [],
    convenienceFee: 0,
    notes: 'Amazon Pay ICICI card: 5% back for Prime members, 3% for others on Amazon. No cap.',
    sourceUrl: 'https://www.icicibank.com/card/credit-cards/amazon-pay-credit-card',
  },
  {
    id: 'paytm_wallet_flipkart',
    cardId: 'paytm_wallet',
    platform: 'flipkart',
    benefitType: 'percentage_cashback',
    value: 3,
    cap: 200,
    minTransaction: 1000,
    validFrom: '2026-06-01',
    validTo: '2026-06-30',
    stackableWith: [],
    convenienceFee: 0,
    notes: 'Paytm wallet: 3% cashback on Flipkart orders paid via Paytm. Max ₹200.',
    sourceUrl: 'https://paytm.com/offers',
  },
];

export const PLATFORMS: Record<Platform, { name: string; color: string; logo: string }> = {
  amazon:           { name: 'Amazon',           color: '#FF9900', logo: '🛒' },
  flipkart:         { name: 'Flipkart',         color: '#F7AE00', logo: '🛍️' },
  croma:            { name: 'Croma',            color: '#E31837', logo: '🔌' },
  reliance_digital: { name: 'Reliance Digital', color: '#0077B6', logo: '📱' },
  tata_cliq:        { name: 'Tata Cliq',        color: '#7B2D8B', logo: '🛒' },
};

export const LAST_UPDATED = '2026-06-01';
