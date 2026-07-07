import { describe, it, expect } from 'vitest';
import { run } from '../index.js';
import type { RawCapture } from '@reveal/shared';

/**
 * I1 regression: A-scores must be recomputed server-side from raw items using
 * instrument appearance counts — a client-supplied `score` must be ignored when
 * appearances are provided (the production path).
 */
function baseRaw(a1: { items: unknown[]; score?: unknown }): RawCapture {
  return {
    channel_a: { a1_capacities: a1 as never },
    channel_b: {},
    portfolio: { projects: [] },
  } as RawCapture;
}

describe('engine · A-score integrity (I1)', () => {
  const appearances = { empathy: 4, analytical: 4, narrative: 2 } as const;

  it('computes A-score as chosen ÷ appearances, ignoring any client score', () => {
    const raw = baseRaw({
      // 2 empathy picks out of 4 appearances → 0.5; narrative 0 → 0
      items: [
        { prompt_id: 'a', chosen_capacity: 'empathy', ms: 1 },
        { prompt_id: 'b', chosen_capacity: 'empathy', ms: 1 },
        { prompt_id: 'c', chosen_capacity: 'analytical', ms: 1 },
      ],
      // a tampered client score claiming narrative is maxed — must be ignored
      score: { empathy: 0.0, analytical: 0.0, narrative: 1.0 },
    });
    const { trait_scores } = run(raw, undefined, appearances);
    const byName = Object.fromEntries(trait_scores.map((t) => [t.trait, t.a_score]));
    expect(byName.empathy).toBeCloseTo(0.5);
    expect(byName.analytical).toBeCloseTo(0.25);
    expect(byName.narrative).toBe(0); // tampered 1.0 ignored
  });

  it('falls back to the provided score only when no appearances are given (tests)', () => {
    const raw = baseRaw({ items: [], score: { empathy: 0.9 } });
    const { trait_scores } = run(raw); // no appearances
    const empathy = trait_scores.find((t) => t.trait === 'empathy')!;
    expect(empathy.a_score).toBeCloseTo(0.9);
  });
});
