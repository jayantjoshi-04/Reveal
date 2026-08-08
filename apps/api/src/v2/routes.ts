/**
 * v2 API — /api/v2.
 *
 * A parallel surface to v1, operating entirely on the v2_* tables. Kept
 * auth-light for the V1/V2 toggle demo; the pipeline itself is the point.
 * No pricing endpoints (per product owner).
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from './prisma.js';
import { loadMasterFromDb } from './master.js';
import { generateReport, activeRulesetId } from './service.js';
import { jaanhviCapture } from './samples.js';
import type { RawPayload } from './engine/types.js';

const createInstanceSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  enrolledField: z.string().optional(),
  track: z.enum(['physical', 'digital']).optional(),
  tier: z.enum(['free', 'paid']).default('free'),
});

const responsesSchema = z.object({
  responses: z
    .array(z.object({ activityId: z.string(), channel: z.enum(['say', 'do']), rawPayload: z.record(z.unknown()).default({}) }))
    .default([]),
  portfolio: z.array(z.object({ source: z.string(), evidenceMap: z.record(z.number()) })).optional(),
  experience: z
    .array(z.object({ descriptor: z.string(), reps: z.number(), contextVariety: z.number(), realVsSimulated: z.enum(['real', 'simulated']) }))
    .optional(),
  factual: z.record(z.unknown()).optional(),
});

export async function v2Routes(app: FastifyInstance): Promise<void> {
  const db = prisma();

  // Catalog for the capture UI + report legend.
  app.get('/v2/catalog', async () => {
    const master = await loadMasterFromDb(db);
    return {
      ruleset: '2.0.0',
      activities: master.constructs.length
        ? (await db.activity.findMany({ orderBy: { ordering: 'asc' } })).map((a) => ({
            id: a.id,
            code: a.code,
            label: a.label,
            channel: a.channel,
            format: a.format,
            phase: a.phase,
            note: a.captureSchemaNote,
          }))
        : [],
      constructs: master.constructs.map((c) => ({ id: c.id, family: c.family, name: c.name, type: c.type })),
      counts: {
        constructs: master.constructs.length,
        roles: master.roles.length,
        domains: master.domains.length,
        molecules: master.molecules.length,
        growth: master.growth.length,
      },
    };
  });

  // Create a student (upsert by email) + a baseline instance.
  app.post('/v2/instances', async (req) => {
    const body = createInstanceSchema.parse(req.body);
    const rulesetVersionId = await activeRulesetId();
    const email = body.email ?? `${body.name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@sample.reveal`;
    const student = await db.student.upsert({
      where: { email },
      update: { name: body.name, enrolledField: body.enrolledField, track: body.track },
      create: { name: body.name, email, enrolledField: body.enrolledField, track: body.track, consentState: 'granted' },
    });
    const instance = await db.reportInstance.create({
      data: { studentId: student.id, rulesetVersionId, tier: body.tier, status: 'in_progress', phase: 1, instanceType: 'baseline' },
    });
    return { instanceId: instance.id, studentId: student.id };
  });

  app.get('/v2/instances/:id', async (req) => {
    const { id } = req.params as { id: string };
    const instance = await db.reportInstance.findUnique({ where: { id }, include: { student: true } });
    if (!instance) throw Object.assign(new Error('not found'), { statusCode: 404 });
    const responses = await db.activityResponse.count({ where: { reportInstanceId: id } });
    return {
      id: instance.id,
      status: instance.status,
      tier: instance.tier,
      student: { name: instance.student.name, enrolledField: instance.student.enrolledField },
      responseCount: responses,
      generatedAt: instance.generatedAt,
    };
  });

  // Append raw-capture responses (write-once semantics: we append).
  app.post('/v2/instances/:id/responses', async (req) => {
    const { id } = req.params as { id: string };
    const body = responsesSchema.parse(req.body);
    const exists = await db.reportInstance.findUnique({ where: { id } });
    if (!exists) throw Object.assign(new Error('not found'), { statusCode: 404 });
    if (body.responses.length)
      await db.activityResponse.createMany({
        data: body.responses.map((r) => ({ reportInstanceId: id, activityId: r.activityId, channel: r.channel, rawPayload: r.rawPayload as object })),
      });
    if (body.portfolio?.length)
      await db.portfolioArtifact.createMany({ data: body.portfolio.map((p) => ({ reportInstanceId: id, source: p.source, evidenceMap: p.evidenceMap as object })) });
    if (body.experience?.length)
      await db.experienceEntry.createMany({
        data: body.experience.map((e) => ({ reportInstanceId: id, descriptor: e.descriptor, reps: e.reps, contextVariety: e.contextVariety, realVsSimulated: e.realVsSimulated })),
      });
    if (body.factual) await db.factualInventory.create({ data: { reportInstanceId: id, facts: body.factual as object } });
    return { ok: true, added: body.responses.length };
  });

  // Convenience: load the Jaanhvi reference capture into this instance so the
  // toggle demo can show a full v2 report without doing all 30 activities.
  app.post('/v2/instances/:id/sample', async (req) => {
    const { id } = req.params as { id: string };
    const instance = await db.reportInstance.findUnique({ where: { id } });
    if (!instance) throw Object.assign(new Error('not found'), { statusCode: 404 });
    await db.activityResponse.deleteMany({ where: { reportInstanceId: id } });
    await db.portfolioArtifact.deleteMany({ where: { reportInstanceId: id } });
    await db.experienceEntry.deleteMany({ where: { reportInstanceId: id } });
    await db.factualInventory.deleteMany({ where: { reportInstanceId: id } });
    await db.activityResponse.createMany({
      data: jaanhviCapture.responses.map((r) => ({ reportInstanceId: id, activityId: r.activityId, channel: r.channel, rawPayload: r.rawPayload as RawPayload as object })),
    });
    if (jaanhviCapture.portfolio?.length)
      await db.portfolioArtifact.createMany({ data: jaanhviCapture.portfolio.map((p) => ({ reportInstanceId: id, source: p.source, evidenceMap: p.evidenceMap as object })) });
    if (jaanhviCapture.experience?.length)
      await db.experienceEntry.createMany({
        data: jaanhviCapture.experience.map((e) => ({ reportInstanceId: id, descriptor: e.descriptor, reps: e.reps, contextVariety: e.contextVariety, realVsSimulated: e.realVsSimulated })),
      });
    if (jaanhviCapture.factual) await db.factualInventory.create({ data: { reportInstanceId: id, facts: jaanhviCapture.factual as object } });
    await db.student.update({ where: { id: instance.studentId }, data: { enrolledField: 'Industrial Design' } });
    return { ok: true, loaded: 'jaanhvi' };
  });

  app.post('/v2/instances/:id/generate', async (req) => {
    const { id } = req.params as { id: string };
    const payload = await generateReport(id);
    return payload;
  });

  app.get('/v2/instances/:id/report', async (req) => {
    const { id } = req.params as { id: string };
    const row = await db.reportPayload.findUnique({ where: { reportInstanceId: id } });
    if (!row) throw Object.assign(new Error('not generated yet'), { statusCode: 404 });
    return row.payload;
  });
}
