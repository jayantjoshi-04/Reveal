/**
 * REVEAL v2.0.0 — Report Payload (Layer 5).
 *
 * The exact object Stage 8 compiles into `v2_report_payload.payload` and the
 * report UI binds field-for-field. Presentation-shaped: no raw capture, no
 * scores the report doesn't show. Mirrors REVEAL_Report_Payload_Schema.
 */
import type {
  ConfidenceTier,
  CoherenceBand,
  InstanceType,
  MoleculeConfidence,
  ReadinessDimension,
  ReadinessTier,
  Resolvedness,
  Tier,
  Valence,
} from './vocab.js';

export interface ConfidenceLegendItem {
  tier: ConfidenceTier;
  dot: '●' | '◐' | '○' | '·';
  label: string;
  meaning: string;
}

export interface PayloadMeta {
  report_instance_id: string;
  ruleset_version: string;
  student_name: string;
  enrolled_field: string | null;
  tier: Tier;
  instance_type: InstanceType;
  as_of_date: string;
  is_first_reading: boolean;
  prior_instance_id: string | null;
}

export interface HowToRead {
  opener_text: string;
  you_vs_you_note: string;
  confidence_legend: ConfidenceLegendItem[];
}

export interface SignatureTile {
  label: string;
  ring_value: number; // 0–100
  is_surprise: boolean;
}

export interface Hero {
  headline: string;
  headline_molecule_id: string | null;
  signature_tiles: SignatureTile[];
  timestamp_copy: string;
}

export interface Capacity {
  construct_id: string;
  name: string;
  ring_value: number;
  value_state: 'demonstrated' | 'likely';
  tier: ConfidenceTier;
  science_chip: string;
  evidence_tags: string[];
}

export interface ConditionBand {
  state: 'opens' | 'closes' | 'undetermined';
  room_descriptor: string;
  text: string;
}
export interface ConditionsCard {
  position_note: string;
  bands: ConditionBand[];
  framing_note: string;
}

export interface Disposition {
  construct_id: string;
  edge_low: string;
  edge_high: string;
  pin_value: number; // −100..+100
  resolvedness: Resolvedness;
  tier: ConfidenceTier;
}

export interface ValueAxis {
  axis_id: string;
  lean_edge: string;
  render_text: string;
  resolvedness: Resolvedness;
}

export interface IntentBlock {
  drivers: { driver: string; valence: Valence; robustness: 'over_determined' | 'fragile' }[];
}

export interface RoleFreq {
  role: string;
  evidence_count: number;
}

export interface HowYouWorkItem {
  molecule_id: string;
  text: string;
  tier: MoleculeConfidence;
}

export interface CausalSpreadRow {
  project: string;
  room: string;
  what_it_opened: string;
  what_got_built: string;
}

export interface SectionToday {
  capacities: Capacity[];
  conditions_card: ConditionsCard;
  dispositions: Disposition[];
  values: ValueAxis[];
  intent: IntentBlock;
  roles: RoleFreq[];
  how_you_work: HowYouWorkItem[];
  causal_spread: CausalSpreadRow[];
  causal_spread_closing_line: string;
}

export interface MoleculeLine {
  molecule_id: string;
  text: string;
  tier: MoleculeConfidence;
}

export interface DirectionOut {
  rank: number;
  role: string;
  domain: string;
  proximity_score: number; // 0–1
  aptitude_level: 'high' | 'low';
  interest_level: 'high' | 'low';
  quadrant: string;
  values_conflict_flag: boolean;
  is_chosen: boolean;
  unlocked: boolean;
  why_aligns?: MoleculeLine[];
  whats_hard?: MoleculeLine[];
  note?: string;
}

export interface ReadinessGauge {
  dimension: ReadinessDimension;
  tier: ReadinessTier;
  score?: number;
}

export interface CapabilityGap {
  name: string;
  current: number;
  desired: number;
  gap: number;
}

export interface GrowthItem {
  vehicle_id: string;
  title: string;
  type: string;
  render_text: string;
  direction_ref: string | null;
}

export interface SectionHeading {
  directions: DirectionOut[];
  readiness: ReadinessGauge[];
  capability_gaps: CapabilityGap[];
  growth: GrowthItem[];
}

export interface SurpriseOut {
  construct_id: string;
  text: string;
  confirm_question: string;
  tier: ConfidenceTier;
}

export interface FindingsBlock {
  coherence: { band: CoherenceBand; text: string };
  gate_observation: { text: string } | null;
  outlier: { text: string } | null;
}

export interface OpenQuestion {
  text: string;
  related_construct: string;
  why_open: string;
}

export interface EvidenceRow {
  claim: string;
  channel: 'say' | 'do' | 'both';
  source_activities: string[];
  evidence_count: number;
  tier: ConfidenceTier;
}

/** The single compiled object the report template renders. */
export interface ReportPayloadV2 {
  meta: PayloadMeta;
  how_to_read: HowToRead;
  hero: Hero;
  section_today: SectionToday;
  mode_switch: { text: string };
  section_heading: SectionHeading;
  surprises: SurpriseOut[];
  findings: FindingsBlock;
  open_questions: OpenQuestion[];
  evidence_room: EvidenceRow[];
}
