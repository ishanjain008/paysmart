import Anthropic from '@anthropic-ai/sdk';
import type { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const maxDuration = 60;

const PLATFORMS = [
  { id: 'amazon',           name: 'Amazon India',      query: 'amazon.in bank credit card instant discount offer cashback 2026' },
  { id: 'flipkart',         name: 'Flipkart',          query: 'flipkart bank credit card cashback discount offer 2026' },
  { id: 'croma',            name: 'Croma',             query: 'croma bank credit card offer instant discount 2026' },
  { id: 'vijay_sales',      name: 'Vijay Sales',       query: 'vijay sales bank credit card offer discount 2026' },
  { id: 'reliance_digital', name: 'Reliance Digital',  query: 'reliance digital bank credit card offer cashback 2026' },
];

const VALID_CARD_IDS = `
- hdfc_infinia  → HDFC Infinia Metal
- hdfc_regalia  → HDFC Regalia Gold
- axis_magnus   → Axis Magnus
- axis_ace      → Axis ACE
- axis_flipkart → Axis Flipkart
- icici_amazon  → ICICI Amazon Pay
- sbi_cashback  → SBI Cashback
- kotak_811     → Kotak 811
- idfc_wealth   → IDFC First Wealth
- hdfc_millennia → HDFC Millennia
- sbi_simplysave → SBI SimplyClick
`.trim();

async function searchSerper(query: string): Promise<string> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.SERPER_KEY ?? '', 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, gl: 'in', hl: 'en', num: 8 }),
  });
  if (!res.ok) return '';
  const data = await res.json();
  return (data.organic ?? []).slice(0, 6)
    .map((r: { title?: string; snippet?: string }) => `${r.title ?? ''}: ${r.snippet ?? ''}`)
    .join('\n');
}

async function extractOffersWithClaude(platform: string, platformName: string, snippets: string): Promise<object[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Extract current bank/credit card payment offers for ${platformName} from these search result snippets.

SEARCH RESULTS:
${snippets}

TODAY: ${new Date().toISOString().split('T')[0]}
PLATFORM ID: "${platform}"

Use ONLY these cardIds:
${VALID_CARD_IDS}

Return a JSON array (no markdown, just raw JSON). Each offer:
{
  "cardId": "...",
  "platform": "${platform}",
  "benefitType": "bank_offer" | "percentage_cashback" | "flat_cashback",
  "value": <number: percentage 0-100 OR flat ₹ amount>,
  "cap": <max benefit rupees or null>,
  "minTransaction": <minimum purchase rupees or null>,
  "validTo": "YYYY-MM-DD",
  "stackableWith": ["reward_points"],
  "convenienceFee": 0,
  "notes": "one line description"
}

If no clear offers are found, return []. Only include offers you are confident about.`,
    }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return JSON.parse(match[0]); } catch { return []; }
}

export async function POST(_request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });
  }

  // Run all Serper searches in parallel
  const snippets = await Promise.all(
    PLATFORMS.map((p) => searchSerper(p.query))
  );

  // Run all Claude extractions in parallel
  const offerArrays = await Promise.all(
    PLATFORMS.map((p, i) => extractOffersWithClaude(p.id, p.name, snippets[i]))
  );

  const allOffers = offerArrays.flat().map((o, i) => ({ ...o as object, id: `auto_${Date.now()}_${i}` }));

  // Save to Firestore
  const db = getAdminDb();
  if (db) {
    await db.collection('config').doc('offers').set({
      offers: allOffers,
      updatedAt: new Date().toISOString(),
    });
  }

  return Response.json({
    ok: true,
    extracted: allOffers.length,
    updatedAt: new Date().toISOString(),
    offers: allOffers,
  });
}
