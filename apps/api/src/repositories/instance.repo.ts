/** Student + report_instance data access. */
import type { PoolClient } from 'pg';
import { db } from '../config/db.js';
import type { InstanceStatus, ReportInstance, Student } from '@reveal/shared';

type Q = Pick<PoolClient, 'query'>;
const conn = (c?: Q): Q => c ?? db();

export async function getOrCreateStudent(input: {
  name: string;
  email: string;
  program?: string;
  institution?: string;
  cohort?: string;
}): Promise<Student> {
  const { rows } = await db().query<Student>(
    `INSERT INTO student (name, email, program, institution, cohort)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [input.name, input.email, input.program ?? null, input.institution ?? null, input.cohort ?? null],
  );
  return rows[0]!;
}

export async function createInstance(studentId: string, c?: Q): Promise<ReportInstance> {
  const { rows } = await conn(c).query<ReportInstance>(
    `INSERT INTO report_instance (student_id) VALUES ($1) RETURNING *`,
    [studentId],
  );
  return rows[0]!;
}

export async function getInstance(instanceId: string, c?: Q): Promise<ReportInstance | null> {
  const { rows } = await conn(c).query<ReportInstance>('SELECT * FROM report_instance WHERE instance_id = $1', [
    instanceId,
  ]);
  return rows[0] ?? null;
}

/** The student's most recent in-progress instance, if any. */
export async function getActiveInstanceForStudent(studentId: string): Promise<ReportInstance | null> {
  const { rows } = await db().query<ReportInstance>(
    `SELECT * FROM report_instance
     WHERE student_id = $1 AND status = 'in_progress'
     ORDER BY started_at DESC LIMIT 1`,
    [studentId],
  );
  return rows[0] ?? null;
}

export async function setInstanceStatus(
  instanceId: string,
  status: InstanceStatus,
  opts: { completed?: boolean; generated?: boolean } = {},
  c?: Q,
): Promise<void> {
  await conn(c).query(
    `UPDATE report_instance
       SET status = $2,
           completed_at = CASE WHEN $3 THEN now() ELSE completed_at END,
           generated_at = CASE WHEN $4 THEN now() ELSE generated_at END
     WHERE instance_id = $1`,
    [instanceId, status, opts.completed ?? false, opts.generated ?? false],
  );
}
