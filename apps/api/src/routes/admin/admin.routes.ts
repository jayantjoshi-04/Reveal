/**
 * Admin portal API — the GUI over the database. Questionnaire CRUD, report
 * management (approve/reject), and the student directory. All admin-only (RBAC).
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAdmin } from '../../middleware/auth.js';
import * as instrument from '../../repositories/instrument.repo.js';
import * as instanceRepo from '../../repositories/instance.repo.js';
import * as reviewRepo from '../../repositories/review.repo.js';
import * as auth from '../../services/auth.service.js';
import { getDerived, getReportPayload } from '../../repositories/derived.repo.js';
import { getInstance } from '../../repositories/instance.repo.js';
import { generateReport } from '../../services/generation.service.js';
import { HttpError, NotFound } from '../../services/errors.js';

async function liveVersion(): Promise<string> {
  const v = await instrument.getLiveVersionId();
  if (!v) throw new HttpError(503, 'no live instrument version');
  return v;
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAdmin);

  // ── Account ───────────────────────────────────────────────────────────────
  app.post('/admin/change-password', async (req, reply) => {
    const { current_password, new_password } = z
      .object({ current_password: z.string().min(1), new_password: z.string().min(8) })
      .parse(req.body);
    await auth.changeAdminPassword(req.user!.sub, current_password, new_password);
    return reply.send({ ok: true });
  });

  // ── Overview ──────────────────────────────────────────────────────────────
  app.get('/admin/overview', async () => {
    const versionId = await liveVersion();
    const [a, b, art, reports, students] = await Promise.all([
      instrument.getAItems(versionId),
      instrument.getBTasks(versionId),
      instrument.getArtifacts(versionId),
      reviewRepo.listAllReports(),
      instanceRepo.listStudents(),
    ]);
    return {
      version_id: versionId,
      a_items: a.length,
      b_tasks: b.length,
      artifacts: art.length,
      students: students.length,
      to_review: reports.filter((r) => r.status === 'capture_complete').length,
      released: reports.filter((r) => r.status === 'released').length,
    };
  });

  // ── Questionnaire management (CRUD) ───────────────────────────────────────
  app.get('/admin/questions', async () => instrument.getAItems(await liveVersion()));

  app.post('/admin/questions', async (req, reply) => {
    const body = z
      .object({ module_code: z.string().min(1), prompt: z.string().min(1), seq: z.number().int(), is_non_design: z.boolean().optional() })
      .parse(req.body);
    const created = await instrument.createAItem(await liveVersion(), body);
    return reply.send(created);
  });

  app.patch('/admin/questions/:itemId', async (req, reply) => {
    const { itemId } = z.object({ itemId: z.string().uuid() }).parse(req.params);
    const patch = z.object({ prompt: z.string().optional(), seq: z.number().int().optional(), is_non_design: z.boolean().optional() }).parse(req.body);
    await instrument.updateAItem(itemId, patch);
    return reply.send({ ok: true });
  });

  app.delete('/admin/questions/:itemId', async (req, reply) => {
    const { itemId } = z.object({ itemId: z.string().uuid() }).parse(req.params);
    await instrument.deleteAItem(itemId);
    return reply.send({ ok: true });
  });

  app.post('/admin/questions/:itemId/options', async (req, reply) => {
    const { itemId } = z.object({ itemId: z.string().uuid() }).parse(req.params);
    const { label, tag } = z.object({ label: z.string().min(1), tag: z.string().min(1) }).parse(req.body);
    return reply.send(await instrument.addOption(itemId, label, tag));
  });

  app.patch('/admin/options/:optionId', async (req, reply) => {
    const { optionId } = z.object({ optionId: z.string().uuid() }).parse(req.params);
    const patch = z.object({ label: z.string().optional(), tag: z.string().optional() }).parse(req.body);
    await instrument.updateOption(optionId, patch);
    return reply.send({ ok: true });
  });

  app.delete('/admin/options/:optionId', async (req, reply) => {
    const { optionId } = z.object({ optionId: z.string().uuid() }).parse(req.params);
    await instrument.deleteOption(optionId);
    return reply.send({ ok: true });
  });

  // ── Report management ─────────────────────────────────────────────────────
  app.get('/admin/reports', async () => reviewRepo.listAllReports());

  app.get('/admin/reports/:id', async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const [instance, derived, review, payload] = await Promise.all([
      getInstance(id),
      getDerived(id),
      reviewRepo.getReview(id),
      getReportPayload(id),
    ]);
    if (!instance) throw new NotFound('report');
    return {
      instance_id: id,
      status: instance.status,
      findings: derived?.findings ?? null,
      high_stakes: review?.high_stakes ?? null,
      decision: review?.decision ?? 'pending',
      facilitator_note: review?.facilitator_note ?? null,
      slots: payload?.slots ?? null,
    };
  });

  // ★ approve = the single synthesis trigger (idempotent)
  app.post('/admin/reports/:id/approve', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const result = await generateReport(id, req.user!.sub);
    return reply.send({ ...result, released: true });
  });

  app.post('/admin/reports/:id/reject', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body ?? {});
    await reviewRepo.updateReview(id, { decision: 'flagged', reviewer_id: req.user!.sub, facilitator_note: reason });
    return reply.send({ ok: true, rejected: true });
  });

  // ── Student directory ─────────────────────────────────────────────────────
  app.get('/admin/students', async () => instanceRepo.listStudents());

  // Provision a student directly (pre-verified) — the pilot path that needs no
  // email verification. The admin hands the username + password to the student.
  app.post('/admin/students', async (req, reply) => {
    const body = z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        username: z.string().min(3),
        password: z.string().min(8),
        domain_of_interest: z.string().optional(),
      })
      .parse(req.body);
    const student = await auth.createStudentByAdmin(body);
    return reply.send({ student });
  });

  app.patch('/admin/students/:id/status', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { status } = z.object({ status: z.enum(['active', 'suspended']) }).parse(req.body);
    await instanceRepo.setAccountStatus(id, status);
    return reply.send({ ok: true });
  });

  // ── Engine controls ───────────────────────────────────────────────────────
  app.post('/admin/reports/rerun-scoring', async () => {
    const { rows } = await db().query<{ instance_id: string }>(
      "SELECT instance_id FROM report_instance WHERE status IN ('capture_complete','generated','reviewed','released')",
    );
    let count = 0;
    for (const r of rows) {
      const { runEngineFor } = await import('../../services/generation.service.js');
      await runEngineFor(r.instance_id);
      count++;
    }
    return { rescored: count };
  });
}
