/**
 * REVEAL · Frozen enums
 * ---------------------------------------------------------------------------
 * The vocabularies the whole instrument is built on. Defined ONCE here and
 * imported by both the backend engine and the frontend so the traits the UI
 * renders are exactly the traits the engine scores.
 *
 * Source: DataSchema_v2 "enums to freeze" + ChannelAB_Content_v2.
 * "Craft moved from capacity → capability" is reflected below.
 */

// ── Capacities · 6 · innate leanings (Channel A1) ──────────────────────────
export const CAPACITIES = [
  'empathy',
  'analytical',
  'aesthetic',
  'systems_sensing',
  'narrative',
  'conviction',
] as const;
export type Capacity = (typeof CAPACITIES)[number];

/** Two-letter option tags used in the A1 content (EM/AN/AE/SY/NA/CV). */
export const CAPACITY_BY_TAG: Record<string, Capacity> = {
  EM: 'empathy',
  AN: 'analytical',
  AE: 'aesthetic',
  SY: 'systems_sensing',
  NA: 'narrative',
  CV: 'conviction',
};

// ── Capabilities · 12 · learnable skills (Channel A7) ──────────────────────
export const CAPABILITIES = [
  'design_research',
  'field_research',
  'framing',
  'ideation',
  'prototyping',
  'craft_execution',
  'visual_comm',
  'material_media',
  'functional_usability',
  'systems_service',
  'facilitation',
  'venture',
] as const;
export type Capability = (typeof CAPABILITIES)[number];

// ── Roles · 7 · recurring roles (Channel A2) ───────────────────────────────
export const ROLES = [
  'researcher',
  'empathiser_advocate',
  'storyteller',
  'sensemaker',
  'builder_maker',
  'facilitator_leader',
  'organiser',
] as const;
export type Role = (typeof ROLES)[number];

// ── Values · 12 · forced ranking (Channel A3 / task B1) ────────────────────
export const VALUES = [
  'empathy',
  'impact',
  'justice',
  'storytelling',
  'teaching',
  'craft',
  'autonomy',
  'recognition',
  'money_security',
  'learning_growth',
  'beauty',
  'solving_hard_problems',
] as const;
export type Value = (typeof VALUES)[number];

// ── Themes · salience taxonomy · shared by A5, A6, B4, B6 ──────────────────
export const THEMES = [
  'history',
  'story_narrative',
  'people_emotion',
  'form_aesthetics',
  'systems_how',
  'telling_detail',
  'craft',
  'beauty',
  'justice',
] as const;
export type Theme = (typeof THEMES)[number];

// ── B4 attention-zone categories · 5 · area-balanced ───────────────────────
export const B4_CATEGORIES = ['PEOPLE', 'FORM', 'SYSTEM', 'DETAIL', 'TEXT'] as const;
export type B4Category = (typeof B4_CATEGORIES)[number];

// ── B5 artifact style axis ─────────────────────────────────────────────────
export const ARTIFACT_STYLES = ['craft', 'systems', 'concept'] as const;
export type ArtifactStyle = (typeof ARTIFACT_STYLES)[number];

// ── B8 disruption response ─────────────────────────────────────────────────
export const DISRUPTION_RESPONSES = ['abandon', 'adapt', 'reframe'] as const;
export type DisruptionResponse = (typeof DISRUPTION_RESPONSES)[number];

// ── Dispositions · 6 bipolar tensions · signed −1…+1 · no better pole ───────
// Read behaviourally from B3 (AR/ES/SB), B7 (DW) and B8 (PA/RD).
export const DISPOSITION_DIMS = [
  { code: 'AR', low: 'Act', high: 'Reflect' },
  { code: 'ES', low: 'Experiment', high: 'Study' },
  { code: 'PA', low: 'Persist', high: 'Adapt' },
  { code: 'RD', low: 'Reinvent', high: 'Discipline' },
  { code: 'SB', low: 'Solo', high: 'Bring-in' },
  { code: 'DW', low: 'Deep', high: 'Wide' },
] as const;
export type DispositionCode = (typeof DISPOSITION_DIMS)[number]['code'];

/** Disposition pole label → dimension + sign (− = low pole, + = high pole). */
export const POLE_TO_DIM: Record<string, { dim: DispositionCode; sign: -1 | 1 }> = {
  Act: { dim: 'AR', sign: -1 }, Reflect: { dim: 'AR', sign: 1 },
  Experiment: { dim: 'ES', sign: -1 }, Study: { dim: 'ES', sign: 1 },
  Persist: { dim: 'PA', sign: -1 }, Adapt: { dim: 'PA', sign: 1 },
  Reinvent: { dim: 'RD', sign: -1 }, Discipline: { dim: 'RD', sign: 1 },
  Solo: { dim: 'SB', sign: -1 }, 'Bring-in': { dim: 'SB', sign: 1 },
  'Go-deep': { dim: 'DW', sign: -1 }, 'Range-wide': { dim: 'DW', sign: 1 },
};

// ── Nutrients · 6 environmental conditions · dosage low/moderate/high ────────
export const NUTRIENTS = ['structure', 'feedback', 'challenge', 'novelty', 'resources', 'safety'] as const;
export type Nutrient = (typeof NUTRIENTS)[number];
export const NUTRIENT_LABEL: Record<Nutrient, string> = {
  structure: 'Structure', feedback: 'Feedback', challenge: 'Challenge',
  novelty: 'Novelty', resources: 'Resources', safety: 'Safety',
};
export const NUTRIENT_LEVELS = ['low', 'moderate', 'high'] as const;
export type NutrientLevel = (typeof NUTRIENT_LEVELS)[number];
export const NUTRIENT_BANDS = ['preferred', 'stretch', 'unsupportive', 'undetermined'] as const;
export type NutrientBand = (typeof NUTRIENT_BANDS)[number];

// ── Condition tags · 12 paired · the revealed side of the nutrient read ─────
// Each project (and the struggled-project probe) is tagged with any that applied.
export const CONDITION_TAGS = [
  'tight_structure', 'no_structure',
  'constant_feedback', 'little_feedback',
  'out_of_depth', 'within_range',
  'new_territory', 'familiar_ground',
  'had_resources', 'made_do',
  'safe_to_be_wrong', 'high_stakes_exposed',
] as const;
export type ConditionTag = (typeof CONDITION_TAGS)[number];
/** Which nutrient + pole (+ present / − absent) a condition tag evidences. */
export const CONDITION_TAG_TO_NUTRIENT: Record<ConditionTag, { nutrient: Nutrient; positive: boolean }> = {
  tight_structure: { nutrient: 'structure', positive: true }, no_structure: { nutrient: 'structure', positive: false },
  constant_feedback: { nutrient: 'feedback', positive: true }, little_feedback: { nutrient: 'feedback', positive: false },
  out_of_depth: { nutrient: 'challenge', positive: true }, within_range: { nutrient: 'challenge', positive: false },
  new_territory: { nutrient: 'novelty', positive: true }, familiar_ground: { nutrient: 'novelty', positive: false },
  had_resources: { nutrient: 'resources', positive: true }, made_do: { nutrient: 'resources', positive: false },
  safe_to_be_wrong: { nutrient: 'safety', positive: true }, high_stakes_exposed: { nutrient: 'safety', positive: false },
};

// ── B7 unconstrained-year pursuits · months sum to 12 ───────────────────────
export const B7_PURSUITS = [
  'deepen_a_craft',
  'learn_a_new_domain',
  'work_with_a_community',
  'build_a_venture',
  'travel_and_absorb',
  'teach',
  'personal_work',
  'study_research',
] as const;
export type B7Pursuit = (typeof B7_PURSUITS)[number];

// ── Conditions · A4 thrive / wither checklists ─────────────────────────────
export const THRIVE_CONDITIONS = [
  'clear_purpose',
  'see_who_it_helps',
  'in_the_field',
  'start_before_figured_out',
  'own_calls',
  'team_shares_cause',
  'learning_new',
  'genuinely_hard',
  'go_deep_uninterrupted',
  'see_impact',
  'trusted_to_run',
  'variety',
] as const;
export const WITHER_CONDITIONS = [
  'purely_commercial',
  'no_empathy',
  'only_money',
  'vision_mismatch',
  'perfect_before_begin',
  'for_portfolio_not_person',
  'rigid_process',
  'alone_no_thinking',
  'shifting_goals',
  'constant_switching',
  'decisions_handed_down',
  'speed_over_care',
] as const;
export type ThriveCondition = (typeof THRIVE_CONDITIONS)[number];
export type WitherCondition = (typeof WITHER_CONDITIONS)[number];

// ── Module codes · the interleaved capture sequence ────────────────────────
export const MODULE_CODES = [
  'consent',
  'portfolio_facts',
  'a1',
  'b3',
  'b4',
  'b1',
  'a3',
  'b2',
  'a4',
  'b8',
  'b5',
  'b7',
  'a7',
  'b6',
  'b9',
  'a5',
  'a6',
  'portfolio_interpretive',
  'resume',
] as const;
export type ModuleCode = (typeof MODULE_CODES)[number];

// ── Status / classification enums (mirror the SQL types) ───────────────────
export const INSTANCE_STATUS = [
  'in_progress',
  'capture_complete',
  'generated',
  'reviewed',
  'released',
] as const;
export type InstanceStatus = (typeof INSTANCE_STATUS)[number];

export const SESSION_STATUS = ['not_started', 'in_progress', 'sealed'] as const;
export type SessionStatus = (typeof SESSION_STATUS)[number];

export const CONFIDENCE_CODES = ['CC3', 'CC2', 'contradicted', 'surprise'] as const;
export type ConfidenceCode = (typeof CONFIDENCE_CODES)[number];

export const GAP_CLASSIFICATIONS = ['real', 'performed', 'latent'] as const;
export type GapClassification = (typeof GAP_CLASSIFICATIONS)[number];

export const GAP_KINDS = ['capability', 'capacity'] as const;
export type GapKind = (typeof GAP_KINDS)[number];

export const MARKET_CLASSES = ['aligned', 'drifting_to_market', 'holding_to_pull'] as const;
export type MarketClass = (typeof MARKET_CLASSES)[number];

export const RESUME_FRAMES = ['commercial', 'impact', 'mixed', 'unknown'] as const;
export type ResumeFrame = (typeof RESUME_FRAMES)[number];

export const STAFF_ROLES = ['facilitator', 'admin'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const REVIEW_DECISIONS = ['pending', 'approved', 'flagged', 'edited'] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

/** Which market direction a wish/actual/pays centroid leans toward. */
export const DIRECTIONS = ['impact', 'commercial', 'mixed'] as const;
export type Direction = (typeof DIRECTIONS)[number];
