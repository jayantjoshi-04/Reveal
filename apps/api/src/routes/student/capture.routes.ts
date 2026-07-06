/**
 * Student capture (Layer 1). Start/resume, read server-authoritative state,
 * submit a module, seal a session. Sealed behavioural answers never come back.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { MODULE_CODES, MODULE_PAYLOAD_SCHEMAS, type ModuleCode } from '@reveal/shared';
import { requireStudent } from '../../middleware/auth.js';
import * as session from '../../services/session.service.js';
import { getInstance } from '../../repositories/instance.repo.js';

const moduleParam = z.object({ id: z.string().uuid(), code: z.enum(MODULE_CODES) });
const sealParam = z.object({ id: z.string().uuid(), no: z.coerce.number().int().min(1).max(3) });
const submitBody = z.object({ payload: z.unknown(), response_ms: z.number().int().nonnegative().optional() });

/** Confirm the JWT's student owns this instance. */
async function assertOwner(req: { user?: { sub: string } }, instanceId: string): Promise<void> {
  const instance = await getInstance(instanceId);
  if (!instance) throw new session.NotFound('instance');
  if (instance.student_id !== req.user?.sub) throw new session.HttpError(403, 'not your instance');
}

export async function captureRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireStudent);

  // Start a fresh instance or resume the in-progress one.
  app.post('/instances', async (req) => {
    return session.startOrResume(req.user!.sub);
  });

  // Server-authoritative resume payload.
  app.get('/instances/:id/state', async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await assertOwner(req, id);
    return session.getState(id);
  });

  // Submit one module answer.
  app.post('/instances/:id/modules/:code', async (req, reply) => {
    const { id, code } = moduleParam.parse(req.params);
    const { payload, response_ms } = submitBody.parse(req.body);
    await assertOwner(req, id);

    // Validate the payload against the module's frozen contract, when we have one.
    const schema = MODULE_PAYLOAD_SCHEMAS[code as keyof typeof MODULE_PAYLOAD_SCHEMAS];
    const validated = schema ? schema.parse(payload) : payload;

    const result = await session.submitModule({
      instanceId: id,
      moduleCode: code as ModuleCode,
      payload: validated,
      responseMs: response_ms,
    });
    return reply.send(result);
  });

  // Seal a session (transactional, idempotent). Session 3 → capture_complete + engine.
  app.post('/instances/:id/sessions/:no/seal', async (req) => {
    const { id, no } = sealParam.parse(req.params);
    await assertOwner(req, id);
    return session.sealSession(id, no);
  });
}
