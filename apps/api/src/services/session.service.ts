/**
 * The three-locked-session state machine. The SERVER owns session state and the
 * resume cursor; sealed behavioural answers are never returned to the client.
 */
import { CAPTURE_SEQUENCE, SESSIONS, nextModule, sessionForModule, type InstanceState, type ModuleCode } from '@reveal/shared';
import { withTransaction } from '../config/db.js';
import * as instanceRepo from '../repositories/instance.repo.js';
import * as capture from '../repositories/capture.repo.js';
import { moduleTarget } from './moduleTarget.js';
import { runEngineFor } from './generation.service.js';
import { NotFound, BadRequest, Conflict } from './errors.js';

const FIRST_MODULE = CAPTURE_SEQUENCE[0]!;

/** Start a fresh instance for a student (or resume their in-progress one). */
export async function startOrResume(studentId: string): Promise<InstanceState> {
  const existing = await instanceRepo.getActiveInstanceForStudent(studentId);
  const instance = existing ?? (await createFresh(studentId));
  return getState(instance.instance_id);
}

async function createFresh(studentId: string): Promise<{ instance_id: string }> {
  return withTransaction(async (c) => {
    const inst = await instanceRepo.createInstance(studentId, c);
    await capture.ensureRawCapture(inst.instance_id, c);
    await capture.ensureSessions(inst.instance_id, FIRST_MODULE, c);
    return inst;
  });
}

/** Server-authoritative resume payload. Omits sealed behavioural answers. */
export async function getState(instanceId: string): Promise<InstanceState> {
  const instance = await instanceRepo.getInstance(instanceId);
  if (!instance) throw new NotFound('instance');
  const sessions = await capture.getSessions(instanceId);

  // active session = the first non-sealed one
  const active = sessions.find((s) => s.status !== 'sealed') ?? null;

  // Cursor is computed from answered modules, not stored state, so a refreshed
  // client can never desync: the next unanswered module in the active session,
  // or null when every module is answered (ready to seal).
  let cursor: string | null = null;
  if (active) {
    const answered = new Set(await capture.listAnsweredModules(instanceId));
    cursor = SESSIONS[active.session_no - 1]!.modules.find((m) => !answered.has(m)) ?? null;
  }

  return {
    instance_id: instanceId,
    status: instance.status,
    active_session: active?.session_no ?? null,
    session_status: active?.status ?? 'sealed',
    cursor,
    sessions: sessions.map((s) => ({
      session_no: s.session_no,
      title: SESSIONS[s.session_no - 1]!.title,
      status: s.status,
    })),
  };
}

/** Append one module answer (Layer 1 write). Rejects if the session is sealed. */
export async function submitModule(input: {
  instanceId: string;
  moduleCode: ModuleCode;
  payload: unknown;
  responseMs?: number;
}): Promise<{ cursor: string | null }> {
  const sessionNo = sessionForModule(input.moduleCode);
  if (!sessionNo) throw new BadRequest(`unknown module ${input.moduleCode}`);

  return withTransaction(async (c) => {
    // Enforce session order: you may only answer the active (first non-sealed)
    // session — no answering a later session's tasks out of order (R2).
    const sessions = await capture.getSessions(input.instanceId, c);
    const active = sessions.find((s) => s.status !== 'sealed');
    if (!active) throw new Conflict('all sessions are sealed');
    if (active.session_no !== sessionNo) {
      throw new Conflict(`out of order — finish session ${active.session_no} first`);
    }
    if (active.status === 'not_started') await capture.updateSession(input.instanceId, sessionNo, { status: 'in_progress' }, c);

    // Land the payload in the right place in raw_capture.
    const target = moduleTarget(input.moduleCode);
    if (target.kind === 'channel_a' || target.kind === 'channel_b') {
      await capture.mergeModule(input.instanceId, target.kind, target.key, input.payload, c);
    } else if (target.kind === 'portfolio') {
      const raw = await capture.getRawCapture(input.instanceId, c);
      const merged = { ...(raw?.portfolio ?? {}), ...(input.payload as object) };
      await capture.setChannel(input.instanceId, 'portfolio', merged, c);
    } else if (target.kind === 'consent') {
      await instanceRepo.setConsent(input.instanceId, input.payload, c);
    }

    await capture.upsertModuleResponse(
      { instanceId: input.instanceId, sessionNo, moduleCode: input.moduleCode, payload: input.payload, responseMs: input.responseMs },
      c,
    );

    // Advance the resume cursor to the next module in this session (null if it seals).
    const next = nextModule(input.moduleCode);
    await capture.updateSession(input.instanceId, sessionNo, { resume_cursor: next }, c);
    return { cursor: next };
  });
}

/**
 * Seal a session in one transaction: lock its responses, mark it sealed. On the
 * third seal, mark the instance capture_complete and run the analysis engine
 * (Layer 2) — but NOT the report (that waits for facilitator approval).
 */
export async function sealSession(instanceId: string, sessionNo: number): Promise<{ sealed: boolean; instanceComplete: boolean }> {
  const complete = await withTransaction(async (c) => {
    const session = await capture.getSession(instanceId, sessionNo, c);
    if (!session) throw new NotFound('session');
    if (session.status === 'sealed') return sessionNo === 3; // idempotent

    await capture.sealSessionResponses(instanceId, sessionNo, c);
    await capture.updateSession(instanceId, sessionNo, { status: 'sealed', sealed: true, resume_cursor: null }, c);

    if (sessionNo === 3) {
      await instanceRepo.setInstanceStatus(instanceId, 'capture_complete', { completed: true }, c);
      return true;
    }
    return false;
  });

  // Engine + review row are created outside the seal transaction (idempotent).
  if (complete) await runEngineFor(instanceId);
  return { sealed: true, instanceComplete: complete };
}

// Re-exported for compatibility — the classes live in ./errors.js.
export { HttpError, NotFound, BadRequest, Conflict } from './errors.js';
