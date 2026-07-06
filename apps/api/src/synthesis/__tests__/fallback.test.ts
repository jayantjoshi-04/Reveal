import { describe, it, expect } from 'vitest';
import { run } from '../../engine/index.js';
import { JAANHVI } from '../../engine/__tests__/jaanhvi.fixture.js';
import { fallbackSlots } from '../fallback.js';
import { validateSlots } from '../validate.js';
import { REPORT_SLOTS } from '@reveal/shared';

/**
 * The deterministic fallback phraser ships reports in manual/offline mode
 * WITHOUT re-validation, so it must itself honour the slot contract — every
 * ceiling, the surprise confirm-question, and no comparison to others.
 */
describe('synthesis · deterministic fallback honours the contract', () => {
  const { findings } = run(JAANHVI);
  const slots = fallbackSlots(findings);

  it('passes the same validator the LLM output must pass', () => {
    const result = validateSlots(slots);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('fills every defined slot', () => {
    for (const def of REPORT_SLOTS) {
      expect(slots[def.id]?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('ends the surprise slot in a confirm-question', () => {
    expect(slots.surprise_phrasing!.trim().endsWith('?')).toBe(true);
  });

  it('produces a differentiation statement that names the top capacity', () => {
    expect(slots.differentiation_statement!.toLowerCase()).toContain('empathy');
  });
});

/** A no-surprise profile must still yield a valid, contract-safe report. */
describe('synthesis · fallback on a profile with no surprises', () => {
  it('phrases the surprise slot as a question even when empty', () => {
    const { findings } = run(JAANHVI);
    const noSurprise = { ...findings, surprises: [] as (typeof findings.surprises) };
    const slots = fallbackSlots(noSurprise);
    expect(validateSlots(slots).ok).toBe(true);
    expect(slots.surprise_phrasing!.trim().endsWith('?')).toBe(true);
  });
});
