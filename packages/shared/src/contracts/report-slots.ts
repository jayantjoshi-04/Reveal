/**
 * REVEAL · Layer 3 report slots + tone contract
 * ---------------------------------------------------------------------------
 * The LLM's entire job is to phrase the Findings Object into these fixed slots
 * — warmly, correctly, within the rails. Violations are integrity failures, not
 * style notes. The synthesis validator enforces the `maxWords` and `rules`.
 * Source: Analysis_Report_Templates_v3, "The slots the LLM fills".
 */
import { z } from 'zod';

export interface SlotDef {
  id: string;
  readsFrom: string;
  maxWords: number;
  /** Machine-checkable rules the validator enforces. */
  mustEndWithQuestion?: boolean;
  noComparison?: boolean;
  description: string;
}

export const REPORT_SLOTS: readonly SlotDef[] = [
  {
    id: 'differentiation_statement',
    readsFrom: 'differentiation',
    maxWords: 24,
    noComparison: true,
    description: 'Must name top capacity + direction. No comparison to others.',
  },
  {
    id: 'capacity_line',
    readsFrom: 'capacities',
    maxWords: 40,
    noComparison: true,
    description: 'Intra-individual; plasticity framing ("thick today / can grow").',
  },
  { id: 'roles_line', readsFrom: 'roles', maxWords: 30, description: 'Describe, don\'t prescribe.' },
  { id: 'values_line', readsFrom: 'values', maxWords: 30, description: 'Describe, don\'t prescribe.' },
  { id: 'conditions_line', readsFrom: 'conditions', maxWords: 30, description: 'Describe, don\'t prescribe.' },
  {
    id: 'project_line',
    readsFrom: 'project_pattern',
    maxWords: 45,
    description: 'State the publish≠do pattern as fact; name the outlier & the gap.',
  },
  {
    id: 'surprise_phrasing',
    readsFrom: 'surprises',
    maxWords: 60,
    mustEndWithQuestion: true,
    description: 'Must end in a confirm-question. Never a verdict.',
  },
  {
    id: 'gap_line',
    readsFrom: 'gap',
    maxWords: 45,
    description: 'Targets only computed gaps.',
  },
  {
    id: 'market_line',
    readsFrom: 'market',
    maxWords: 45,
    description: '"Examine the belief" framing for market.',
  },
  {
    id: 'gap_kind_line',
    readsFrom: 'direction_check',
    maxWords: 50,
    description:
      'Say whether gaps are capability (learnable) or capacity (slow). If direction_blocked, give cultivate / design-around / reconsider — never "take a course".',
  },
  {
    id: 'experiment_text',
    readsFrom: 'experiments',
    maxWords: 60,
    noComparison: true,
    description: 'Real-world action, intra-individual, never a scoreboard.',
  },
  {
    id: 'action_menu',
    readsFrom: 'gap × direction × market',
    maxWords: 140,
    description: 'Action TYPES only: skills, internship types, job directions, projects, people, portfolio re-framing.',
  },
] as const;

export const SLOT_IDS = REPORT_SLOTS.map((s) => s.id) as [string, ...string[]];

/** The report_payload.slots shape: every slot id → phrased string. */
export const reportSlotsSchema = z.object(
  Object.fromEntries(REPORT_SLOTS.map((s) => [s.id, z.string()])) as Record<string, z.ZodString>,
);
export type ReportSlots = z.infer<typeof reportSlotsSchema>;

/**
 * The tone & rules contract, stated verbatim in the synthesis system prompt.
 * (Analysis_Report_Templates_v3, "The tone & rules contract".)
 */
export const TONE_CONTRACT = [
  'Never invent. Use only facts in the Findings Object. If a finding is absent or low-confidence, say less — never fabricate to fill space.',
  'No verdicts. Surprises and tensions are mirrors to confirm, not conclusions. Surprises end in a confirm-question.',
  'Intra-individual only. Never compare the student to other students; no percentiles, no "above average".',
  'As-of-today framing. Capacities are "thick today, built by your past, able to grow." Never "fixed", never "a scan shows".',
  'Tier discipline. Neuroscience claims stay at the tier the finding carries (evidenced / well-motivated / plausible). Never upgrade a tier.',
  'No invented market specifics. Give action TYPES only — never specific certifications, salary figures, or named employers as if verified. Present specifics as "to research / verify".',
  'Classify before recommending. Capability gaps → training; capacity gaps → cultivate-slowly / design-around / reconsider-direction. Never route a capacity gap to a course.',
  'Voice. Second person, warm, serious — not clinical, not bubbly. No emoji except the designated surprise ⚡.',
  'Length. Respect each slot\'s word ceiling — the report is ~65% visual; prose is captions, not essays.',
] as const;
