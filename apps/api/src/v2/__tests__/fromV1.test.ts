/**
 * V1 → V2 bridge — the same survey read by the deterministic engine.
 * Verifies the say↔do surprise and disposition orientation survive translation.
 */
import { describe, expect, it } from 'vitest';
import type { Findings, TraitScore } from '@reveal/shared';
import { v1ToRawCapture } from '../fromV1.js';
import { loadMasterFromSeed } from '../master.js';
import { runEngine } from '../engine/index.js';

const traitScores = [
  { trait: 'empathy', kind: 'capacity', a_score: 0.13, b_score: 0.72, b_situations_agree: 3, confidence: 'surprise', evidence: [] },
  { trait: 'conviction', kind: 'capacity', a_score: 0.78, b_score: 0.78, b_situations_agree: 3, confidence: 'CC3', evidence: [] },
  { trait: 'analytical', kind: 'capacity', a_score: 0.6, b_score: 0.65, b_situations_agree: 3, confidence: 'CC3', evidence: [] },
  { trait: 'design_research', kind: 'capability', a_score: 0.6, b_score: 0.66, b_situations_agree: 2, confidence: 'CC2', evidence: [] },
] as unknown as TraitScore[];

const findings = {
  capacities: [],
  roles: [],
  values: [{ name: 'craft', rank: 2, protected: true }],
  dispositions: [
    { dimension: 'DW', low_pole: 'Deep', high_pole: 'Wide', position: -0.6, tier: 'well_motivated' },
    { dimension: 'SB', low_pole: 'Solo', high_pole: 'Bring-in', position: 0.35, tier: 'thin' },
  ],
  nutrients: [{ nutrient: 'feedback', stated_need: 'high', revealed_present: 'high', band: 'preferred', hindrance_evidence: false, required_by_direction: true }],
} as unknown as Findings;

const master = loadMasterFromSeed();

describe('v1 → v2 bridge', () => {
  const raw = v1ToRawCapture(findings, traitScores, 'Industrial Design');
  const result = runEngine({ master, tier: 'free', rulesetVersion: '2.0.0' }, raw);
  const score = (id: string) => result.scores.find((s) => s.constructId === id);

  it('preserves the say↔do Empathy surprise through translation', () => {
    const emp = score('Empathy')!;
    expect(emp.blendedValue).toBeCloseTo(51.35, 1);
    expect(emp.sayDoGapClass).toBe('real');
    expect(result.findings.some((f) => f.kind === 'surprise' && (f.meta as { constructId?: string })?.constructId === 'Empathy')).toBe(true);
  });

  it('maps dispositions with correct pole orientation (incl. the Solo↔Alone flip)', () => {
    const deep = score('Deep↔Broad')!;
    expect(deep.positionEdge).toBe('Deep'); // v1 DW −0.6 (Deep) → v2 Deep
    const withAlone = score('With↔Alone')!;
    expect(withAlone.positionEdge).toBe('With'); // v1 SB +0.35 (Bring-in) → v2 With
  });

  it('produces ranked directions from the translated profile', () => {
    expect(result.directions.length).toBeGreaterThan(0);
    expect(result.directions[0]!.rank).toBe(1);
  });
});
