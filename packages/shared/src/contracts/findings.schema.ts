/**
 * REVEAL · The Findings Object (Layer 2 → Layer 3 handoff)
 * ---------------------------------------------------------------------------
 * The fully-classified, LLM-free description of a student. The synthesis layer
 * is given ONLY this object — never the raw data — so it literally cannot
 * re-judge anything. "If a fact isn't in the Findings Object, it cannot appear
 * in the report." (Analysis_Report_Templates_v3.)
 */
import { z } from 'zod';
import { CONFIDENCE_CODES, GAP_CLASSIFICATIONS, GAP_KINDS, MARKET_CLASSES } from '../enums.js';

export const findingsSchema = z.object({
  differentiation: z.object({
    top_capacity: z.string(),
    second: z.string(),
    direction: z.string(), // 'impact' | 'commercial' | 'mixed'
    market_stance: z.enum(MARKET_CLASSES),
  }),

  capacities: z.array(
    z.object({
      name: z.string(),
      demonstrated: z.number().min(0).max(100), // 0.6·B + 0.4·A ×100
      rank: z.number().int().positive(),
      is_spike: z.boolean(),
      is_surprise: z.boolean(),
    }),
  ),

  roles: z.array(
    z.object({
      name: z.string(),
      frequency: z.number().min(0).max(1),
      tier: z.enum(['demonstrated', 'emerging']),
    }),
  ),

  values: z.array(
    z.object({
      name: z.string(),
      rank: z.number().int().positive(),
      protected: z.boolean(), // survived the B1 cut
    }),
  ),

  project_pattern: z.object({
    lead_impact: z.array(z.string()),
    outlier: z.string().nullable(),
    gap_note: z.string().nullable(),
  }),

  conditions: z.object({
    thrive: z.array(z.string()),
    wither: z.array(z.string()),
  }),

  surprises: z.array(
    z.object({
      trait: z.string(),
      situations: z.number().int(),
      confidence: z.enum(['high', 'tentative']),
    }),
  ),

  gap: z.array(
    z.object({
      capability: z.string(),
      current: z.number().min(0).max(1),
      desired: z.number().min(0).max(1),
      stated_gap: z.number(),
      revealed_gap: z.number().optional(),
      classification: z.enum(GAP_CLASSIFICATIONS),
      kind: z.enum(GAP_KINDS),
    }),
  ),

  direction_check: z.object({
    requires_capacities: z.array(z.string()),
    all_present: z.boolean(),
    direction_blocked: z.boolean(),
    capacity_gaps: z.array(z.string()),
  }),

  market: z.object({
    wish_dir: z.string(),
    actual_dir: z.string(),
    pays_dir: z.string(),
    market_gap: z.number(),
    classification: z.enum(MARKET_CLASSES),
  }),

  // Resume framing vs. what the behaviour shows, adjudicated by behaviour.
  coherence: z.object({
    contradiction: z.boolean(),
    resume_frame: z.string(), // commercial | impact | mixed | unknown
    work_frame: z.string(), // commercial | impact | mixed
    adjudicated_truth: z.enum(['work', 'resume']),
    basis: z.array(z.string()), // which behavioural tasks informed it
  }),

  experiments: z.array(
    z.object({
      targets: z.string(),
      reason: z.enum(['real_gap', 'claim_surprise', 'portfolio_gap', 'market_choice']),
    }),
  ),

  // How you prefer to work — six bipolar tensions, read behaviourally. Signed
  // −1…+1 (a position, never an amount — no pole is "better"). Optional so
  // pre-dispositions derived rows still validate; the engine always sets it.
  dispositions: z
    .array(
      z.object({
        dimension: z.string(), // AR · ES · PA · RD · SB · DW
        low_pole: z.string(),
        high_pole: z.string(),
        position: z.number().min(-1).max(1),
        tier: z.enum(['well_motivated', 'thin']),
      }),
    )
    .optional(),
  dispositions_summary: z.string().optional(),

  // What conditions the work needs to give you (nutrients), sorted into bands.
  // Optional so pre-nutrient derived rows still parse; the engine always sets it.
  nutrients: z
    .array(
      z.object({
        nutrient: z.string(), // structure · feedback · challenge · novelty · resources · safety
        stated_need: z.enum(['low', 'moderate', 'high']),
        revealed_present: z.enum(['low', 'moderate', 'high']).nullable(),
        band: z.enum(['preferred', 'stretch', 'unsupportive', 'undetermined']),
        hindrance_evidence: z.boolean(),
        required_by_direction: z.boolean(),
      }),
    )
    .optional(),
  environment_surprise: z
    .object({ nutrient: z.string(), stated_need: z.string(), revealed_present: z.string() })
    .nullable()
    .optional(),

  // B4 · attention capture — per scene, what the layers the student noticed
  // first communicate. Deterministic, derived from the tapped items' categories.
  attention: z
    .array(z.object({ scene: z.string(), noticed: z.array(z.string()) }))
    .optional(),
});

export type Findings = z.infer<typeof findingsSchema>;

/** A single per-trait score row persisted in derived.trait_scores. */
export const traitScoreSchema = z.object({
  trait: z.string(),
  kind: z.enum(['capacity', 'capability', 'role', 'value', 'theme']),
  a_score: z.number().min(0).max(1),
  b_score: z.number().min(0).max(1),
  b_situations_agree: z.number().int(),
  confidence: z.enum(CONFIDENCE_CODES).nullable(),
  evidence: z.array(z.object({ source_module: z.string(), channel: z.enum(['A', 'B']), detail: z.string() })),
});
export type TraitScore = z.infer<typeof traitScoreSchema>;
