/**
 * Report delivery (Layer 4). Pure cache read: the phrased slots + the derived
 * numbers the charts render from. The LLM never runs on view. Only released.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireRole } from '../../middleware/auth.js';
import { getInstance } from '../../repositories/instance.repo.js';
import { getDerived, getReportPayload } from '../../repositories/derived.repo.js';
import { HttpError, NotFound } from '../../services/session.service.js';

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  // Students and staff may read a released report.
  app.addHook('preHandler', requireRole('student', 'facilitator', 'admin'));

  app.get('/report/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const instance = await getInstance(id);
    if (!instance) throw new NotFound('report');

    // A student may only read their own report.
    if (req.user!.role === 'student' && instance.student_id !== req.user!.sub) {
      throw new HttpError(403, 'not your report');
    }
    if (instance.status !== 'released') {
      return reply.code(403).send({ error: 'not_ready', message: 'This report is still in review.' });
    }

    const [payload, derived] = await Promise.all([getReportPayload(id), getDerived(id)]);
    if (!payload || !derived) throw new NotFound('report');

    return reply.send({
      instance_id: id,
      generated_at: payload.generated_at,
      slots: payload.slots,
      findings: derived.findings,
      trait_scores: derived.trait_scores,
    });
  });
}
