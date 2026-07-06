/**
 * Uploads. The client uploads the file directly to object storage (Supabase
 * Storage / S3) and then registers the returned ref here — so file bytes never
 * pass through the free-tier API host. Portfolio (S1), B6 images (S3), resume (S3).
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireStudent } from '../../middleware/auth.js';
import { getInstance } from '../../repositories/instance.repo.js';
import { HttpError, NotFound } from '../../services/session.service.js';

const body = z.object({
  kind: z.enum(['portfolio', 'b6_image', 'resume']),
  storage_ref: z.string().min(1),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function uploadRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireStudent);

  app.post('/instances/:id/uploads', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { kind, storage_ref, meta } = body.parse(req.body);

    const instance = await getInstance(id);
    if (!instance) throw new NotFound('instance');
    if (instance.student_id !== req.user?.sub) throw new HttpError(403, 'not your instance');

    const { rows } = await db().query<{ upload_id: string }>(
      'INSERT INTO upload (instance_id, kind, storage_ref, meta) VALUES ($1,$2,$3,$4) RETURNING upload_id',
      [id, kind, storage_ref, JSON.stringify(meta ?? {})],
    );
    return reply.send({ upload_id: rows[0]!.upload_id, kind, storage_ref });
  });
}
