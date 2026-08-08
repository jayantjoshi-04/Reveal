/** Shared read helpers over a construct-score set. */
import type { ScoreT } from './types.js';

export type Level = 'high' | 'medium' | 'low';

/** amount 0..100 → level. high ≥60 · medium 40–59 · low <40. */
export function levelOf(value: number): Level {
  if (value >= 60) return 'high';
  if (value >= 40) return 'medium';
  return 'low';
}

export interface Read {
  score: ScoreT | undefined;
  value: number; // blended (what the ring shows)
  demonstrated: number; // do-channel read for capacities; blended otherwise
  level: Level; // classified on the demonstrated read
  /** For bipolar/axis: which pole leads, and the signed position. */
  edge: string | null;
  position: number;
  present: boolean;
}

/** Index scores by construct id for O(1) reads, with a convenience accessor. */
export function readerFor(scores: ScoreT[]): (id: string) => Read {
  const byId = new Map(scores.map((s) => [s.constructId, s]));
  return (id: string): Read => {
    const s = byId.get(id);
    const value = s?.blendedValue ?? 0;
    const demonstrated = s?.demonstratedValue ?? value;
    return {
      score: s,
      value,
      demonstrated,
      level: levelOf(demonstrated),
      edge: s?.positionEdge ?? null,
      position: s?.type === 'amount' ? value : s?.blendedValue ?? 0,
      present: !!s && (s.demonstratedValue > 0 || s.blendedValue > 0),
    };
  };
}

export const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));
export const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const round = (n: number): number => Math.round(n);
