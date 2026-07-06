/** Facilitator review-gate data access. */
import type { PoolClient } from 'pg';
import { db } from '../config/db.js';
import type { HighStakesSummary, QueueItem, Review, ReviewDecision } from '@reveal/shared';

type Q = Pick<PoolClient, 'query'>;
const conn = (c?: Q): Q => c ?? db();

export async function ensureReview(instanceId: string, highStakes: HighStakesSummary, c?: Q): Promise<void> {
  await conn(c).query(
    `INSERT INTO review (instance_id, high_stakes)
     VALUES ($1,$2)
     ON CONFLICT (instance_id) DO UPDATE SET high_stakes = EXCLUDED.high_stakes`,
    [instanceId, JSON.stringify(highStakes)],
  );
}

export async function getReview(instanceId: string): Promise<Review | null> {
  const { rows } = await db().query<Review>('SELECT * FROM review WHERE instance_id = $1', [instanceId]);
  return rows[0] ?? null;
}

export async function updateReview(
  instanceId: string,
  patch: { decision?: ReviewDecision; reviewer_id?: string; facilitator_note?: string; slot_edits?: unknown },
  c?: Q,
): Promise<void> {
  await conn(c).query(
    `UPDATE review
       SET decision = COALESCE($2, decision),
           reviewer_id = COALESCE($3, reviewer_id),
           facilitator_note = COALESCE($4, facilitator_note),
           slot_edits = COALESCE($5, slot_edits),
           decided_at = CASE WHEN $2 IS NOT NULL THEN now() ELSE decided_at END
     WHERE instance_id = $1`,
    [
      instanceId,
      patch.decision ?? null,
      patch.reviewer_id ?? null,
      patch.facilitator_note ?? null,
      patch.slot_edits ? JSON.stringify(patch.slot_edits) : null,
    ],
  );
}

/** The queue: capture-complete instances awaiting review, annotated from derived. */
export async function getQueue(status: 'to_review' | 'approved', cohort?: string): Promise<QueueItem[]> {
  const wantStatus = status === 'to_review' ? 'capture_complete' : 'released';
  const { rows } = await db().query<{
    instance_id: string;
    student_name: string;
    cohort: string | null;
    completed_at: string | null;
    findings: { surprises?: unknown[]; project_pattern?: { outlier?: unknown } } | null;
  }>(
    `SELECT ri.instance_id, s.name AS student_name, s.cohort, ri.completed_at, d.findings
       FROM report_instance ri
       JOIN student s ON s.student_id = ri.student_id
       LEFT JOIN derived d ON d.instance_id = ri.instance_id
      WHERE ri.status = $1 AND ($2::text IS NULL OR s.cohort = $2)
      ORDER BY ri.completed_at ASC NULLS LAST`,
    [wantStatus, cohort ?? null],
  );

  return rows.map((r) => {
    const surprises = Array.isArray(r.findings?.surprises) ? r.findings!.surprises! : [];
    const coherenceFlag = Boolean(r.findings?.project_pattern?.outlier);
    return {
      instance_id: r.instance_id,
      student_name: r.student_name,
      cohort: r.cohort,
      completed_at: r.completed_at,
      surprise_count: surprises.length,
      coherence_flag: coherenceFlag,
      clean: surprises.length === 0 && !coherenceFlag,
    };
  });
}
