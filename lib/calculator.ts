import { OFFERS, EARN_RATES, POINTS_VALUE, type Offer, type Platform } from '@/data/offers';
export type { Platform } from '@/data/offers';

export interface PlatformPrice {
  platform: Platform;
  price: number;
  available: boolean;
}

export interface BreakdownLine {
  label: string;
  amount: number; // negative = saving, positive = fee
  type: 'price' | 'discount' | 'fee' | 'points';
  offerId?: string;
  offerValidTo?: string;
}

export interface Recommendation {
  platform: Platform;
  cardId: string;
  listedPrice: number;
  effectivePrice: number;
  totalSaving: number;
  breakdown: BreakdownLine[];
  appliedOffer: Offer | null;
  rank: number;
}

// ── Date helpers ──────────────────────────────────────────────────
function isOfferActive(offer: Offer): boolean {
  const now = new Date();
  const from = new Date(offer.validFrom);
  const to = new Date(offer.validTo);
  to.setHours(23, 59, 59);
  return now >= from && now <= to;
}

export function daysUntilExpiry(dateStr: string): number {
  const now = new Date();
  const expiry = new Date(dateStr);
  expiry.setHours(23, 59, 59);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Main computation ─────────────────────────────────────────────
export function computeRecommendations(
  prices: PlatformPrice[],
  userCardIds: string[],
  liveOffers?: Offer[]
): Recommendation[] {
  const offersToUse = (liveOffers && liveOffers.length > 0) ? liveOffers : OFFERS;
  const results: Recommendation[] = [];

  for (const { platform, price, available } of prices) {
    if (!available || price <= 0) continue;

    for (const cardId of userCardIds) {
      const breakdown: BreakdownLine[] = [
        { label: 'Listed price', amount: price, type: 'price' },
      ];

      let effectivePrice = price;

      // ── Step 1: Find active bank offer for this card × platform ──
      const bankOffer = offersToUse.find(
        (o) =>
          o.cardId === cardId &&
          o.platform === platform &&
          isOfferActive(o)
      ) ?? null;

      if (
        bankOffer &&
        (bankOffer.minTransaction === null || price >= bankOffer.minTransaction)
      ) {
        let discount = 0;
        if (bankOffer.benefitType === 'bank_offer' || bankOffer.benefitType === 'percentage_cashback') {
          discount = (price * bankOffer.value) / 100;
          if (bankOffer.cap !== null) discount = Math.min(discount, bankOffer.cap);
        } else if (bankOffer.benefitType === 'flat_cashback') {
          discount = bankOffer.value;
          if (bankOffer.cap !== null) discount = Math.min(discount, bankOffer.cap);
        }

        if (discount > 0) {
          effectivePrice -= discount;
          breakdown.push({
            label: buildOfferLabel(bankOffer),
            amount: -discount,
            type: 'discount',
            offerId: bankOffer.id,
            offerValidTo: bankOffer.validTo,
          });
        }
      }

      // ── Step 2: Reward points / cashback earn ─────────────────────
      const canStackPoints =
        !bankOffer ||
        bankOffer.stackableWith.includes('reward_points') ||
        bankOffer.stackableWith.includes('percentage_cashback');

      if (canStackPoints) {
        const earnRate = EARN_RATES[cardId]?.[platform] ?? 0;
        const pointValue = POINTS_VALUE[cardId] ?? 0;

        // For cashback cards (earnRate represents direct % cashback)
        const cashbackCards = ['sbi_cashback', 'icici_amazon', 'kotak_811', 'axis_ace'];
        if (cashbackCards.includes(cardId)) {
          // Already handled in bank offer above if OFFERS entry exists
          // Only add if no offer entry covers it
          const alreadyCovered = bankOffer?.cardId === cardId && bankOffer?.platform === platform;
          if (!alreadyCovered && earnRate > 0) {
            const cb = Math.min((price * earnRate) / 100, 5000);
            effectivePrice -= cb;
            breakdown.push({ label: `${earnRate}% cashback (${getCardName(cardId)})`, amount: -cb, type: 'discount' });
          }
        } else if (earnRate > 0 && pointValue > 0) {
          // Reward points → rupee equivalent
          const rpValue = (price * earnRate) / 100;
          effectivePrice -= rpValue;
          breakdown.push({
            label: `Reward points (${earnRate}% → ₹ value)`,
            amount: -rpValue,
            type: 'points',
          });
        }
      }

      // ── Step 3: Convenience fee ────────────────────────────────
      if (bankOffer?.convenienceFee && bankOffer.convenienceFee > 0) {
        const fee = (price * bankOffer.convenienceFee) / 100;
        effectivePrice += fee;
        breakdown.push({ label: `Convenience fee (${bankOffer.convenienceFee}%)`, amount: fee, type: 'fee' });
      }

      const totalSaving = price - effectivePrice;

      results.push({
        platform,
        cardId,
        listedPrice: price,
        effectivePrice: Math.max(0, effectivePrice),
        totalSaving: Math.max(0, totalSaving),
        breakdown,
        appliedOffer: bankOffer,
        rank: 0,
      });
    }
  }

  // Sort by effective price ascending, rank them
  results.sort((a, b) => a.effectivePrice - b.effectivePrice);
  results.forEach((r, i) => (r.rank = i + 1));

  return results;
}

function buildOfferLabel(offer: Offer): string {
  const pct = offer.benefitType === 'flat_cashback' ? '' : `${offer.value}%`;
  const cap = offer.cap ? `, cap ₹${offer.cap.toLocaleString('en-IN')}` : '';
  return `${getCardName(offer.cardId)} offer (${pct}${cap})`;
}

function getCardName(cardId: string): string {
  const names: Record<string, string> = {
    hdfc_infinia:      'HDFC Infinia',
    hdfc_diners_black: 'HDFC Diners Black',
    hdfc_regalia:      'HDFC Regalia',
    hdfc_millennia:    'HDFC Millennia',
    axis_magnus:       'Axis Magnus',
    axis_ace:          'Axis ACE',
    axis_flipkart:     'Flipkart Axis',
    icici_amazon:      'ICICI Amazon Pay',
    icici_emeralde:    'ICICI Emeralde',
    sbi_cashback:      'SBI Cashback',
    sbi_elite:         'SBI Elite',
    kotak_811:         'Kotak 811',
    idfc_wealth:       'IDFC Wealth',
    amex_plat_travel:  'Amex Plat Travel',
    amex_mrcc:         'Amex MRCC',
    onecard:           'OneCard',
    au_lit:            'AU LIT',
    yes_first:         'YES First Preferred',
    sc_smart:          'SC Smart',
    sbi_simplysave:    'SBI SimplyClick',
    paytm_wallet:      'Paytm Wallet',
    amazon_pay:        'Amazon Pay',
    phonepe_wallet:    'PhonePe',
  };
  return names[cardId] ?? cardId;
}

export { getCardName };
