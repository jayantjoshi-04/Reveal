/** The signed-in student's dashboard: profile + latest run status + report state. */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireStudent } from '../../middleware/auth.js';
import { getStudentDashboard, updateStudentProfile } from '../../repositories/instance.repo.js';

export async function meRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireStudent);

  // Profile only — the V2 instrument's run state comes from /survey/status.
  app.get('/me/dashboard', async (req) => {
    const { profile } = await getStudentDashboard(req.user!.sub);
    return { profile };
  });

  // Edit the profile fields the student controls.
  app.patch('/me/profile', async (req, reply) => {
    const patch = z
      .object({
        name: z.string().min(1).max(120).optional(),
        institution: z.string().max(160).optional(),
        domain_of_interest: z.string().max(160).optional(),
      })
      .parse(req.body ?? {});
    await updateStudentProfile(req.user!.sub, patch);
    return reply.send({ ok: true });
  });
}
