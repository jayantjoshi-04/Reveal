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

/** Persist a student's consent record, resolved via their instance. */
export async function setConsent(instanceId: string, consent: unknown, c?: Q): Promise<void> {
  await conn(c).query(
    `UPDATE student SET consent = $2::jsonb
       FROM report_instance ri
      WHERE ri.instance_id = $1 AND student.student_id = ri.student_id`,
    [instanceId, JSON.stringify(consent)],
  );
}

export interface StudentDirectoryRow {
  student_id: string;
  name: string;
  email: string;
  username: string | null;
  cohort: string | null;
  institution: string | null;
  domain_of_interest: string | null;
  account_status: string;
  email_verified: boolean;
  created_at: string;
  latest_status: string | null;
}

/** All students with their latest instance status, for the admin directory. */
export async function listStudents(): Promise<StudentDirectoryRow[]> {
  const { rows } = await db().query<StudentDirectoryRow>(
    `SELECT s.student_id, s.name, s.email, s.username, s.cohort, s.institution, s.domain_of_interest,
            s.account_status, s.email_verified, s.created_at,
            (SELECT status FROM report_instance ri WHERE ri.student_id = s.student_id
              ORDER BY started_at DESC LIMIT 1) AS latest_status
       FROM student s
      ORDER BY s.created_at DESC`,
  );
  return rows;
}

export async function setAccountStatus(studentId: string, status: string): Promise<void> {
  await db().query('UPDATE student SET account_status = $2 WHERE student_id = $1', [studentId, status]);
}

/** The student's own dashboard: profile snapshot + latest instance. */
export async function getStudentDashboard(studentId: string): Promise<{
  profile: { name: string; email: string; username: string | null; domain_of_interest: string | null; institution: string | null };
  instance: ReportInstance | null;
}> {
  const p = await db().query<{ name: string; email: string; username: string | null; domain_of_interest: string | null; institution: string | null }>(
    'SELECT name, email, username, domain_of_interest, institution FROM student WHERE student_id = $1',
    [studentId],
  );
  const i = await db().query<ReportInstance>(
    'SELECT * FROM report_instance WHERE student_id = $1 ORDER BY started_at DESC LIMIT 1',
    [studentId],
  );
  return { profile: p.rows[0]!, instance: i.rows[0] ?? null };
}

/** Update the editable slice of a student's profile. Only whitelisted fields. */
export async function updateStudentProfile(
  studentId: string,
  patch: { name?: string; institution?: string; domain_of_interest?: string },
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [studentId];
  for (const [col, val] of Object.entries(patch)) {
    if (val === undefined) continue;
    vals.push(val);
    sets.push(`${col} = $${vals.length}`);
  }
  if (sets.length === 0) return;
  await db().query(`UPDATE student SET ${sets.join(', ')} WHERE student_id = $1`, vals);
}

export interface StudentReportRow {
  instance_id: string;
  schema_version: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  generated_at: string | null;
  report_ready: boolean;
}

/** Every run this student owns, newest first — powers the Reports history view. */
export async function listStudentReports(studentId: string): Promise<StudentReportRow[]> {
  const { rows } = await db().query<StudentReportRow & { has_payload: boolean }>(
    `SELECT ri.instance_id, ri.schema_version, ri.status, ri.started_at, ri.completed_at, ri.generated_at,
            (rp.instance_id IS NOT NULL) AS has_payload
       FROM report_instance ri
       LEFT JOIN report_payload rp ON rp.instance_id = ri.instance_id
      WHERE ri.student_id = $1
      ORDER BY ri.started_at DESC`,
    [studentId],
  );
  return rows.map((r) => ({
    instance_id: r.instance_id,
    schema_version: r.schema_version,
    status: r.status,
    started_at: r.started_at,
    completed_at: r.completed_at,
    generated_at: r.generated_at,
    report_ready: r.status === 'released' && r.has_payload,
  }));
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
