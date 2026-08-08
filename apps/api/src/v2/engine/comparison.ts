/**
 * Stage 9 · Instance comparison (re-run only).
 *
 * Both sides are re-scored under the CURRENT ruleset before diffing, so a delta
 * measures the student changing, not the rules. Changes below the threshold are
 * reported honestly as no-change (null_result_flag), never dressed up as growth.
 */
import { SCORING } from '@reveal/shared/v2';
import type { EngineResult } from './types.js';

export interface ComparisonResult {
  perConstructDelta: Record<string, { delta: number; direction: 'up' | 'down' | 'flat'; crossedThreshold: boolean }>;
  moleculesGained: string[];
  moleculesLost: string[];
  directionRankChanges: Record<string, number>;
  readinessMovement: Record<string, number>;
  nullResultFlag: boolean;
}

/** Diff a newer instance against a re-scored baseline. */
export function compareInstances(current: EngineResult, baseline: EngineResult): ComparisonResult {
  const th = SCORING.changeThreshold;
  const baseById = new Map(baseline.scores.map((s) => [s.constructId, s]));
  const perConstructDelta: ComparisonResult['perConstructDelta'] = {};
  let anyCrossed = false;

  for (const s of current.scores) {
    const b = baseById.get(s.constructId);
    if (!b) continue;
    const delta = Math.round((s.blendedValue - b.blendedValue) * 100) / 100;
    const edgeFlip = s.positionEdge !== b.positionEdge;
    const crossed = Math.abs(delta) >= th || edgeFlip;
    if (crossed) anyCrossed = true;
    perConstructDelta[s.constructId] = {
      delta,
      direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
      crossedThreshold: crossed,
    };
  }

  const curMol = new Set(current.molecules.filter((m) => m.curatedIn).map((m) => m.moleculeRuleId));
  const baseMol = new Set(baseline.molecules.filter((m) => m.curatedIn).map((m) => m.moleculeRuleId));
  const moleculesGained = [...curMol].filter((m) => !baseMol.has(m));
  const moleculesLost = [...baseMol].filter((m) => !curMol.has(m));
  if (moleculesGained.length || moleculesLost.length) anyCrossed = true;

  const baseRank = new Map(baseline.directions.map((d) => [`${d.roleId}×${d.domainId}`, d.rank]));
  const directionRankChanges: Record<string, number> = {};
  for (const d of current.directions.slice(0, 12)) {
    const key = `${d.roleId}×${d.domainId}`;
    const prev = baseRank.get(key);
    if (prev != null && Math.abs(prev - d.rank) >= 2) {
      directionRankChanges[key] = prev - d.rank;
      anyCrossed = true;
    }
  }

  const baseReadiness = new Map(baseline.readiness.map((r) => [r.dimension, r.score]));
  const readinessMovement: Record<string, number> = {};
  for (const r of current.readiness) {
    const prev = baseReadiness.get(r.dimension);
    if (prev != null) readinessMovement[r.dimension] = r.score - prev;
  }

  return {
    perConstructDelta,
    moleculesGained,
    moleculesLost,
    directionRankChanges,
    readinessMovement,
    nullResultFlag: !anyCrossed,
  };
}
