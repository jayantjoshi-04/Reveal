/**
 * Capacity scoring (the 6-capacity spike chart + surprises).
 *
 * A-score comes from the stated A1 module (appearance-normalised at capture,
 * stored on the payload). B-score is derived here from the behavioural tasks
 * that speak to capacities (B4 attention, B3 first-moves, B2 dilemmas), each a
 * "situation". demonstrated = 0.6·B + 0.4·A ×100.
 */
import { CAPACITIES, type Capacity } from '@reveal/shared';
import type { RawCapture } from '@reveal/shared';
import type { ScoringConstants } from '@reveal/shared';
import { clamp01, mean, weightedMean } from './util.js';

/** B4 tap categories → the capacity that noticing them evidences. */
const B4_CATEGORY_CAPACITY: Record<string, Capacity> = {
  PEOPLE: 'empathy',
  FORM: 'aesthetic',
  SYSTEM: 'systems_sensing',
  DETAIL: 'analytical',
  TEXT: 'narrative',
};

/** B3 palette actions (matched by keyword) → capacity. Maker actions map to no
 *  capacity (craft is a capability now). */
function b3MoveCapacity(move: string): Capacity | null {
  const m = move.toLowerCase();
  if (m.includes('talk') || m.includes('people') || m.includes('stake')) {
    return m.includes('stake') ? 'systems_sensing' : 'empathy';
  }
  if (m.includes('data') || m.includes('study') || m.includes('other towns')) return 'analytical';
  if (m.includes('tighten') || m.includes('question') || m.includes('brief')) return 'conviction';
  return null; // sketch / build → maker
}

/** One behavioural "situation" reading for a capacity: its score plus whether it
 *  fired strongly enough to count toward agreement. */
export interface Situation {
  task: string;
  score: number; // 0–1
}

/** Per-capacity behavioural situations, gathered from the tagged B-tasks. */
function capacitySituations(raw: RawCapture): Record<Capacity, Situation[]> {
  const out = {} as Record<Capacity, Situation[]>;
  for (const c of CAPACITIES) out[c] = [];

  // B4 · attention capture — share of taps landing in each category's zone.
  const b4 = raw.channel_b.b4_attention;
  if (b4) {
    const counts = {} as Record<Capacity, number>;
    let total = 0;
    for (const stim of b4.stimuli) {
      for (const mark of stim.marked) {
        const cap = B4_CATEGORY_CAPACITY[mark.category];
        if (cap) {
          counts[cap] = (counts[cap] ?? 0) + 1;
          total++;
        }
      }
    }
    if (total > 0) {
      for (const c of CAPACITIES) {
        const share = (counts[c] ?? 0) / total;
        if (share > 0) out[c].push({ task: 'b4', score: clamp01(share * 2) }); // scale: 50% of taps = full
      }
    }
  }

  // B3 · first-three-moves — position-weighted (1st=3, 2nd=2, 3rd=1).
  const b3 = raw.channel_b.b3_moves;
  if (b3) {
    const weights = [3, 2, 1];
    const totalW = 6;
    const acc = {} as Record<Capacity, number>;
    b3.ordered_moves.forEach((move, i) => {
      const cap = b3MoveCapacity(move);
      if (cap) acc[cap] = (acc[cap] ?? 0) + (weights[i] ?? 0);
    });
    for (const c of CAPACITIES) {
      const s = (acc[c] ?? 0) / totalW;
      if (s > 0) out[c].push({ task: 'b3', score: clamp01(s * 1.5) });
    }
  }

  // B2 · dilemmas — a few scenarios carry a capacity pole.
  const b2 = raw.channel_b.b2_dilemmas;
  if (b2) {
    for (const ch of b2.choices) {
      const pole = (ch.disposition ?? ch.chosen_pole).toLowerCase();
      if (pole.includes('empathy')) out.empathy.push({ task: 'b2', score: 1 });
      if (pole.includes('analysis') || pole.includes('analytical')) out.analytical.push({ task: 'b2', score: 1 });
      if (pole.includes('conviction')) out.conviction.push({ task: 'b2', score: 1 });
    }
  }

  // B6 · bring-three thread — a story-laden lean evidences narrative; craft/form → aesthetic.
  const b6 = raw.channel_b.b6_upload;
  if (b6?.detected_thread) {
    const thread = b6.detected_thread.map((t) => t.toLowerCase());
    if (thread.some((t) => t.includes('story') || t.includes('narrative')))
      out.narrative.push({ task: 'b6', score: 1 });
    if (thread.some((t) => t.includes('craft') || t.includes('form') || t.includes('handmade')))
      out.aesthetic.push({ task: 'b6', score: 1 });
  }

  return out;
}

export interface CapacityScore {
  name: Capacity;
  a_score: number;
  b_score: number;
  demonstrated: number; // 0–100
  situations_agree: number;
  is_surprise: boolean;
}

export function scoreCapacities(raw: RawCapture, k: ScoringConstants): CapacityScore[] {
  const aScoreMap = (raw.channel_a.a1_capacities?.score ?? {}) as Partial<Record<Capacity, number>>;
  const situations = capacitySituations(raw);

  const scores: CapacityScore[] = CAPACITIES.map((name) => {
    const a = clamp01(aScoreMap[name] ?? 0);
    const sits = situations[name];
    const b = sits.length > 0 ? clamp01(mean(sits.map((s) => s.score))) : 0;
    // situations that "point toward" this capacity strongly enough to count
    const agree = sits.filter((s) => s.score >= k.B_POINTS_TOWARD).length;
    const demonstrated = (k.DEMONSTRATED_B_WEIGHT * b + k.DEMONSTRATED_A_WEIGHT * a) * 100;
    const is_surprise = a <= k.A_ABSENT && b >= k.B_POINTS_TOWARD && agree >= k.SURPRISE_MIN_SITUATIONS;
    return { name, a_score: a, b_score: b, demonstrated, situations_agree: agree, is_surprise };
  });

  // rank by demonstrated, descending
  return scores.sort((x, y) => y.demonstrated - x.demonstrated);
}

/** Confidence code for a capacity given its A/B scores and agreeing situations. */
export function capacityConfidence(
  s: CapacityScore,
  k: ScoringConstants,
): 'CC3' | 'CC2' | 'contradicted' | 'surprise' | null {
  if (s.is_surprise) return 'surprise';
  if (s.a_score >= k.CONTRADICTION_A && s.b_score <= k.CONTRADICTION_B) return 'contradicted';
  if (s.a_score >= k.A_PRESENT && s.situations_agree >= k.CC3_MIN_AGREE) return 'CC3';
  if (s.a_score >= k.A_PRESENT && s.situations_agree >= k.CC2_MIN_AGREE) return 'CC2';
  return null;
}
