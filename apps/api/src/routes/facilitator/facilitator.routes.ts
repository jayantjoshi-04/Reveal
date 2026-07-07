/**
 * Facilitator review gate. The queue lists capture-complete instances; the
 * review screen shows the COMPUTED high-stakes calls (no LLM); "approve" is the
 * ONE trigger for the single synthesis call.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireFacilitator } from '../../middleware/auth.js';
import * as reviewRepo from '../../repositories/review.repo.js';
import { getDerived, getReportPayload } from '../../repositories/derived.repo.js';
import { getInstance } from '../../repositories/instance.repo.js';
import { generateReport } from '../../services/generation.service.js';
import { NotFound, HttpError } from '../../services/session.service.js';
import { validatePartialSlots } from '../../synthesis/validate.js';
import { SLOT_IDS } from '@reveal/shared';

export async function facilitatorRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireFacilitator);

  // The queue: to_review (capture_complete) or approved (released).
  app.get('/facilitator/queue', async (req) => {
    const { status, cohort } = z
      .object({ status: z.enum(['to_review', 'approved']).default('to_review'), cohort: z.string().optional() })
      .parse(req.query);
    return reviewRepo.getQueue(status, cohort);
  });

  // The review screen — computed findings + high-stakes summary, plus the
  // generated report wording (once generated) and any facilitator edits.
  app.get('/facilitator/reviews/:id', async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const [instance, derived, review, payload] = await Promise.all([
      getInstance(id),
      getDerived(id),
      reviewRepo.getReview(id),
      getReportPayload(id),
    ]);
    if (!instance || !derived) throw new NotFound('review');
    return {
      instance_id: id,
      status: instance.status,
      findings: derived.findings,
      high_stakes: review?.high_stakes ?? null,
      facilitator_note: review?.facilitator_note ?? null,
      decision: review?.decision ?? 'pending',
      slots: payload?.slots ?? null,
      slot_edits: review?.slot_edits ?? null,
    };
  });

  // Save a facilitator note (does not generate).
  app.post('/facilitator/reviews/:id/note', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { note } = z.object({ note: z.string() }).parse(req.body);
    await reviewRepo.updateReview(id, { facilitator_note: note });
    return reply.send({ ok: true });
  });

  // Facilitator "lightly edits" the generated wording before release. Edits are
  // held to the SAME contract as the LLM output — a human can't break it either.
  app.post('/facilitator/reviews/:id/slots', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { slots } = z
      .object({ slots: z.record(z.enum(SLOT_IDS), z.string()) })
      .parse(req.body);

    const payload = await getReportPayload(id);
    if (!payload) throw new HttpError(409, 'report not generated yet — approve first');

    const check = validatePartialSlots(slots);
    if (!check.ok) return reply.code(400).send({ error: 'contract_violation', issues: check.errors });

    await reviewRepo.updateReview(id, { decision: 'edited', reviewer_id: req.user!.sub, slot_edits: slots });
    return reply.send({ ok: true, edited: Object.keys(slots) });
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
