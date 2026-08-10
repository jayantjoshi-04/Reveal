/**
 * Report delivery (Layer 4). Pure cache read: the phrased slots + the derived
 * numbers the charts render from. The LLM never runs on view. Only released.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireRole } from '../../middleware/auth.js';
import { getInstance } from '../../repositories/instance.repo.js';
import { getDerived, getReportPayload } from '../../repositories/derived.repo.js';
import { getReview } from '../../repositories/review.repo.js';
import { HttpError, NotFound } from '../../services/session.service.js';
import { db } from '../../config/db.js';
import { reportFromV1 } from '../../v2/service.js';
import type { ReportSlots } from '@reveal/shared';

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

    const [payload, derived, review] = await Promise.all([getReportPayload(id), getDerived(id), getReview(id)]);
    if (!payload || !derived) throw new NotFound('report');

    // Facilitator "light edits" override the generated wording for the reader.
    const edits = (review?.slot_edits ?? {}) as Partial<ReportSlots>;
    const slots = { ...payload.slots, ...edits };

    return reply.send({
      instance_id: id,
      generated_at: payload.generated_at,
      slots,
      findings: derived.findings,
      trait_scores: derived.trait_scores,
    });
  });

  // The SAME survey, read by the REVEAL 2.0.0 deterministic engine. This is the
  // V2 view of the report — chosen at report time, from one set of answers.
  app.get('/report/:id/v2', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const instance = await getInstance(id);
    if (!instance) throw new NotFound('report');
    if (req.user!.role === 'student' && instance.student_id !== req.user!.sub) {
      throw new HttpError(403, 'not your report');
    }
    if (instance.status !== 'released') {
      return reply.code(403).send({ error: 'not_ready', message: 'This report is still in review.' });
    }
    const { rows } = await db().query<{ name: string; domain_of_interest: string | null }>(
      'SELECT name, domain_of_interest FROM student WHERE student_id = $1',
      [instance.student_id],
    );
    const student = rows[0] ?? { name: 'Student', domain_of_interest: null };
    const payload = await reportFromV1(id, student.name, student.domain_of_interest);
    return reply.send(payload);
  });
}
