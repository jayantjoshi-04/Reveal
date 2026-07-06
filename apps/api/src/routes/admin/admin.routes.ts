/**
 * Admin console API. Read the live instrument, edit A-item prompts/options, and
 * re-run scoring over existing raw_capture at the current constants — the payoff
 * of storing raw separately from derived.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAdmin } from '../../middleware/auth.js';
import * as instrument from '../../repositories/instrument.repo.js';
import { runEngineFor } from '../../services/generation.service.js';
import { HttpError } from '../../services/session.service.js';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAdmin);

  // Overview counts for the dashboard.
  app.get('/admin/overview', async () => {
    const versionId = await instrument.getLiveVersionId();
    if (!versionId) throw new HttpError(503, 'no live instrument version');
    const [a, b, art] = await Promise.all([
      instrument.getAItems(versionId),
      instrument.getBTasks(versionId),
      instrument.getArtifacts(versionId),
    ]);
    return { version_id: versionId, a_items: a.length, b_tasks: b.length, artifacts: art.length };
  });

  // Edit an A-item prompt.
  app.patch('/admin/a-items/:itemId', async (req, reply) => {
    const { itemId } = z.object({ itemId: z.string().uuid() }).parse(req.params);
    const { prompt } = z.object({ prompt: z.string().min(1) }).parse(req.body);
    await db().query('UPDATE a_item SET prompt = $2 WHERE item_id = $1', [itemId, prompt]);
    return reply.send({ ok: true });
  });

  // Re-run the deterministic engine over every capture-complete/released instance.
  app.post('/admin/reports/rerun-scoring', async (reply) => {
    const { rows } = await db().query<{ instance_id: string }>(
      "SELECT instance_id FROM report_instance WHERE status IN ('capture_complete','generated','reviewed','released')",
    );
    let count = 0;
    for (const r of rows) {
      await runEngineFor(r.instance_id);
      count++;
    }
    return { rescored: count };
  });
}
