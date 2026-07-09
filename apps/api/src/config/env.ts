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
  // Shared passcode gating staff (facilitator/admin) sign-in for the pilot.
  STAFF_PASSCODE: z.string().default('reveal-staff'),
  ANTHROPIC_API_KEY: z.string().optional(),
  SYNTHESIS_MODEL: z.string().default('claude-sonnet-5'),
  SYNTHESIS_TEMPERATURE: z.coerce.number().default(0.3),
  SYNTHESIS_MODE: z.enum(['auto', 'manual']).default('auto'),
  STORAGE_BUCKET: z.string().default('reveal-uploads'),
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
    if (parsed.data.STAFF_PASSCODE === 'reveal-staff')
      throw new Error('STAFF_PASSCODE must be set in production');
  }
  cached = parsed.data;
  return cached;
}
