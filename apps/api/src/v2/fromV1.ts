/**
 * Bridge: a completed v1 survey → a v2 raw-capture the deterministic engine can
 * read. Both reports are then two readings of the SAME answers — which is the
 * whole point of the report-time V1/V2 switch.
 *
 * The v1 instrument covers a subset of the v2 construct space (6 capacities,
 * 6 dispositions, the nutrient/environment axes, some capabilities and values),
 * so the v2 reading is honest about its gaps — unmeasured constructs simply
 * surface as open questions, never invented.
 */
import type { Findings, TraitScore } from '@reveal/shared';
import type { RawCapture, RawResponse, Signal } from './engine/types.js';

// v1 trait name → v2 construct id
const CAPACITY_MAP: Record<string, string> = {
  empathy: 'Empathy',
  analytical: 'Analytical',
  aesthetic: 'Aesthetic',
  systems_sensing: 'Systems',
  narrative: 'Narrative',
  conviction: 'Conviction',
};

const CAPABILITY_MAP: Record<string, string> = {
  design_research: 'Research',
  field_research: 'Research',
  framing: 'Research',
  prototyping: 'Making',
  craft_execution: 'Making',
  ideation: 'Making',
  visual_comm: 'Sketch/Viz',
  material_media: 'Materials',
  functional_usability: 'Digital/Intx',
  systems_service: 'Sustain/Sys',
  facilitation: 'Collab',
  venture: 'Collab',
};

// v1 disposition dim → v2 bipolar { id, flip } (flip when the poles are inverted)
const DISPOSITION_MAP: Record<string, { id: string; low: string; high: string; flip: boolean }> = {
  AR: { id: 'Reflect↔Action', low: 'Reflect', high: 'Action', flip: true }, // v1 +1 = Reflect = v2 low
  ES: { id: 'Experiment↔Study', low: 'Experiment', high: 'Study', flip: false },
  PA: { id: 'Persist↔Pivot', low: 'Persist', high: 'Pivot', flip: false },
  RD: { id: 'Reinvent↔Redefine', low: 'Reinvent', high: 'Redefine', flip: false },
  SB: { id: 'With↔Alone', low: 'With', high: 'Alone', flip: true }, // v1 Solo(−1) = v2 Alone(high)
  DW: { id: 'Deep↔Broad', low: 'Deep', high: 'Broad', flip: false },
};

// v1 nutrient → v2 environment axis (present = high pole)
const NUTRIENT_MAP: Record<string, { id: string; low: string; high: string }> = {
  structure: { id: 'Auto↔Structure', low: 'Auto', high: 'Structure' },
  feedback: { id: 'Insul↔Feedback', low: 'Insul', high: 'Feedback' },
  challenge: { id: 'Routine↔Challenge', low: 'Routine', high: 'Challenge' },
  novelty: { id: 'Single↔Novelty', low: 'Single', high: 'Novelty' },
  resources: { id: 'Boot↔Resourced', low: 'Boot', high: 'Resourced' },
  safety: { id: 'Blame↔Safe', low: 'Blame', high: 'Safe' },
};

const LEVEL_TO_POS: Record<string, number> = { low: -40, moderate: 20, high: 70 };

const r = (activityId: string, channel: 'say' | 'do', signals: Signal[]): RawResponse => ({ activityId, channel, rawPayload: { signals } });

export function v1ToRawCapture(findings: Findings, traitScores: TraitScore[], enrolledField: string | null): RawCapture {
  const responses: RawResponse[] = [];
  const doActs = ['A1', 'A3', 'B2']; // spread capacities over distinct situations → evidence count

  // ── Capacities (say/do preserved from trait a/b scores → the surprise) ──
  for (const t of traitScores.filter((x) => x.kind === 'capacity')) {
    const id = CAPACITY_MAP[t.trait];
    if (!id) continue;
    const doVal = Math.round(t.b_score * 100);
    doActs.forEach((a) => responses.push(r(a, 'do', [{ constructId: id, channel: 'do', value: doVal }])));
    if (t.a_score != null) responses.push(r('U1', 'say', [{ constructId: id, channel: 'say', value: Math.round(t.a_score * 100) }]));
  }
  // Fallback: capacities present only in findings (demonstrated), not trait_scores.
  for (const c of findings.capacities ?? []) {
    const id = CAPACITY_MAP[c.name];
    if (!id || traitScores.some((t) => t.kind === 'capacity' && CAPACITY_MAP[t.trait] === id)) continue;
    doActs.forEach((a) => responses.push(r(a, 'do', [{ constructId: id, channel: 'do', value: Math.round(c.demonstrated) }])));
  }

  // ── Capabilities ──
  const capabByV2 = new Map<string, number[]>();
  for (const t of traitScores.filter((x) => x.kind === 'capability')) {
    const id = CAPABILITY_MAP[t.trait];
    if (!id) continue;
    (capabByV2.get(id) ?? capabByV2.set(id, []).get(id)!).push(Math.round(t.b_score * 100));
  }
  for (const [id, vals] of capabByV2) {
    const v = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    ['B1', 'U3'].forEach((a) => responses.push(r(a, 'do', [{ constructId: id, channel: 'do', value: v }])));
  }

  // ── Dispositions (signed positions −1..1 → −100..100) ──
  for (const d of findings.dispositions ?? []) {
    const m = DISPOSITION_MAP[d.dimension];
    if (!m) continue;
    const val = Math.round((m.flip ? -d.position : d.position) * 100);
    const edge = val >= 0 ? m.high : m.low;
    ['F1', 'A6'].forEach((a) => responses.push(r(a, 'do', [{ constructId: m.id, channel: 'do', value: val, position: val, edge }])));
  }

  // ── Environment (nutrients: revealed present toward the high pole) ──
  for (const n of findings.nutrients ?? []) {
    const m = NUTRIENT_MAP[n.nutrient];
    if (!m) continue;
    const present = n.revealed_present ?? null;
    if (present) {
      const val = LEVEL_TO_POS[present] ?? 0;
      const edge = val >= 0 ? m.high : m.low;
      responses.push(r('B3', 'do', [{ constructId: m.id, channel: 'do', value: val, position: val, edge }]));
    }
    const stated = LEVEL_TO_POS[n.stated_need] ?? null;
    if (stated != null) {
      const edge = stated >= 0 ? m.high : m.low;
      responses.push(r('F4', 'say', [{ constructId: m.id, channel: 'say', value: stated, position: stated, edge }]));
    }
  }

  // ── Values (light: the protected/top values become axis leans) ──
  const valueLean: Record<string, { id: string; edge: string; value: number }> = {
    craft: { id: 'Craft↔Velocity', edge: 'Craft', value: -55 },
    impact: { id: 'Impact↔Income', edge: 'Impact', value: -55 },
    money_security: { id: 'Impact↔Income', edge: 'Income', value: 55 },
    autonomy: { id: 'Auton↔Belong', edge: 'Auton', value: -50 },
    justice: { id: 'Equity↔Focus', edge: 'Equity', value: -50 },
  };
  for (const v of findings.values ?? []) {
    const lean = valueLean[v.name];
    if (!lean || v.rank > 6) continue;
    responses.push(r('F1', 'do', [{ constructId: lean.id, channel: 'do', value: lean.value, position: lean.value, edge: lean.edge }]));
  }

  return { enrolledField, responses };
}
