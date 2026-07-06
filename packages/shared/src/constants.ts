/**
 * REVEAL · Frozen scoring constants & session structure
 * ---------------------------------------------------------------------------
 * These numbers make the analysis engine deterministic (Analysis_Report_
 * Templates_v3, "The frozen scoring constants"). Their VALUES are provisional
 * and tuned against pilot data; the RULES that consume them do not change.
 * At runtime the engine reads the versioned copy from `scoring_constant`, but
 * these are the defaults seeded for instrument version 1.0.
 */

import type { ModuleCode } from './enums.js';

export const SCORING = {
  /** Primary trait-tag weight (●) used in B-score. */
  WEIGHT_PRIMARY: 1.0,
  /** Secondary trait-tag weight (○) used in B-score. */
  WEIGHT_SECONDARY: 0.5,

  /** A-score at/above which a trait counts as "present". */
  A_PRESENT: 0.5,
  /** A-score at/below which a trait counts as "absent" (surprise precondition). */
  A_ABSENT: 0.2,
  /** B-task score at/above which a task "points toward" a trait. */
  B_POINTS_TOWARD: 0.5,

  /** Contradiction: stated high, behaviour low. */
  CONTRADICTION_A: 0.6,
  CONTRADICTION_B: 0.3,

  /** Capacity "demonstrated" display value = 0.6·B + 0.4·A, ×100. */
  DEMONSTRATED_B_WEIGHT: 0.6,
  DEMONSTRATED_A_WEIGHT: 0.4,

  /** A gap is "meaningful" once the stated gap reaches this. */
  GAP_MEANINGFUL: 0.4,

  /** B5 centroid-distance bands (Euclidean, range 0–2.83). */
  B5_BAND_SMALL: 0.45,
  B5_BAND_LARGE: 0.9,

  /** Confidence-code agreement thresholds. */
  CC3_MIN_AGREE: 3,
  CC2_MIN_AGREE: 1,

  /** A trait is a surprise only with at least this many agreeing situations. */
  SURPRISE_MIN_SITUATIONS: 2,
} as const;

/** Widened so runtime-loaded constants (from `scoring_constant`) fit — the
 *  frozen defaults above are literal types, but overrides are plain numbers. */
export type ScoringConstants = { [K in keyof typeof SCORING]: number };

/**
 * The three sealed, resumable sessions. Order matters: it encodes the
 * interleave rule (B before A on game-prone traits — b1 before a3, b5 before
 * a7) and B5's pays-best pass sealing last. This is data, not code, so the
 * admin can retune it per instrument version.
 */
export interface SessionDef {
  sessionNo: 1 | 2 | 3;
  title: string;
  estMinutes: number;
  /** Ordered module sequence; also drives the resume cursor. */
  modules: ModuleCode[];
}

export const SESSIONS: readonly SessionDef[] = [
  {
    sessionNo: 1,
    title: 'Foundations',
    estMinutes: 15,
    modules: ['consent', 'portfolio_facts', 'a1', 'b3', 'b4'],
  },
  {
    sessionNo: 2,
    title: 'Values & direction',
    estMinutes: 18,
    modules: ['b1', 'a3', 'b2', 'a4', 'b8'],
  },
  {
    sessionNo: 3,
    title: 'Pulls, aspiration & reflection',
    estMinutes: 18,
    modules: ['b5', 'a7', 'b6', 'a6', 'portfolio_interpretive', 'resume'],
  },
] as const;

/** Flat, ordered list of every module across the three sessions. */
export const CAPTURE_SEQUENCE: ModuleCode[] = SESSIONS.flatMap((s) => s.modules);

/** Which session a given module belongs to. */
export function sessionForModule(code: ModuleCode): 1 | 2 | 3 | null {
  const found = SESSIONS.find((s) => s.modules.includes(code));
  return found ? found.sessionNo : null;
}

/** The module that immediately follows `code` within its session, or null if it seals. */
export function nextModule(code: ModuleCode): ModuleCode | null {
  const session = SESSIONS.find((s) => s.modules.includes(code));
  if (!session) return null;
  const idx = session.modules.indexOf(code);
  return session.modules[idx + 1] ?? null;
}
