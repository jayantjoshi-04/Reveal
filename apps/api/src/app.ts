/** Builds the Fastify application: plugins, error handling, route trees. */
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { HttpError } from './services/session.service.js';
import { authRoutes } from './routes/auth/auth.routes.js';
import { captureRoutes } from './routes/student/capture.routes.js';
import { uploadRoutes } from './routes/student/uploads.routes.js';
import { facilitatorRoutes } from './routes/facilitator/facilitator.routes.js';
import { reportRoutes } from './routes/report/report.routes.js';
import { contentRoutes } from './routes/content/content.routes.js';
import { adminRoutes } from './routes/admin/admin.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: env().NODE_ENV === 'production' ? 'info' : 'debug' } });

  await app.register(cors, {
    origin: env().CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  });
  await app.register(jwt, { secret: env().JWT_SECRET });

  // Tolerate empty JSON bodies (e.g. POST /instances with no payload) — Fastify
  // otherwise 400s when content-type is application/json but the body is empty.
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    if (body === '' || body == null) return done(null, {});
    try {
      done(null, JSON.parse(body as string));
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  // Unified error handling: Zod → 400, typed HttpError → its code, else 500.
  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: 'validation_error', issues: error.issues });
    }
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ error: error.message });
    }
    if (typeof (error as { statusCode?: number }).statusCode === 'number') {
      return reply.code((error as { statusCode: number }).statusCode).send({ error: (error as Error).message });
    }
    app.log.error(error);
    return reply.code(500).send({ error: 'internal_error' });
  });

  app.get('/health', async () => ({ status: 'ok', service: 'reveal-api' }));

  // Route trees under /api
  await app.register(
    async (api) => {
      await api.register(authRoutes);
      await api.register(captureRoutes);
      await api.register(uploadRoutes);
      await api.register(facilitatorRoutes);
      await api.register(reportRoutes);
      await api.register(contentRoutes);
      await api.register(adminRoutes);
    },
    { prefix: '/api' },
  );

  return app;
}
