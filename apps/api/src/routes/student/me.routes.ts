/** The signed-in student's dashboard: profile + latest run status + report state. */
import type { FastifyInstance } from 'fastify';
import { requireStudent } from '../../middleware/auth.js';
import { getStudentDashboard } from '../../repositories/instance.repo.js';
import { getReportPayload } from '../../repositories/derived.repo.js';

export async function meRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireStudent);

  app.get('/me/dashboard', async (req) => {
    const { profile, instance } = await getStudentDashboard(req.user!.sub);
    const reportReady = instance?.status === 'released' && !!(await getReportPayload(instance.instance_id));
    return {
      profile,
      instance: instance
        ? { instance_id: instance.instance_id, status: instance.status, started_at: instance.started_at, completed_at: instance.completed_at, generated_at: instance.generated_at }
        : null,
      report_ready: reportReady,
    };
  });
}
