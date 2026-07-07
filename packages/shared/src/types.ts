/**
 * REVEAL · Shared entity & API types
 */
import type { InstanceStatus, SessionStatus, StaffRole, ReviewDecision } from './enums.js';
import type { RawCapture } from './contracts/raw-capture.schema.js';
import type { Findings, TraitScore } from './contracts/findings.schema.js';
import type { ReportSlots } from './contracts/report-slots.js';

export interface Student {
  student_id: string;
  name: string;
  email: string;
  program?: string;
  institution?: string;
  cohort?: string;
  consent: { data_use?: boolean; retention_ack?: boolean; granted_at?: string };
  created_at: string;
}

export interface ReportInstance {
  instance_id: string;
  student_id: string;
  schema_version: string;
  status: InstanceStatus;
  started_at: string;
  completed_at: string | null;
  generated_at: string | null;
}

export interface CaptureSession {
  session_id: string;
  instance_id: string;
  session_no: 1 | 2 | 3;
  status: SessionStatus;
  resume_cursor: string | null;
  sealed_at: string | null;
}

export interface Derived {
  instance_id: string;
  engine_version: string;
  findings: Findings;
  trait_scores: TraitScore[];
  coherence: Findings['project_pattern'] | null;
  market_tension: Findings['market'] | null;
  computed_at: string;
}

export interface ReportPayload {
  instance_id: string;
  slots: ReportSlots;
  model: string;
  generated: boolean;
  generated_at: string;
}

export interface Staff {
  staff_id: string;
  email: string;
  name: string;
  role: StaffRole;
}

export interface Review {
  review_id: string;
  instance_id: string;
  reviewer_id: string | null;
  decision: ReviewDecision;
  high_stakes: HighStakesSummary;
  facilitator_note: string | null;
  slot_edits: Partial<ReportSlots> | null;
}

/** What the facilitator sees on the review screen — computed, no LLM. */
export interface HighStakesSummary {
  surprises: { trait: string; situations: number }[];
  coherence: { contradiction: boolean; resume_frame?: string; work_frame?: string; adjudicated?: string } | null;
  gaps: { capability: string; classification: string }[];
  market: { classification: string; market_gap: number } | null;
}

// ── API DTOs ───────────────────────────────────────────────────────────────

/** GET /instances/:id/state — server-authoritative resume payload.
 *  Behavioural answers already sealed are intentionally NOT included. */
export interface InstanceState {
  instance_id: string;
  status: InstanceStatus;
  active_session: 1 | 2 | 3 | null;
  session_status: SessionStatus;
  /** module_code of the next item to serve. */
  cursor: string | null;
  sessions: { session_no: 1 | 2 | 3; title: string; status: SessionStatus }[];
}

/** A row in the facilitator queue. */
export interface QueueItem {
  instance_id: string;
  student_name: string;
  cohort: string | null;
  completed_at: string | null;
  surprise_count: number;
  coherence_flag: boolean;
  clean: boolean;
}

export type { RawCapture, Findings, TraitScore, ReportSlots };
