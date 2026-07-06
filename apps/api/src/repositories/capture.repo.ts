/**
 * Capture data access: raw_capture (the spine) + capture_session (seal/resume)
 * + module_response (append-only, per-item timing & immutability).
 */
import type { PoolClient } from 'pg';
import { db } from '../config/db.js';
import type { CaptureSession, RawCapture, SessionStatus } from '@reveal/shared';

type Q = Pick<PoolClient, 'query'>;
const conn = (c?: Q): Q => c ?? db();

// ── raw_capture ─────────────────────────────────────────────────────────────
export async function ensureRawCapture(instanceId: string, c?: Q): Promise<void> {
  await conn(c).query(
    `INSERT INTO raw_capture (instance_id) VALUES ($1) ON CONFLICT (instance_id) DO NOTHING`,
    [instanceId],
  );
}

/** Merge a module's payload under channel_a/channel_b/portfolio at a given key. */
export async function mergeModule(
  instanceId: string,
  channel: 'channel_a' | 'channel_b' | 'portfolio',
  key: string,
  payload: unknown,
  c?: Q,
): Promise<void> {
  await conn(c).query(
    `UPDATE raw_capture
       SET ${channel} = jsonb_set(${channel}, $2, $3::jsonb, true), updated_at = now()
     WHERE instance_id = $1`,
    [instanceId, `{${key}}`, JSON.stringify(payload)],
  );
}

/** Replace an entire channel object (used for portfolio, which is a single blob). */
export async function setChannel(
  instanceId: string,
  channel: 'channel_a' | 'channel_b' | 'portfolio',
  value: unknown,
  c?: Q,
): Promise<void> {
  await conn(c).query(
    `UPDATE raw_capture SET ${channel} = $2::jsonb, updated_at = now() WHERE instance_id = $1`,
    [instanceId, JSON.stringify(value)],
  );
}

export async function getRawCapture(instanceId: string, c?: Q): Promise<RawCapture | null> {
  const { rows } = await conn(c).query<{ channel_a: unknown; channel_b: unknown; portfolio: unknown }>(
    'SELECT channel_a, channel_b, portfolio FROM raw_capture WHERE instance_id = $1',
    [instanceId],
  );
  const r = rows[0];
  if (!r) return null;
  return { channel_a: r.channel_a, channel_b: r.channel_b, portfolio: r.portfolio } as RawCapture;
}

// ── capture_session ─────────────────────────────────────────────────────────
export async function ensureSessions(instanceId: string, firstCursor: string, c?: Q): Promise<void> {
  await conn(c).query(
    `INSERT INTO capture_session (instance_id, session_no, resume_cursor)
     VALUES ($1, 1, $2), ($1, 2, NULL), ($1, 3, NULL)
     ON CONFLICT (instance_id, session_no) DO NOTHING`,
    [instanceId, firstCursor],
  );
}

export async function getSessions(instanceId: string, c?: Q): Promise<CaptureSession[]> {
  const { rows } = await conn(c).query<CaptureSession>(
    'SELECT * FROM capture_session WHERE instance_id = $1 ORDER BY session_no',
    [instanceId],
  );
  return rows;
}

export async function getSession(instanceId: string, sessionNo: number, c?: Q): Promise<CaptureSession | null> {
  const { rows } = await conn(c).query<CaptureSession>(
    'SELECT * FROM capture_session WHERE instance_id = $1 AND session_no = $2',
    [instanceId, sessionNo],
  );
  return rows[0] ?? null;
}

export async function updateSession(
  instanceId: string,
  sessionNo: number,
  patch: { status?: SessionStatus; resume_cursor?: string | null; sealed?: boolean },
  c?: Q,
): Promise<void> {
  await conn(c).query(
    `UPDATE capture_session
       SET status = COALESCE($3, status),
           resume_cursor = CASE WHEN $5 THEN $4 ELSE resume_cursor END,
           sealed_at = CASE WHEN $6 THEN now() ELSE sealed_at END
     WHERE instance_id = $1 AND session_no = $2`,
    [
      instanceId,
      sessionNo,
      patch.status ?? null,
      patch.resume_cursor ?? null,
      patch.resume_cursor !== undefined,
      patch.sealed ?? false,
    ],
  );
}

// ── module_response (append-only) ───────────────────────────────────────────
export async function upsertModuleResponse(
  input: { instanceId: string; sessionNo: number; moduleCode: string; payload: unknown; responseMs?: number },
  c?: Q,
): Promise<void> {
  await conn(c).query(
    `INSERT INTO module_response (instance_id, session_no, module_code, payload, response_ms)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (instance_id, module_code)
       DO UPDATE SET payload = EXCLUDED.payload, response_ms = EXCLUDED.response_ms, submitted_at = now()`,
    [input.instanceId, input.sessionNo, input.moduleCode, JSON.stringify(input.payload), input.responseMs ?? null],
  );
}

/** The module_codes already answered for this instance (drives the resume cursor). */
export async function listAnsweredModules(instanceId: string, c?: Q): Promise<string[]> {
  const { rows } = await conn(c).query<{ module_code: string }>(
    'SELECT module_code FROM module_response WHERE instance_id = $1',
    [instanceId],
  );
  return rows.map((r) => r.module_code);
}

export async function sealSessionResponses(instanceId: string, sessionNo: number, c?: Q): Promise<void> {
  await conn(c).query(
    'UPDATE module_response SET sealed = true WHERE instance_id = $1 AND session_no = $2',
    [instanceId, sessionNo],
  );
}
