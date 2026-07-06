/** Small pure helpers for the analysis engine. No I/O. */

export interface Vec2 {
  imp: number;
  hum: number;
}

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function centroid(points: Vec2[]): Vec2 {
  if (points.length === 0) return { imp: 0, hum: 0 };
  return { imp: mean(points.map((p) => p.imp)), hum: mean(points.map((p) => p.hum)) };
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.imp - b.imp, a.hum - b.hum);
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function round(x: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
}

/** Weighted mean where each entry carries a value and a weight (● 1.0 / ○ 0.5). */
export function weightedMean(entries: { value: number; weight: number }[]): number {
  const totalWeight = entries.reduce((a, e) => a + e.weight, 0);
  if (totalWeight === 0) return 0;
  return entries.reduce((a, e) => a + e.value * e.weight, 0) / totalWeight;
}
