/** Builds the Fastify application: plugins, error handling, route trees. */
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { HttpError } from './services/errors.js';
import { authRoutes } from './routes/auth/auth.routes.js';
import { meRoutes } from './routes/student/me.routes.js';
import { adminRoutes } from './routes/admin/admin.routes.js';
import { surveyRoutes } from './v2/survey.routes.js';

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
  app.setErrorHandler((error, req, reply) => {
    if (error instanceof ZodError) {
      // Human-readable "field: message" strings, and log which route failed so
      // a 400 is diagnosable from a single line.
      const issues = error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`);
      req.log.warn({ url: req.url, issues }, 'validation_error (400)');
      return reply.code(400).send({ error: 'validation_error', issues });
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

  // Health + live-version probe. `commit` reports exactly which git commit this
  // instance is running (Render injects RENDER_GIT_COMMIT on every deploy), so
  // "is the latest version live?" is answerable by curling /health.
  app.get('/health', async () => ({
    status: 'ok',
    service: 'reveal-api',
    commit: process.env.RENDER_GIT_COMMIT?.slice(0, 7) ?? 'dev',
    ruleset: '2.0.0',
  }));

  // Route trees under /api
  await app.register(
    async (api) => {
      await api.register(authRoutes);
      await api.register(meRoutes);
      await api.register(adminRoutes);
      await api.register(surveyRoutes);
    },
    { prefix: '/api' },
  );

  return app;
}
