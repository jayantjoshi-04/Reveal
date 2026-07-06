/** Serves the live instrument content the capture UI renders. */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireRole } from '../../middleware/auth.js';
import * as instrument from '../../repositories/instrument.repo.js';
import { HttpError } from '../../services/session.service.js';

export async function contentRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireRole('student', 'facilitator', 'admin'));

  app.get('/content/:kind', async (req) => {
    const { kind } = z
      .object({ kind: z.enum(['a-items', 'b-tasks', 'artifacts', 'scenes']) })
      .parse(req.params);
    const versionId = await instrument.getLiveVersionId();
    if (!versionId) throw new HttpError(503, 'no live instrument version');

    switch (kind) {
      case 'a-items':
        return instrument.getAItems(versionId);
      case 'b-tasks':
        return instrument.getBTasks(versionId);
      case 'artifacts':
        return instrument.getArtifacts(versionId);
      case 'scenes':
        return instrument.getScenes(versionId);
    }
  });
}
