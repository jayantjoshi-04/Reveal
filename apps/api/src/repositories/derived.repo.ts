/** derived (Layer 2 output) + report_payload (Layer 4 cache) data access. */
import type { PoolClient } from 'pg';
import { db } from '../config/db.js';
import type { Derived, Findings, ReportPayload, ReportSlots, TraitScore } from '@reveal/shared';

type Q = Pick<PoolClient, 'query'>;
const conn = (c?: Q): Q => c ?? db();

export async function upsertDerived(
  instanceId: string,
  input: { engine_version: string; findings: Findings; trait_scores: TraitScore[] },
  c?: Q,
): Promise<void> {
  await conn(c).query(
    `INSERT INTO derived (instance_id, engine_version, findings, trait_scores, coherence, market_tension)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (instance_id) DO UPDATE
       SET engine_version = EXCLUDED.engine_version,
           findings = EXCLUDED.findings,
           trait_scores = EXCLUDED.trait_scores,
           coherence = EXCLUDED.coherence,
           market_tension = EXCLUDED.market_tension,
           computed_at = now()`,
    [
      instanceId,
      input.engine_version,
      JSON.stringify(input.findings),
      JSON.stringify(input.trait_scores),
      JSON.stringify(input.findings.project_pattern),
      JSON.stringify(input.findings.market),
    ],
  );
}

export async function getDerived(instanceId: string, c?: Q): Promise<Derived | null> {
  const { rows } = await conn(c).query<Derived>('SELECT * FROM derived WHERE instance_id = $1', [instanceId]);
  return rows[0] ?? null;
}

/**
 * Insert the report payload exactly once. The PK on instance_id + ON CONFLICT
 * DO NOTHING makes a second synthesis physically impossible: returns false if
 * a payload already existed (so callers know it was a no-op).
 */
export async function insertReportPayloadOnce(
  instanceId: string,
  slots: ReportSlots,
  model: string,
  c?: Q,
): Promise<boolean> {
  const { rowCount } = await conn(c).query(
    `INSERT INTO report_payload (instance_id, slots, model)
     VALUES ($1,$2,$3)
     ON CONFLICT (instance_id) DO NOTHING`,
    [instanceId, JSON.stringify(slots), model],
  );
  return (rowCount ?? 0) > 0;
}

export async function getReportPayload(instanceId: string, c?: Q): Promise<ReportPayload | null> {
  const { rows } = await conn(c).query<ReportPayload>('SELECT * FROM report_payload WHERE instance_id = $1', [
    instanceId,
  ]);
  return rows[0] ?? null;
}
