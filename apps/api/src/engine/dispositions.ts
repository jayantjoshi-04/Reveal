/**
 * REVEAL · Layer 2 · Dispositions (pure, deterministic)
 * ---------------------------------------------------------------------------
 * Six bipolar tensions, read behaviourally and stored as a SIGNED position in
 * −1…+1 — never an amount, because no pole is "better". Sources (re-tags of
 * tasks already captured, plus B7):
 *   AR act⟷reflect      · B3 first-three-moves (position-weighted)
 *   ES experiment⟷study · B3
 *   SB solo⟷bring-in    · B3
 *   DW deep⟷wide        · B7 unconstrained-year concentration (Herfindahl)
 *   PA persist⟷adapt    · B8 disruption response (weak-but-real)
 *   RD reinvent⟷discipline · B8 generated_new (weak-but-real)
 */
import { B7_PURSUITS, DISPOSITION_DIMS, type DispositionCode, type Findings, type RawCapture } from '@reveal/shared';
import { round } from './util.js';

type Dim = NonNullable<Findings['dispositions']>[number];

/** B3 palette move → its signed contribution on each dimension (−1 low pole, +1 high pole). */
const MOVE_MAP: Record<string, Partial<Record<DispositionCode, number>>> = {
  'talk to the people affected': { SB: +1 },
  'find everyone with a stake': { SB: +1 },
  'sketch something quickly': { AR: -1, ES: -1 },
  'build a small thing to test': { AR: -1, ES: -1 },
  'study how other towns handled it': { ES: +1, AR: +0.5 },
  'look at the data': { ES: +1, AR: +0.5 },
  'tighten what the real problem is': { AR: +1 },
  'question whether the brief is right': { AR: +1 },
};

/** Position-weighted read of the three B3 moves for AR / ES / SB. */
function fromB3(raw: RawCapture): Partial<Record<DispositionCode, number>> {
  const moves = raw.channel_b.b3_moves?.ordered_moves ?? [];
  const num: Partial<Record<DispositionCode, number>> = {};
  const den: Partial<Record<DispositionCode, number>> = {};
  moves.forEach((move, i) => {
    const weight = 3 - i; // 1st = 3, 2nd = 2, 3rd = 1
    const contrib = MOVE_MAP[move];
    if (!contrib) return;
    for (const [dim, sign] of Object.entries(contrib) as [DispositionCode, number][]) {
      num[dim] = (num[dim] ?? 0) + weight * sign;
      den[dim] = (den[dim] ?? 0) + weight * Math.abs(sign);
    }
  });
  const out: Partial<Record<DispositionCode, number>> = {};
  for (const dim of ['AR', 'ES', 'SB'] as DispositionCode[]) {
    if (den[dim]) out[dim] = clamp((num[dim] ?? 0) / den[dim]!);
  }
  return out;
}

/** DW from B7: concentration (Herfindahl) → Deep(−) ; spread → Wide(+). */
function fromB7(raw: RawCapture): number | undefined {
  const alloc = raw.channel_b.b7_year?.allocation;
  if (!alloc) return undefined;
  const months = Object.values(alloc).filter((m) => m > 0);
  const total = months.reduce((a, b) => a + b, 0);
  if (total <= 0 || months.length === 0) return undefined;
  // Herfindahl over the FULL pursuit space (per the spec: "1–2 pursuits → deep,
  // spread across 4+ → wide") — so fewer pursuits reads Deep regardless of split.
  const h = months.reduce((a, m) => a + (m / total) ** 2, 0);
  const hMin = 1 / B7_PURSUITS.length; // even spread across all pursuits
  const c = (h - hMin) / (1 - hMin); // 0 = fully spread, 1 = all in one
  return clamp(1 - 2 * c); // concentrated → −1 (Deep) · spread → +1 (Wide)
}

/** PA & RD from B8 disruption responses (averaged over the disruptions). */
function fromB8(raw: RawCapture): { PA?: number; RD?: number } {
  const ds = raw.channel_b.b8_disruption?.disruptions ?? [];
  if (ds.length === 0) return {};
  const paMap: Record<string, number> = { adapt: 0.6, reframe: 0.9, abandon: -0.5 };
  let pa = 0;
  let rd = 0;
  for (const d of ds) {
    pa += paMap[d.response] ?? 0;
    rd += d.generated_new ? -0.7 : 0.5; // reinvent(−) vs discipline(+)
  }
  return { PA: clamp(pa / ds.length), RD: clamp(rd / ds.length) };
}

export function scoreDispositions(raw: RawCapture): Dim[] {
  const b3 = fromB3(raw);
  const dw = fromB7(raw);
  const b8 = fromB8(raw);

  const positions: Partial<Record<DispositionCode, { pos: number; tier: 'well_motivated' | 'thin' }>> = {};
  for (const dim of ['AR', 'ES', 'SB'] as DispositionCode[]) {
    if (b3[dim] !== undefined) positions[dim] = { pos: b3[dim]!, tier: 'well_motivated' };
  }
  if (dw !== undefined) positions.DW = { pos: dw, tier: 'well_motivated' };
  if (b8.PA !== undefined) positions.PA = { pos: b8.PA, tier: 'thin' };
  if (b8.RD !== undefined) positions.RD = { pos: b8.RD, tier: 'thin' };

  return DISPOSITION_DIMS.map((d) => {
    const p = positions[d.code];
    return {
      dimension: d.code,
      low_pole: d.low,
      high_pole: d.high,
      position: round(p?.pos ?? 0, 2),
      tier: p?.tier ?? ('thin' as const),
    };
  });
}

/** A short, deterministic caption naming the 1–2 strongest well-motivated leans. */
export function summariseDispositions(dims: Dim[]): string {
  const strong = dims
    .filter((d) => d.tier === 'well_motivated' && Math.abs(d.position) >= 0.34)
    .sort((a, b) => Math.abs(b.position) - Math.abs(a.position))
    .slice(0, 2)
    .map((d) => (d.position < 0 ? d.low_pole : d.high_pole).toLowerCase());
  if (strong.length === 0) return 'Your working style reads balanced across these tensions — no strong pull to either pole yet.';
  if (strong.length === 1) return `Under pressure you lean toward ${strong[0]} — one clear pull in how you work.`;
  return `Under pressure you lean toward ${strong[0]} and ${strong[1]} — that pairing is how you tend to move first.`;
}

function clamp(n: number): number {
  return Math.max(-1, Math.min(1, n));
}
