/**
 * REVEAL v2.0.0 — frozen vocabularies (Schema v2 · Layer 2).
 *
 * These are the enums the engine and UI both key on. Construct *ids* live in
 * the seeded `v2_construct` table (45 rows, special glyphs like "Deep↔Broad"),
 * so they are not re-listed here — the engine reads family/type from the DB.
 * What both sides need agreed up-front is the small set of closed vocabularies
 * below: families, report slots, confidence tiers, and the fixed catalogs.
 */

// ── Construct families (six + readiness) ────────────────────────────────────
export const FAMILIES = [
  'capacity',
  'capability',
  'disposition',
  'environment',
  'value',
  'intent',
  'readiness',
] as const;
export type Family = (typeof FAMILIES)[number];

/** Stage-4 proximity family weights (ruleset v2.0.0). Sum of the scored six. */
export const FAMILY_WEIGHTS: Record<Exclude<Family, 'readiness'>, number> = {
  capacity: 0.3,
  value: 0.2,
  disposition: 0.18,
  intent: 0.12,
  capability: 0.1,
  environment: 0.1,
};

// ── The eight locked intent drivers ─────────────────────────────────────────
export const INTENT_DRIVERS = [
  'Mastery',
  'Creation',
  'Understanding',
  'Connection',
  'Recognition',
  'Impact',
  'Autonomy',
  'Security',
] as const;
export type IntentDriver = (typeof INTENT_DRIVERS)[number];

export type Valence = 'approach' | 'avoidance';

// ── Report slots (Molecule Library → payload) ───────────────────────────────
export const REPORT_SLOTS = ['headline', 'why_aligns', 'whats_hard', 'how_you_work', 'directions'] as const;
export type ReportSlot = (typeof REPORT_SLOTS)[number];

/** Top-N curation per slot (ruleset curation_weights). */
export const TOP_N_PER_SLOT: Record<'headline' | 'why_aligns' | 'whats_hard' | 'how_you_work', number> = {
  headline: 1,
  why_aligns: 3,
  whats_hard: 2,
  how_you_work: 1,
};

// ── Molecule types ──────────────────────────────────────────────────────────
export const MOLECULE_TYPES = ['gate', 'substrate', 'temper', 'tension', 'channel', 'convergence'] as const;
export type MoleculeType = (typeof MOLECULE_TYPES)[number];

// ── Confidence tiers (Stage 2 tree) ─────────────────────────────────────────
export const CONFIDENCE_TIERS = [
  'evidenced',
  'well_motivated',
  'plausible',
  'behavioural_not_neural',
  'undetermined',
] as const;
export type ConfidenceTier = (typeof CONFIDENCE_TIERS)[number];

/** Molecule-level confidence (MIN of legs → one of three). */
export const MOLECULE_CONFIDENCE = ['determined', 'tentative', 'undetermined'] as const;
export type MoleculeConfidence = (typeof MOLECULE_CONFIDENCE)[number];

export const CONFIDENCE_WEIGHT: Record<MoleculeConfidence, number> = {
  determined: 1.0,
  tentative: 0.6,
  undetermined: 0.3,
};

// ── Readiness ───────────────────────────────────────────────────────────────
export const READINESS_DIMENSIONS = [
  'capacity',
  'capability',
  'portfolio',
  'experience_exposure',
  'professional',
] as const;
export type ReadinessDimension = (typeof READINESS_DIMENSIONS)[number];
export type ReadinessTier = 'emerging' | 'developing' | 'strong';

// ── Say/Do ──────────────────────────────────────────────────────────────────
export type Channel = 'say' | 'do';
export type SayDoGapClass = 'agree' | 'real' | 'performed' | 'latent';
export type Resolvedness = 'resolved' | 'leaning' | 'genuinely_split';
export type CoherenceBand = 'coherent' | 'mixed' | 'divergent';

// ── Instance ────────────────────────────────────────────────────────────────
export type Tier = 'free' | 'paid';
export type InstanceType = 'baseline' | 're_run';

/** Pinned scoring constants (mirror ruleset v2.0.0 scoring_constants). */
export const SCORING = {
  sayDoBlend: { do: 0.65, say: 0.35 },
  sayDoGapCutoff: 15,
  evidenceThreshold: 3,
  surprise: { minGap: 30, minDo: 60 },
  coherence: { coherentBelow: 15, divergentAbove: 30 },
  readinessTiers: { emergingBelow: 40, strongAbove: 70 },
  roleDomainSplit: { role: 0.65, domain: 0.35 },
  aptitudeHighFit: 0.6,
  growthCaps: { free: 2, paid: 5 },
  changeThreshold: 15,
} as const;
