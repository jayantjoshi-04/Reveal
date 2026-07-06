import { describe, it, expect } from 'vitest';
import { run } from '../index.js';
import { JAANHVI } from './jaanhvi.fixture.js';

describe('analysis engine · Jaanhvi golden profile', () => {
  const { findings, trait_scores } = run(JAANHVI);

  it('reads empathy as the spike (thickest network)', () => {
    expect(findings.capacities[0]!.name).toBe('empathy');
    expect(findings.capacities[0]!.is_spike).toBe(true);
    expect(findings.differentiation.top_capacity).toBe('empathy');
  });

  it('surfaces storytelling (narrative) as a surprise — strong in behaviour, never claimed', () => {
    const narrative = findings.capacities.find((c) => c.name === 'narrative')!;
    expect(narrative.is_surprise).toBe(true);
    const surprise = findings.surprises.find((s) => s.trait === 'narrative');
    expect(surprise).toBeDefined();
    expect(surprise!.situations).toBeGreaterThanOrEqual(2);
  });

  it('does not flag a claimed capacity (empathy) as a surprise', () => {
    const empathy = findings.capacities.find((c) => c.name === 'empathy')!;
    expect(empathy.is_surprise).toBe(false);
  });

  it('places the wish in the impact direction and reads "holding to pull"', () => {
    expect(findings.market.wish_dir).toBe('impact');
    expect(findings.market.pays_dir).toBe('commercial');
    expect(findings.market.classification).toBe('holding_to_pull');
    expect(findings.market.market_gap).toBeGreaterThan(0.9); // "large" band
  });

  it('classifies field research as a Real capability gap', () => {
    const fieldResearch = findings.gap.find((g) => g.capability === 'field_research');
    expect(fieldResearch).toBeDefined();
    expect(fieldResearch!.classification).toBe('real');
    expect(fieldResearch!.kind).toBe('capability');
  });

  it('protects impact under the budget cut; drops money & recognition', () => {
    const impact = findings.values.find((v) => v.name === 'impact')!;
    const money = findings.values.find((v) => v.name === 'money_security')!;
    expect(impact.protected).toBe(true);
    expect(money.protected).toBe(false);
  });

  it('finds the direction is not blocked — every gap is a learnable capability', () => {
    expect(findings.direction_check.direction_blocked).toBe(false);
    expect(findings.gap.every((g) => g.kind === 'capability')).toBe(true);
  });

  it('names the portfolio gap (no community/children project)', () => {
    expect(findings.project_pattern.gap_note).toMatch(/community|children/);
    expect(findings.project_pattern.outlier).toBe('The Ibex');
  });

  it('generates experiments only from computed findings', () => {
    const reasons = findings.experiments.map((e) => e.reason);
    expect(reasons).toContain('real_gap');
    expect(reasons).toContain('claim_surprise');
    expect(reasons).toContain('market_choice');
  });

  it('is deterministic — identical output across runs', () => {
    const again = run(JAANHVI);
    expect(again.findings).toEqual(findings);
    expect(again.trait_scores).toEqual(trait_scores);
  });
});
