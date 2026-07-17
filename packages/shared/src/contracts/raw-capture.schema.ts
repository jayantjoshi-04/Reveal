/**
 * REVEAL · Layer 1 capture contracts (zod)
 * ---------------------------------------------------------------------------
 * The exact shapes each module/task exports into raw_capture. Fastify validates
 * incoming module submissions against these, so nothing malformed ever lands in
 * the spine. Mirrors DataSchema_v2 raw_capture.channel_a / channel_b / portfolio.
 */
import { z } from 'zod';
import {
  CAPACITIES,
  VALUES,
  ROLES,
  CAPABILITIES,
  THEMES,
  B4_CATEGORIES,
  DISRUPTION_RESPONSES,
  RESUME_FRAMES,
  CONDITION_TAGS,
} from '../enums.js';

const unit = z.number().min(0).max(1); // normalised 0–1 score
const signed = z.number().min(-1).max(1); // −1..+1 axis
const ms = z.number().int().nonnegative();

const capacityEnum = z.enum(CAPACITIES);
const valueEnum = z.enum(VALUES);
const roleEnum = z.enum(ROLES);
const capabilityEnum = z.enum(CAPABILITIES);
const themeEnum = z.enum(THEMES);

// ── Channel A ──────────────────────────────────────────────────────────────
export const a1CapacitiesSchema = z.object({
  items: z.array(z.object({ prompt_id: z.string(), chosen_capacity: capacityEnum, ms })),
  score: z.record(capacityEnum, unit).optional(),
});

export const a2RolesSchema = z.object({
  project_tags: z.record(z.string(), z.array(roleEnum)),
  direct_pick: z.array(roleEnum).max(2),
  score: z.record(roleEnum, unit).optional(),
});

export const a3ValuesSchema = z.object({
  ranked: z.array(valueEnum).length(12),
  never_compromise: z.object({ value: valueEnum, why: z.string() }),
  let_go: z.array(valueEnum).max(2),
  score: z.record(valueEnum, unit).optional(),
});

export const a4ConditionsSchema = z.object({
  thrive: z.array(z.string()),
  wither: z.array(z.string()),
  best_when: z.string().optional(),
  stuck_when: z.string().optional(),
});

export const a5EncountersSchema = z.object({
  logs: z.array(
    z.object({ what: z.string(), why: z.string(), feeling: z.string(), themes: z.array(themeEnum) }),
  ),
  score: z.record(themeEnum, unit).optional(),
});

export const a6ObsessionsSchema = z.object({
  topics: z.array(z.string()),
  saves_reads_watches: z.string().optional(),
  admired: z.array(z.object({ name: z.string(), why: z.string() })).max(3),
});

export const a7AspirationSchema = z.object({
  desired_levels: z.record(capabilityEnum, unit),
  desired_skills_ranked: z.array(capabilityEnum).max(5),
  desired_impact: z.string().optional(),
  desired_environment: z
    .enum(['own_venture', 'studio', 'in_house', 'ngo', 'research_academia', 'freelance', 'undecided'])
    .optional(),
  future_self_text: z.string().optional(),
  perceived_market_rank: z.array(z.object({ field: z.string(), rank: z.number().int() })),
  direction_market_stance: z.enum(['aligned', 'slightly_apart', 'opposed']),
});

export const channelASchema = z.object({
  a1_capacities: a1CapacitiesSchema.optional(),
  a2_roles: a2RolesSchema.optional(),
  a3_values: a3ValuesSchema.optional(),
  a4_conditions: a4ConditionsSchema.optional(),
  a5_encounters: a5EncountersSchema.optional(),
  a6_obsessions: a6ObsessionsSchema.optional(),
  a7_aspiration: a7AspirationSchema.optional(),
});

// ── Channel B ──────────────────────────────────────────────────────────────
export const b1BudgetSchema = z.object({
  revealed_rank: z.array(
    z.object({ value: valueEnum, tier: z.enum(['core', 'cut']), fund_rank: z.number().int(), fund_ms: ms }),
  ),
  cut_order: z.array(z.object({ value: valueEnum, cut_rank: z.number().int(), cut_ms: ms })),
  total_ms: ms,
});

export const b2DilemmasSchema = z.object({
  choices: z.array(
    z.object({ scenario_id: z.string(), chosen_pole: z.string(), disposition: z.string().optional(), ms }),
  ),
});

export const b3MovesSchema = z.object({
  ordered_moves: z.array(z.string()).length(3),
  first_question: z.string().optional(),
});

export const b4AttentionSchema = z.object({
  stimuli: z.array(
    z.object({
      stimulus_id: z.string(),
      marked: z.array(z.object({ category: z.enum([...B4_CATEGORIES, 'uncategorised']), order: z.number().int() })),
    }),
  ),
});

const centroid = z.object({ imp: signed, hum: signed });
export const b5WishsortSchema = z.object({
  wish: z.array(z.object({ id: z.number().int(), imp: signed, hum: signed, pick_rank: z.number().int(), ms })),
  actual: z.array(z.object({ id: z.number().int(), imp: signed, hum: signed, pick_rank: z.number().int(), ms })),
  pays_best: z.array(z.object({ id: z.number().int(), imp: signed, hum: signed, pick_rank: z.number().int(), ms })),
  centroid_wish: centroid.optional(),
  centroid_actual: centroid.optional(),
  centroid_lucrative: centroid.optional(),
  revealed_gap: z.number().optional(),
  market_gap: z.number().optional(),
});

export const b6UploadSchema = z.object({
  images: z.array(z.object({ ref: z.string(), why: z.string(), tags: z.record(z.string(), signed).optional() })),
  detected_thread: z.array(z.string()).optional(),
  confirmed: z.boolean().nullable().optional(),
});

export const b7YearSchema = z.object({
  allocation: z.record(z.string(), z.number().int()),
  current_estimate: z.record(z.string(), z.number().int()).optional(),
  total: z.literal(12),
});

export const b8DisruptionSchema = z.object({
  disruptions: z.array(
    z.object({ response: z.enum(DISRUPTION_RESPONSES), recovery_ms: ms, generated_new: z.boolean() }),
  ),
  felt: z.string().optional(),
});

// B9 scenario suite — per scenario, the chosen Q1 action + Q2 variant (indices).
// The engine resolves indices against the SCENARIOS content to score.
export const b9ScenariosSchema = z.object({
  scenarios: z.array(
    z.object({
      scenario_id: z.string(),
      q1_choice: z.number().int().min(0),
      q1_ms: ms.optional(),
      why_text: z.string().optional(), // captured & shown, never scored in v1
      q2_choice: z.number().int().min(0),
      q2_ms: ms.optional(),
    }),
  ),
});

export const channelBSchema = z.object({
  b1_budget: b1BudgetSchema.optional(),
  b2_dilemmas: b2DilemmasSchema.optional(),
  b3_moves: b3MovesSchema.optional(),
  b4_attention: b4AttentionSchema.optional(),
  b5_wishsort: b5WishsortSchema.optional(),
  b6_upload: b6UploadSchema.optional(),
  b7_year: b7YearSchema.optional(),
  b8_disruption: b8DisruptionSchema.optional(),
  b9_scenarios: b9ScenariosSchema.optional(),
});

// ── Portfolio ──────────────────────────────────────────────────────────────
export const projectSchema = z.object({
  project_id: z.string(),
  title: z.string(),
  domain: z.string().optional(),
  initiated: z.enum(['self', 'assigned']).optional(),
  group: z.enum(['solo', 'group']).optional(),
  artefacts: z.object({ research: z.boolean(), process: z.boolean(), final: z.boolean() }).optional(),
  individual_contribution: z.string().optional(),
  roles: z.array(roleEnum).optional(),
  demonstrated_capabilities: z.array(capabilityEnum).optional(),
  commercial_impact_self_tag: signed.optional(),
  noticed_unasked: z.string().optional(),
  // A8 interpretive: whether it went well + the setting it happened in (the
  // REVEALED side of the nutrient read).
  went_well: z.boolean().optional(),
  condition_tags: z.array(z.enum(CONDITION_TAGS)).optional(),
});

export const portfolioSchema = z.object({
  projects: z.array(projectSchema).default([]),
  // A8 struggled-project probe — the only hindrance evidence the instrument
  // holds. Reads the SETTING ("what was the room like?"), never the failure.
  struggled_project: z
    .object({
      present: z.boolean(),
      condition_tags: z.array(z.enum(CONDITION_TAGS)).default([]),
      note: z.string().optional(),
    })
    .optional(),
  resume: z
    .object({ uploaded: z.boolean(), file_ref: z.string().optional(), parsed_frame: z.enum(RESUME_FRAMES) })
    .optional(),
});

export const rawCaptureSchema = z.object({
  channel_a: channelASchema,
  channel_b: channelBSchema,
  portfolio: portfolioSchema,
});

export type ChannelA = z.infer<typeof channelASchema>;
export type ChannelB = z.infer<typeof channelBSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
export type RawCapture = z.infer<typeof rawCaptureSchema>;

/** Maps a module code → the zod schema that validates its submitted payload. */
export const MODULE_PAYLOAD_SCHEMAS = {
  a1: a1CapacitiesSchema,
  a3: a3ValuesSchema,
  a4: a4ConditionsSchema,
  a5: a5EncountersSchema,
  a6: a6ObsessionsSchema,
  a7: a7AspirationSchema,
  b1: b1BudgetSchema,
  b2: b2DilemmasSchema,
  b3: b3MovesSchema,
  b4: b4AttentionSchema,
  b5: b5WishsortSchema,
  b6: b6UploadSchema,
  b7: b7YearSchema,
  b8: b8DisruptionSchema,
  b9: b9ScenariosSchema,
} as const;
