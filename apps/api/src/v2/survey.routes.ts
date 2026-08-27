/**
 * V2 survey — the native REVEAL 2.0.0 instrument (authenticated student flow).
 *
 * The app shell (v1 auth) still owns login; here we mirror the logged-in
 * student into a v2_student, run the 30-activity battery against v2 tables, and
 * on completion run the deterministic engine and store the report payload.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { db } from '../config/db.js';
import { prisma } from './prisma.js';
import { generateReport, activeRulesetId, computeAndStoreComparison } from './service.js';

// Which reusable screen archetype renders each activity.
export const ARCHETYPE: Record<string, string> = {
  F1: 'reaction', F2: 'reaction', F3: 'reaction', F4: 'picks',
  A1: 'allocation', A2: 'duel', A3: 'tapscene', A4: 'reaction', A5: 'reaction',
  A6: 'reaction', A7: 'allocation', A8: 'reaction', A9: 'arrange',
  B1: 'reaction', B2: 'reaction', B3: 'reaction', B4: 'compose',
  C1: 'reaction', C2: 'reaction', C3: 'reaction',
  O1: 'pickmenu', O2: 'tapscene', O3: 'fork', O4: 'reaction', O5: 'reaction',
  U1: 'upload', U2: 'upload', U3: 'upload',
  GF1: 'arrange', GF2: 'coldopen',
};

// The five sitting-blocks (App Flow) — the survey plays them in this order.
export const BLOCKS: { block: number; title: string; activities: string[] }[] = [
  { block: 1, title: 'Fresh — how you actually work', activities: ['F1', 'A1', 'A3', 'A7', 'O2'] },
  { block: 2, title: 'Your own work', activities: ['B1', 'B3', 'B2', 'B4'] },
  { block: 3, title: 'In the studio', activities: ['A9', 'A8', 'A4', 'A2', 'A5', 'O3', 'O5', 'GF1', 'GF2'] },
  { block: 4, title: 'What you’d do', activities: ['F2', 'F4', 'A6', 'C1'] },
  { block: 5, title: 'Curate & bring in', activities: ['C2', 'C3', 'F3', 'O1', 'O4', 'U1', 'U2', 'U3'] },
];
const ORDER: string[] = BLOCKS.flatMap((b) => b.activities);

async function v2StudentForRequest(sub: string) {
  const { rows } = await db().query<{ name: string; email: string; domain_of_interest: string | null }>(
    'SELECT name, email, domain_of_interest FROM student WHERE student_id = $1',
    [sub],
  );
  const s = rows[0];
  if (!s) throw Object.assign(new Error('student not found'), { statusCode: 404 });
  return prisma().student.upsert({
    where: { email: s.email },
    update: { name: s.name, enrolledField: s.domain_of_interest ?? undefined },
    create: { name: s.name, email: s.email, enrolledField: s.domain_of_interest ?? undefined, consentState: 'granted' },
  });
}

async function ownInstance(instanceId: string, studentId: string) {
  const inst = await prisma().reportInstance.findUnique({ where: { id: instanceId } });
  if (!inst) throw Object.assign(new Error('instance not found'), { statusCode: 404 });
  if (inst.studentId !== studentId) throw Object.assign(new Error('not your survey'), { statusCode: 403 });
  return inst;
}

export async function surveyRoutes(app: FastifyInstance): Promise<void> {
  // Start (or resume) the student's baseline instance.
  app.post('/survey/start', { preHandler: requireRole('student') }, async (req) => {
    const student = await v2StudentForRequest(req.user!.sub);
    // Resume any in-progress instance (baseline or re-run); else start a baseline.
    let inst = await prisma().reportInstance.findFirst({
      where: { studentId: student.id, status: 'in_progress' },
      orderBy: { createdAt: 'desc' },
    });
    if (!inst) {
      const rulesetVersionId = await activeRulesetId();
      inst = await prisma().reportInstance.create({
        data: { studentId: student.id, rulesetVersionId, tier: 'free', status: 'in_progress', instanceType: 'baseline' },
      });
    }
    return { instanceId: inst.id };
  });

  // Start (or resume) a re-run, chained to the student's latest generated reading.
  app.post('/survey/rerun', { preHandler: requireRole('student') }, async (req) => {
    const student = await v2StudentForRequest(req.user!.sub);
    let inst = await prisma().reportInstance.findFirst({
      where: { studentId: student.id, status: 'in_progress', instanceType: 're_run' },
      orderBy: { createdAt: 'desc' },
    });
    if (!inst) {
      const baseline = await prisma().reportInstance.findFirst({
        where: { studentId: student.id, status: 'generated' },
        orderBy: { createdAt: 'desc' },
      });
      if (!baseline) throw Object.assign(new Error('no generated reading to re-run from'), { statusCode: 400 });
      const rulesetVersionId = await activeRulesetId();
      inst = await prisma().reportInstance.create({
        data: { studentId: student.id, rulesetVersionId, tier: 'free', status: 'in_progress', instanceType: 're_run', priorInstanceId: baseline.id },
      });
    }
    return { instanceId: inst.id };
  });

  // Dashboard status for the logged-in student.
  app.get('/survey/status', { preHandler: requireRole('student') }, async (req) => {
    const student = await v2StudentForRequest(req.user!.sub);
    const inst = await prisma().reportInstance.findFirst({ where: { studentId: student.id }, orderBy: { createdAt: 'desc' } });
    if (!inst) return { instance: null };
    const answered = await prisma().activityResponse.findMany({ where: { reportInstanceId: inst.id }, select: { activityId: true } });
    const done = new Set(answered.map((a) => a.activityId));
    const hasGenerated = await prisma().reportInstance.count({ where: { studentId: student.id, status: 'generated' } });
    return {
      instance: {
        id: inst.id,
        status: inst.status,
        instanceType: inst.instanceType,
        generatedAt: inst.generatedAt,
        answered: [...done].length,
        total: ORDER.length,
        reportReady: inst.status === 'generated' || inst.status === 'archived',
        canRerun: hasGenerated > 0 && inst.status !== 'in_progress',
      },
    };
  });

  // Full survey state: ordered activities (+ options + archetype) and saved answers.
  app.get('/survey/:id', { preHandler: requireRole('student') }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const student = await v2StudentForRequest(req.user!.sub);
    const inst = await ownInstance(id, student.id);

    const [acts, opts, responses] = await Promise.all([
      prisma().activity.findMany(),
      prisma().activityOption.findMany({ orderBy: { id: 'asc' } }),
      prisma().activityResponse.findMany({ where: { reportInstanceId: id } }),
    ]);
    const optByActivity = new Map<string, typeof opts>();
    for (const o of opts) (optByActivity.get(o.activityId) ?? optByActivity.set(o.activityId, []).get(o.activityId)!).push(o);
    const actById = new Map(acts.map((a) => [a.id, a]));

    const activities = ORDER.map((aid) => {
      const a = actById.get(aid);
      if (!a) return null;
      return {
        id: a.id, code: a.code, label: a.label, channel: a.channel, format: a.format,
        note: a.captureSchemaNote, archetype: ARCHETYPE[aid] ?? 'reaction',
        options: (optByActivity.get(aid) ?? []).map((o) => ({
          id: o.id, step: o.rungOrStep, label: o.label, constructId: o.mapsToConstructId,
          edge: o.edge, driver: o.driver, axis: o.axis, isEscape: o.isEscape,
        })),
      };
    }).filter(Boolean);

    const answered: Record<string, unknown> = {};
    for (const r of responses) answered[r.activityId] = r.rawPayload;
    const cursor = ORDER.find((aid) => !(aid in answered)) ?? null;

    return { instanceId: id, status: inst.status, blocks: BLOCKS, activities, answered, cursor };
  });

  // Save one activity's answer (write-once per activity: replace on re-answer).
  app.post('/survey/:id/activity/:activityId', { preHandler: requireRole('student') }, async (req) => {
    const { id, activityId } = z.object({ id: z.string().uuid(), activityId: z.string() }).parse(req.params);
    const body = z.object({ rawPayload: z.record(z.unknown()).default({}), channel: z.enum(['say', 'do']).optional() }).parse(req.body);
    const student = await v2StudentForRequest(req.user!.sub);
    await ownInstance(id, student.id);
    const activity = await prisma().activity.findUnique({ where: { id: activityId } });
    if (!activity) throw Object.assign(new Error('unknown activity'), { statusCode: 400 });
    const channel = body.channel ?? (activity.channel === 'say' ? 'say' : 'do');
    await prisma().activityResponse.deleteMany({ where: { reportInstanceId: id, activityId } });
    await prisma().activityResponse.create({ data: { reportInstanceId: id, activityId, channel, rawPayload: body.rawPayload as object } });
    const answered = await prisma().activityResponse.findMany({ where: { reportInstanceId: id }, select: { activityId: true } });
    const done = new Set(answered.map((a) => a.activityId));
    const next = ORDER.find((aid) => !done.has(aid)) ?? null;
    return { ok: true, next };
  });

  // Complete → run the engine, store the payload, mark generated. On a re-run,
  // also compute + store the comparison against the re-scored baseline.
  app.post('/survey/:id/complete', { preHandler: requireRole('student') }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const student = await v2StudentForRequest(req.user!.sub);
    await ownInstance(id, student.id);
    await generateReport(id); // sets status generated + generatedAt, writes report_payload
    await computeAndStoreComparison(id); // no-op for a baseline
    return { ok: true, instanceId: id };
  });

  // The re-run diff against the last reading (null for a baseline).
  app.get('/survey/:id/comparison', { preHandler: requireRole('student', 'admin') }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (req.user!.role === 'student') {
      const student = await v2StudentForRequest(req.user!.sub);
      await ownInstance(id, student.id);
    }
    const row = await prisma().instanceComparison.findFirst({ where: { reportInstanceId: id }, orderBy: { createdAt: 'desc' } });
    if (!row) return { comparison: null };
    const delta = row.perConstructDelta as Record<string, { delta: number; direction: string; crossedThreshold: boolean }>;
    const moved = Object.entries(delta)
      .filter(([, d]) => d.crossedThreshold && d.direction !== 'flat')
      .map(([construct, d]) => ({ construct, delta: d.delta, direction: d.direction }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    return {
      comparison: {
        baselineInstanceId: row.baselineInstanceId,
        nullResultFlag: row.nullResultFlag,
        movedConstructs: moved,
        moleculesGained: row.moleculesGained as string[],
        moleculesLost: row.moleculesLost as string[],
        readinessMovement: row.readinessMovement as Record<string, number>,
      },
    };
  });

  // Read the compiled report payload (student owner or admin).
  app.get('/survey/:id/report', { preHandler: requireRole('student', 'admin') }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (req.user!.role === 'student') {
      const student = await v2StudentForRequest(req.user!.sub);
      await ownInstance(id, student.id);
    }
    const row = await prisma().reportPayload.findUnique({ where: { reportInstanceId: id } });
    if (!row) throw Object.assign(new Error('report not generated yet'), { statusCode: 404 });
    return row.payload;
  });
}
