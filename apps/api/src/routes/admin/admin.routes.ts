/**
 * Admin portal API — the student directory + account, and a read-only view of
 * generated V2 reports. (The V1 questionnaire CRUD and synthesis-approval flow
 * were removed with V1; the V2 engine auto-generates on survey completion.)
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth.js';
import * as instanceRepo from '../../repositories/instance.repo.js';
import * as auth from '../../services/auth.service.js';
import { prisma } from '../../v2/prisma.js';

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
    const [students, instances, generated] = await Promise.all([
      instanceRepo.listStudents(),
      prisma().reportInstance.count(),
      prisma().reportInstance.count({ where: { status: 'generated' } }),
    ]);
    return {
      ruleset: '2.0.0',
      students: students.length,
      instances,
      reports_generated: generated,
    };
  });

  // ── V2 reports (read-only) ────────────────────────────────────────────────
  app.get('/admin/reports', async () => {
    const rows = await prisma().reportInstance.findMany({
      orderBy: { createdAt: 'desc' },
      include: { student: true },
      take: 200,
    });
    return rows.map((r) => ({
      instance_id: r.id,
      student_name: r.student.name,
      status: r.status,
      tier: r.tier,
      generated_at: r.generatedAt,
    }));
  });

  app.get('/admin/reports/:id', async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const row = await prisma().reportPayload.findUnique({ where: { reportInstanceId: id } });
    if (!row) return { instance_id: id, payload: null };
    return { instance_id: id, payload: row.payload };
  });

  // ── Student directory ─────────────────────────────────────────────────────
  app.get('/admin/students', async () => instanceRepo.listStudents());

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
}
