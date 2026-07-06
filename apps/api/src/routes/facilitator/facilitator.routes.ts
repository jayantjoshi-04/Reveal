/**
 * Facilitator review gate. The queue lists capture-complete instances; the
 * review screen shows the COMPUTED high-stakes calls (no LLM); "approve" is the
 * ONE trigger for the single synthesis call.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireFacilitator } from '../../middleware/auth.js';
import * as reviewRepo from '../../repositories/review.repo.js';
import { getDerived } from '../../repositories/derived.repo.js';
import { getInstance } from '../../repositories/instance.repo.js';
import { generateReport } from '../../services/generation.service.js';
import { NotFound } from '../../services/session.service.js';

export async function facilitatorRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireFacilitator);

  // The queue: to_review (capture_complete) or approved (released).
  app.get('/facilitator/queue', async (req) => {
    const { status, cohort } = z
      .object({ status: z.enum(['to_review', 'approved']).default('to_review'), cohort: z.string().optional() })
      .parse(req.query);
    return reviewRepo.getQueue(status, cohort);
  });

  // The review screen — computed findings + high-stakes summary. No report text.
  app.get('/facilitator/reviews/:id', async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const [instance, derived, review] = await Promise.all([
      getInstance(id),
      getDerived(id),
      reviewRepo.getReview(id),
    ]);
    if (!instance || !derived) throw new NotFound('review');
    return {
      instance_id: id,
      status: instance.status,
      findings: derived.findings,
      high_stakes: review?.high_stakes ?? null,
      facilitator_note: review?.facilitator_note ?? null,
      decision: review?.decision ?? 'pending',
    };
  });

  // Save a facilitator note (does not generate).
  app.post('/facilitator/reviews/:id/note', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { note } = z.object({ note: z.string() }).parse(req.body);
    await reviewRepo.updateReview(id, { facilitator_note: note });
    return reply.send({ ok: true });
  });

  // ★ THE ONLY LLM TRIGGER. Idempotent — re-approve returns the cached report.
  app.post('/facilitator/reviews/:id/approve', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const result = await generateReport(id, req.user!.sub);
    return reply.send({ ...result, released: true });
  });

  // Hold a submission — do not generate.
  app.post('/facilitator/reviews/:id/flag', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await reviewRepo.updateReview(id, { decision: 'flagged', reviewer_id: req.user!.sub });
    return reply.send({ ok: true });
  });
}
