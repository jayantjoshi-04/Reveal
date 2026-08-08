/**
 * REVEAL v2 deterministic engine — the nine-stage orchestrator.
 *
 * Reads only master data + raw capture + the pinned ruleset. Same inputs ⇒
 * byte-identical output. No AI, ever (the determinism firewall). Stage 8
 * (assembly → payload) lives in assembly.ts; Stage 9 (instance comparison) in
 * comparison.ts.
 */
import type { EngineContext, EngineResult, RawCapture } from './types.js';
import { aggregate, derive } from './stage1_2.js';
import { fireMolecules } from './molecules.js';
import { buildIntent } from './intent.js';
import { findings, proximity, readiness } from './stage4_5_7.js';
import { selectGrowth } from './growth.js';

export * from './types.js';
export { buildIntent } from './intent.js';
export { assemblePayload } from './assembly.js';
export { compareInstances } from './comparison.js';

/** Run stages 1–7 and return the full derived layer. */
export function runEngine(ctx: EngineContext, raw: RawCapture): EngineResult {
  const { master, tier } = ctx;

  // 1 · Derivation → atoms
  const atoms = derive(master, raw);
  // 2 · Aggregation → construct_scores
  const scores = aggregate(master, atoms);
  // intent profile (feeds molecules + findings)
  const intent = buildIntent(master, raw);
  // 3 · Molecules
  const molecules = fireMolecules({ master, scores, intent });
  // 4 · Proximity → directions
  const directions = proximity(master, scores, raw);
  const top = directions.find((d) => d.rank === 1);
  // 5 · Readiness
  const read = readiness(master, scores, raw, top);
  // 6 · Growth-selection
  const growth = selectGrowth({ master, scores, readiness: read, directions, raw, tier });
  // 7 · Findings
  const { findings: found, coherenceBand } = findings(scores);

  return { atoms, scores, molecules, directions, readiness: read, growth, findings: found, coherenceBand };
}
