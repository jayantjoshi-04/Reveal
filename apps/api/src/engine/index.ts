/**
 * REVEAL · Layer 2 · The Analysis Engine (pure, deterministic, no LLM, no I/O)
 * ---------------------------------------------------------------------------
 * run(rawCapture, constants) → { findings, trait_scores }. Given the same raw
 * data and constants it produces identical findings every time. This is the
 * only thing that decides what is TRUE about a student; the LLM only phrases it.
 */
import { SCORING, b4Scene, type Capacity, type Findings, type RawCapture, type ScoringConstants, type TraitScore } from '@reveal/shared';
import { scoreCapacities, capacityConfidence, type CapacityScore } from './capacities.js';

/** A1 capacity appearance counts, needed to normalise A-scores server-side. */
export type Appearances = Partial<Record<Capacity, number>>;
import { scoreValues, scoreRoles, scoreGaps, scoreMarket, directionCheck, projectPattern, wishImp, scoreCoherence } from './traits.js';
import { scoreDispositions, summariseDispositions } from './dispositions.js';
import { scoreNutrients } from './nutrients.js';
import { round } from './util.js';

export const ENGINE_VERSION = '1.0.0';

export interface EngineOutput {
  engine_version: string;
  findings: Findings;
  trait_scores: TraitScore[];
}

export function run(raw: RawCapture, k: ScoringConstants = SCORING, appearances?: Appearances): EngineOutput {
  // 1 · Capacities → spike, surprises, demonstrated map. When appearances are
  //     supplied (production), A-scores are recomputed from raw items and the
  //     client-supplied score is ignored.
  const capScores = scoreCapacities(raw, k, appearances);
  const demonstratedMap = new Map<Capacity, number>(capScores.map((c) => [c.name, c.demonstrated]));

  const capacities: Findings['capacities'] = capScores.map((c, i) => ({
    name: c.name,
    demonstrated: round(c.demonstrated, 0),
    rank: i + 1,
    is_spike: i === 0,
    is_surprise: c.is_surprise,
  }));

  // 2 · Values, roles, gaps, project pattern
  const values = scoreValues(raw);
  const roles = scoreRoles(raw);
  const gap = scoreGaps(raw, k, wishImp(raw));
  const project_pattern = projectPattern(raw);

  // 3 · Market tension + direction check + coherence adjudication
  const market = scoreMarket(raw, k);
  const direction_check = directionCheck(market.wish_dir, demonstratedMap);
  const coherence = scoreCoherence(raw);

  // 4 · Surprises — from capacity surprises, ranked by agreeing situations
  const surprises: Findings['surprises'] = capScores
    .filter((c) => c.is_surprise)
    .sort((a, b) => b.situations_agree - a.situations_agree)
    .map((c) => ({
      trait: c.name,
      situations: c.situations_agree,
      confidence: (c.situations_agree >= k.CC3_MIN_AGREE ? 'high' : 'tentative') as 'high' | 'tentative',
    }));

  // 5 · Conditions
  const conditions: Findings['conditions'] = {
    thrive: raw.channel_a.a4_conditions?.thrive ?? [],
    wither: raw.channel_a.a4_conditions?.wither ?? [],
  };

  // 6 · Experiments — computed targets & routes; only wording is left to the LLM.
  const experiments: Findings['experiments'] = [];
  for (const g of gap) if (g.classification === 'real') experiments.push({ targets: g.capability, reason: 'real_gap' });
  for (const s of surprises) experiments.push({ targets: s.trait, reason: 'claim_surprise' });
  if (project_pattern.gap_note) experiments.push({ targets: project_pattern.gap_note, reason: 'portfolio_gap' });
  if (market.classification !== 'aligned') experiments.push({ targets: market.wish_dir, reason: 'market_choice' });

  // 7 · Dispositions — six bipolar positions (B9 · B3 · B7 · B8)
  const dispositions = scoreDispositions(raw);
  const dispositions_summary = summariseDispositions(dispositions);

  // 7b · Nutrients & bands — what conditions the work needs to give you
  const { nutrients, environment_surprise } = scoreNutrients(raw);

  // 7c · Attention (B4) — for each scene, the "what it communicates" lines for
  //      the distinct layers the student's eye landed on. Purely derived.
  const attention = buildAttention(raw);

  // 8 · Differentiation one-liner inputs
  const differentiation: Findings['differentiation'] = {
    top_capacity: capacities[0]?.name ?? 'empathy',
    second: capacities[1]?.name ?? 'analytical',
    direction: market.wish_dir,
    market_stance: market.classification,
  };

  const findings: Findings = {
    differentiation,
    capacities,
    roles,
    values,
    project_pattern,
    conditions,
    surprises,
    gap,
    direction_check,
    market,
    coherence,
    experiments,
    dispositions,
    dispositions_summary,
    nutrients,
    environment_surprise,
    attention,
  };

  const trait_scores = buildTraitScores(capScores, k);

  return { engine_version: ENGINE_VERSION, findings, trait_scores };
}

/** For each B4 scene, the layers the student noticed → what those reveal. */
function buildAttention(raw: RawCapture): Findings['attention'] {
  const b4 = raw.channel_b.b4_attention;
  if (!b4?.stimuli?.length) return [];
  const out: NonNullable<Findings['attention']> = [];
  for (const stim of b4.stimuli) {
    const scene = b4Scene(stim.stimulus_id);
    if (!scene) continue;
    // distinct layers, preserving the order the student tapped them in
    const seen = new Set<string>();
    const noticed: string[] = [];
    for (const mark of [...stim.marked].sort((a, b) => a.order - b.order)) {
      if (seen.has(mark.category)) continue;
      seen.add(mark.category);
      const line = scene.communicates[mark.category as keyof typeof scene.communicates];
      if (line) noticed.push(line);
    }
    if (noticed.length) out.push({ scene: scene.title, noticed });
  }
  return out;
}

/** Per-capacity trait_scores rows for the Evidence Room + debugging. */
function buildTraitScores(capScores: CapacityScore[], k: ScoringConstants): TraitScore[] {
  return capScores.map((c) => ({
    trait: c.name,
    kind: 'capacity',
    a_score: round(c.a_score),
    b_score: round(c.b_score),
    b_situations_agree: c.situations_agree,
    confidence: capacityConfidence(c, k),
    evidence: [],
  }));
}
