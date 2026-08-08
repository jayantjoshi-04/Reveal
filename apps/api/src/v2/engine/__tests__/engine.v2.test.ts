/**
 * REVEAL v2 engine — determinism + Jaanhvi worked-numbers verification.
 *
 * Where the handover pins exact numbers (blend, gap, surprise, proximity
 * asymmetry, the honesty thesis), we assert them; elsewhere we assert robust
 * invariants rather than brittle exact ranks.
 */
import { describe, expect, it } from 'vitest';
import { aggregate, derive } from '../stage1_2.js';
import { proximity } from '../stage4_5_7.js';
import { selectGrowth } from '../growth.js';
import { compareInstances, runEngine } from '../index.js';
import { assemblePayload } from '../assembly.js';
import { loadMasterFromSeed } from '../../master.js';
import { jaanhviCapture } from './jaanhvi.v2.fixture.js';
import type { MasterData, RawCapture } from '../types.js';

const master = loadMasterFromSeed();
const result = runEngine({ master, tier: 'free', rulesetVersion: '2.0.0' }, jaanhviCapture);
const score = (id: string) => result.scores.find((s) => s.constructId === id);

// ── Stage 1–2 · the pinned blend, gap, and confidence ───────────────────────
describe('Stage 2 · aggregation', () => {
  const tinyMaster = (): MasterData => ({
    constructs: [{ id: 'Empathy', family: 'capacity', name: 'Empathy', type: 'amount', scale: '0..100', edgeLow: null, edgeHigh: null, hardnessToClose: null }],
    options: [], derivations: [], molecules: [], roles: [], domains: [], profiles: [], growth: [],
  });
  const cap = (channel: 'say' | 'do', value: number, act: string): RawCapture['responses'][number] => ({
    activityId: act, channel, rawPayload: { signals: [{ constructId: 'Empathy', channel, value }] },
  });

  it('blends 0.65·do + 0.35·say (Empathy 13/72 → 51.35)', () => {
    const m = tinyMaster();
    const raw: RawCapture = { responses: [cap('do', 72, 'A3'), cap('do', 71, 'O2'), cap('do', 73, 'B2'), cap('say', 13, 'U1')] };
    const [s] = aggregate(m, derive(m, raw));
    expect(s!.blendedValue).toBeCloseTo(51.35, 1);
    expect(s!.sayDoGapClass).toBe('real'); // do−say = 59 > 15
    expect(s!.demonstratedValue).toBeGreaterThanOrEqual(70); // capacity = demonstrated
  });

  it('marks a do-only capacity latent / behavioural-not-neural', () => {
    const m = tinyMaster();
    const raw: RawCapture = { responses: [cap('do', 65, 'A3'), cap('do', 66, 'O2')] };
    const [s] = aggregate(m, derive(m, raw));
    expect(s!.sayDoGapClass).toBe('latent');
    expect(s!.confidenceTier).toBe('behavioural_not_neural');
  });
});

// ── Stage 4 · asymmetric penalty ────────────────────────────────────────────
describe('Stage 4 · proximity asymmetry', () => {
  it('penalises shortfall on amount constructs but not exceeding', () => {
    const base: MasterData = {
      constructs: [{ id: 'Empathy', family: 'capacity', name: 'Empathy', type: 'amount', scale: '0..100', edgeLow: null, edgeHigh: null, hardnessToClose: null }],
      options: [], derivations: [], molecules: [],
      roles: [{ id: 'r1', track: 'physical', name: 'Role', primaryIntent: null }],
      domains: [{ id: 'd1', track: 'physical', name: 'Dom', criticalSkills: [] }],
      profiles: [
        { id: 'p1', targetType: 'role', targetId: 'r1', constructId: 'Empathy', requiredLevel: 60, isCritical: false },
        { id: 'p2', targetType: 'domain', targetId: 'd1', constructId: 'Empathy', requiredLevel: 60, isCritical: false },
      ],
      growth: [],
    };
    const rawFor = (v: number): RawCapture => ({ responses: [{ activityId: 'A3', channel: 'do', rawPayload: { signals: [{ constructId: 'Empathy', channel: 'do', value: v }] } }] });
    const exceed = proximity(base, aggregate(base, derive(base, rawFor(80))), rawFor(80))[0];
    const short = proximity(base, aggregate(base, derive(base, rawFor(40))), rawFor(40))[0];
    expect(exceed!.roleFit).toBe(1); // exceeding the requirement is a perfect fit
    expect(short!.roleFit).toBeLessThan(1); // a shortfall is penalised
  });
});

// ── Full Jaanhvi run against the real seed ──────────────────────────────────
describe('Jaanhvi · worked run (seed)', () => {
  it('Empathy is the say↔do surprise, blended ≈ 51', () => {
    const emp = score('Empathy')!;
    expect(emp.blendedValue).toBeCloseTo(51.35, 1);
    expect(emp.sayDoGapClass).toBe('real');
    const surprise = result.findings.find((f) => f.kind === 'surprise');
    expect(surprise?.meta).toMatchObject({ constructId: 'Empathy' });
  });

  it('Conviction leads and is evidenced', () => {
    const c = score('Conviction')!;
    expect(c.blendedValue).toBeGreaterThanOrEqual(75);
    expect(c.confidenceTier).toBe('evidenced');
  });

  it('fires the signature molecules (T1, T2, G1, S2, Tn2) and a curated headline temper', () => {
    const fired = new Set(result.molecules.filter((m) => m.fired).map((m) => m.moleculeRuleId));
    for (const id of ['T1', 'T2', 'G1', 'S2', 'Tn2']) expect(fired.has(id)).toBe(true);
    const headline = result.molecules.find((m) => m.curatedIn && m.reportSlot === 'headline');
    expect(headline).toBeTruthy();
    expect(['T1', 'T2', 'T3', 'T4']).toContain(headline!.moleculeRuleId); // a Temper, verb-pattern
    expect(headline!.renderedText.length).toBeGreaterThan(0);
  });

  it('ranks a research/empathy direction top and shows the enrolled field honestly (not hidden, far lower)', () => {
    const dr = result.directions.find((d) => d.roleName.startsWith('Design Researcher'))!;
    const indus = result.directions.find((d) => d.roleName.includes('Industrial'))!;
    expect(dr.rank).toBeLessThanOrEqual(3);
    expect(indus.rank).toBeGreaterThan(dr.rank + 5); // her enrolled field is her weakest fit
    result.directions.forEach((d) => expect(d.proximityScore).toBeGreaterThanOrEqual(0));
    result.directions.forEach((d) => expect(d.proximityScore).toBeLessThanOrEqual(1));
  });

  it('scores five readiness dimensions with valid tiers', () => {
    expect(result.readiness).toHaveLength(5);
    for (const r of result.readiness) expect(['emerging', 'developing', 'strong']).toContain(r.tier);
    expect(result.readiness.find((r) => r.dimension === 'experience_exposure')!.tier).toBe('emerging');
  });

  it('selects growth vehicles, including the systems-synthesis vehicle (PV-014) at paid depth', () => {
    expect(result.growth.length).toBeGreaterThan(0);
    const paid = selectGrowth({ master, scores: result.scores, readiness: result.readiness, directions: result.directions, raw: jaanhviCapture, tier: 'paid' });
    expect(paid.some((g) => g.growthVehicleId === 'PV-014')).toBe(true);
  });

  it('compiles a payload with a headline, the Empathy surprise, and the enrolled field', () => {
    const payload = assemblePayload(result, master, jaanhviCapture, {
      reportInstanceId: 'ri_test', studentName: 'Jaanhvi Hiremath', enrolledField: 'Industrial Design',
      tier: 'free', instanceType: 'baseline', rulesetVersion: '2.0.0', asOfDate: '2026-08-08', priorInstanceId: null,
    });
    expect(payload.hero.headline.length).toBeGreaterThan(0);
    expect(payload.hero.headline_molecule_id).toBeTruthy();
    expect(payload.meta.enrolled_field).toBe('Industrial Design');
    expect(payload.surprises[0]?.construct_id).toBe('Empathy');
    expect(payload.hero.signature_tiles.some((t) => t.is_surprise)).toBe(true);
    expect(payload.section_heading.readiness).toHaveLength(5);
  });
});

// ── Stage 9 · determinism firewall ──────────────────────────────────────────
describe('determinism', () => {
  it('same raw capture + ruleset ⇒ identical scores', () => {
    const again = runEngine({ master, tier: 'free', rulesetVersion: '2.0.0' }, jaanhviCapture);
    expect(JSON.stringify(again.scores)).toBe(JSON.stringify(result.scores));
  });

  it('comparing an instance to itself yields a null result (no manufactured growth)', () => {
    const cmp = compareInstances(result, result);
    expect(cmp.nullResultFlag).toBe(true);
    expect(cmp.moleculesGained).toHaveLength(0);
  });
});
