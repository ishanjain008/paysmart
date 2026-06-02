import type { NextRequest } from 'next/server';

// ── Indian card BIN table ─────────────────────────────────────────
// BINs sourced from public card community documentation.
// Each entry maps a 6-digit BIN prefix → { cardId, bank }
const INDIAN_BINS: Record<string, { cardId: string; bank: string }> = {
  // HDFC Bank — Infinia
  '403587': { cardId: 'hdfc_infinia', bank: 'HDFC Bank' },
  '415483': { cardId: 'hdfc_infinia', bank: 'HDFC Bank' },
  '489318': { cardId: 'hdfc_infinia', bank: 'HDFC Bank' },
  // HDFC Bank — Diners Club Black
  '654332': { cardId: 'hdfc_diners_black', bank: 'HDFC Bank' },
  '620467': { cardId: 'hdfc_diners_black', bank: 'HDFC Bank' },
  // HDFC Bank — Regalia
  '411494': { cardId: 'hdfc_regalia', bank: 'HDFC Bank' },
  '458893': { cardId: 'hdfc_regalia', bank: 'HDFC Bank' },
  '458588': { cardId: 'hdfc_regalia', bank: 'HDFC Bank' },
  // HDFC Bank — Millennia
  '522147': { cardId: 'hdfc_millennia', bank: 'HDFC Bank' },
  '404010': { cardId: 'hdfc_millennia', bank: 'HDFC Bank' },
  // Axis Bank — Magnus
  '436288': { cardId: 'axis_magnus', bank: 'Axis Bank' },
  '527659': { cardId: 'axis_magnus', bank: 'Axis Bank' },
  // Axis Bank — ACE
  '438857': { cardId: 'axis_ace', bank: 'Axis Bank' },
  '524288': { cardId: 'axis_ace', bank: 'Axis Bank' },
  // Axis Bank — Flipkart
  '438883': { cardId: 'axis_flipkart', bank: 'Axis Bank' },
  '524647': { cardId: 'axis_flipkart', bank: 'Axis Bank' },
  // ICICI — Amazon Pay
  '461164': { cardId: 'icici_amazon', bank: 'ICICI Bank' },
  '489535': { cardId: 'icici_amazon', bank: 'ICICI Bank' },
  // ICICI — Emeralde
  '489536': { cardId: 'icici_emeralde', bank: 'ICICI Bank' },
  // SBI Card — Cashback
  '404628': { cardId: 'sbi_cashback', bank: 'SBI Card' },
  '524229': { cardId: 'sbi_cashback', bank: 'SBI Card' },
  // SBI Card — Elite
  '404611': { cardId: 'sbi_elite', bank: 'SBI Card' },
  // Kotak — 811
  '524906': { cardId: 'kotak_811', bank: 'Kotak Bank' },
  '438021': { cardId: 'kotak_811', bank: 'Kotak Bank' },
  // IDFC First — Wealth
  '407616': { cardId: 'idfc_wealth', bank: 'IDFC First' },
  // Amex — Platinum Travel
  '371449': { cardId: 'amex_plat_travel', bank: 'American Express' },
  '379764': { cardId: 'amex_plat_travel', bank: 'American Express' },
  // Amex — MRCC
  '378282': { cardId: 'amex_mrcc', bank: 'American Express' },
  // YES Bank — First Preferred
  '438977': { cardId: 'yes_first', bank: 'YES Bank' },
  // Standard Chartered — Smart
  '414720': { cardId: 'sc_smart', bank: 'Standard Chartered' },
};

// Map keywords in binlist bank names to our bank display names (fallback)
const BANK_KEYWORDS: [string, string][] = [
  ['HDFC',               'HDFC Bank'],
  ['AXIS',               'Axis Bank'],
  ['ICICI',              'ICICI Bank'],
  ['STATE BANK',         'SBI Card'],
  ['SBI',                'SBI Card'],
  ['KOTAK',              'Kotak Bank'],
  ['IDFC',               'IDFC First'],
  ['AMERICAN EXPRESS',   'American Express'],
  ['YES BANK',           'YES Bank'],
  ['AU SMALL',           'AU Small Finance'],
  ['STANDARD CHARTERED', 'Standard Chartered'],
];

function matchBank(rawName: string): string | null {
  const upper = rawName.toUpperCase();
  for (const [kw, name] of BANK_KEYWORDS) {
    if (upper.includes(kw)) return name;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const bin = request.nextUrl.searchParams.get('bin') ?? '';
  const prefix = bin.replace(/\D/g, '').slice(0, 6);

  if (prefix.length < 6) {
    return Response.json({ cardId: null, bank: null });
  }

  // 1. Try local Indian BIN table first
  const local = INDIAN_BINS[prefix];
  if (local) return Response.json(local);

  // 2. Fall back to binlist.net (server-side, no CORS issues)
  try {
    const res = await fetch(`https://lookup.binlist.net/${prefix}`, {
      headers: { 'Accept-Version': '3' },
    });
    if (!res.ok) return Response.json({ cardId: null, bank: null });
    const data = await res.json();
    const bank = matchBank(data?.bank?.name ?? '');
    return Response.json({ cardId: null, bank });
  } catch {
    return Response.json({ cardId: null, bank: null });
  }
}
