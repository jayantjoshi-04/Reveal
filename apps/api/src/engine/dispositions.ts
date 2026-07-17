/**
 * REVEAL · Layer 2 · Dispositions (pure, deterministic)
 * ---------------------------------------------------------------------------
 * Six bipolar tensions, read behaviourally and stored as a SIGNED position in
 * −1…+1 — never an amount, because no pole is "better". Sources:
 *   B9 scenario suite Q1 (primary) · B3 first-three-moves · B7 (DW) · B8 (PA/RD)
 * Position = Σ(weight × pole_sign) ÷ Σ(weight). Tier: well-motivated if ≥3
 * situations touch the dimension, else thin (suppressed in the report).
 */
import { B7_PURSUITS, DISPOSITION_DIMS, POLE_TO_DIM, SCENARIOS, type DispositionCode, type Findings, type RawCapture } from '@reveal/shared';
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

/** DW from B7: concentration (Herfindahl) → Deep(−) ; spread → Wide(+). */
function fromB7(raw: RawCapture): number | undefined {
  const alloc = raw.channel_b.b7_year?.allocation;
  if (!alloc) return undefined;
  const months = Object.values(alloc).filter((m) => m > 0);
  const total = months.reduce((a, b) => a + b, 0);
  if (total <= 0 || months.length === 0) return undefined;
  const h = months.reduce((a, m) => a + (m / total) ** 2, 0);
  const hMin = 1 / B7_PURSUITS.length;
  const c = (h - hMin) / (1 - hMin);
  return clamp(1 - 2 * c);
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
    rd += d.generated_new ? -0.7 : 0.5;
  }
  return { PA: clamp(pa / ds.length), RD: clamp(rd / ds.length) };
}

export function scoreDispositions(raw: RawCapture): Dim[] {
  const num: Partial<Record<DispositionCode, number>> = {};
  const den: Partial<Record<DispositionCode, number>> = {};
  const sits: Partial<Record<DispositionCode, number>> = {}; // # situations touching each dim
  const bump = (dim: DispositionCode, sign: number, w: number): void => {
    num[dim] = (num[dim] ?? 0) + w * sign;
    den[dim] = (den[dim] ?? 0) + w;
  };
  const countSituation = (dims: Iterable<DispositionCode>): void => {
    for (const d of dims) sits[d] = (sits[d] ?? 0) + 1;
  };

  // B3 (one situation, weighted by move position)
  const moves = raw.channel_b.b3_moves?.ordered_moves ?? [];
  const b3dims = new Set<DispositionCode>();
  moves.forEach((move, i) => {
    const contrib = MOVE_MAP[move];
    if (!contrib) return;
    const weight = 3 - i;
    for (const [dim, sign] of Object.entries(contrib) as [DispositionCode, number][]) {
      bump(dim, Math.sign(sign), weight * Math.abs(sign));
      b3dims.add(dim);
    }
  });
  if (b3dims.size) countSituation(b3dims);

  // B9 scenario suite Q1 (primary — each scenario is a situation)
  for (const s of raw.channel_b.b9_scenarios?.scenarios ?? []) {
    const def = SCENARIOS.find((x) => x.id === s.scenario_id);
    const opt = def?.q1[s.q1_choice];
    if (!opt) continue;
    const hit = new Set<DispositionCode>();
    for (const tag of opt.tags) {
      const pm = POLE_TO_DIM[tag.pole];
      if (!pm) continue;
      bump(pm.dim, pm.sign, tag.w);
      hit.add(pm.dim);
    }
    if (hit.size) countSituation(hit);
  }

  // B7 → DW, B8 → PA/RD (each a situation, blended as one weighted signal)
  const dw = fromB7(raw);
  if (dw !== undefined) { num.DW = (num.DW ?? 0) + dw; den.DW = (den.DW ?? 0) + 1; countSituation(['DW']); }
  const b8 = fromB8(raw);
  if (b8.PA !== undefined) { num.PA = (num.PA ?? 0) + b8.PA; den.PA = (den.PA ?? 0) + 1; countSituation(['PA']); }
  if (b8.RD !== undefined) { num.RD = (num.RD ?? 0) + b8.RD; den.RD = (den.RD ?? 0) + 1; countSituation(['RD']); }

  return DISPOSITION_DIMS.map((d) => {
    const has = den[d.code] && den[d.code]! > 0;
    const position = has ? clamp(num[d.code]! / den[d.code]!) : 0;
    // ≥3 situations → well-motivated; else thin (report suppresses the slider)
    const tier: 'well_motivated' | 'thin' = (sits[d.code] ?? 0) >= 3 ? 'well_motivated' : 'thin';
    return { dimension: d.code, low_pole: d.low, high_pole: d.high, position: round(position, 2), tier };
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
