/** Environment parsing — fail fast on missing critical config. */
import { z } from 'zod';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load a .env file so `cp .env.example .env` actually takes effect. We look at
// the repo root (cwd is apps/api when run via `pnpm dev:api`) and the cwd
// (when run from the repo root in production). First match wins; real
// environment variables always take precedence over the file.
for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) dotenv.config({ path: candidate });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(1).default('dev-insecure-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  MAGIC_LINK_TTL_MIN: z.coerce.number().default(30),
  ANTHROPIC_API_KEY: z.string().optional(),
  SYNTHESIS_MODEL: z.string().default('claude-sonnet-5'),
  SYNTHESIS_TEMPERATURE: z.coerce.number().default(0.3),
  SYNTHESIS_MODE: z.enum(['auto', 'manual']).default('auto'),
  STORAGE_BUCKET: z.string().default('reveal-uploads'),

  // ─── Email (verification + welcome) ──────────────────────────────────
  // Product identity used in emails and links.
  APP_NAME: z.string().default('REVEAL'),
  // Public site URL, used for links/buttons inside emails.
  APP_URL: z.string().default('http://localhost:5173'),
  // "From" address. Must be a sender your provider is allowed to send as
  // (Resend: a verified domain, or onboarding@resend.dev in test; SMTP: your
  // verified single-sender). Format: `Name <address@example.com>`.
  EMAIL_FROM: z.string().default('REVEAL <onboarding@resend.dev>'),
  // Support/reply address shown in the email footer + terms.
  SUPPORT_EMAIL: z.string().default('support@reveal.app'),
  // Transport A — Resend HTTP API (recommended on Render; works over HTTPS).
  RESEND_API_KEY: z.string().optional(),
  // Transport B — any SMTP provider (SendGrid, Brevo, Gmail, Mailgun, …).
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;
export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    console.error('❌ Invalid environment:', fieldErrors);
    if (fieldErrors.DATABASE_URL) {
      console.error(
        '\n  DATABASE_URL is missing. Set it in a .env file at the repo root, e.g.:\n' +
          '    DATABASE_URL=postgresql://user:password@localhost:5432/reveal\n' +
          '  (copy .env.example to .env and fill it in). See README → "Running locally".\n',
      );
    }
    throw new Error('Invalid environment configuration');
  }
  // Never boot production on the public dev defaults for secrets.
  if (parsed.data.NODE_ENV === 'production') {
    if (parsed.data.JWT_SECRET === 'dev-insecure-secret-change-me')
      throw new Error('JWT_SECRET must be set in production');
  }
  cached = parsed.data;
  return cached;
}
