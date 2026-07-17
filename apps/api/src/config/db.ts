/** Postgres connection pool (Supabase / Neon). */
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Postgres returns NUMERIC/DECIMAL columns as strings by default. Parse them to
// JS numbers so values like artifact imp/hum reach the client as numbers, not
// "0.9" — otherwise the B5 payload fails its number contract (400) and centroid
// math concatenates strings. Precision is ample for our -1..1 scores.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => (v === null ? null : Number(v)));

let pool: pg.Pool | null = null;

/**
 * Hosted Postgres (Supabase / Neon / Render) requires SSL, and so does any
 * connection to a non-local host — including running `db:migrate` from a laptop
 * against the production database. So enable SSL whenever the host isn't local
 * (or NODE_ENV is production), and never for localhost dev. `rejectUnauthorized:
 * false` accepts the providers' managed certificates.
 */
function needsSsl(): boolean {
  if (env().NODE_ENV === 'production') return true;
  try {
    const host = new URL(env().DATABASE_URL).hostname;
    return !['localhost', '127.0.0.1', '::1', ''].includes(host);
  } catch {
    return false;
  }
}

export function db(): pg.Pool {
  if (pool) return pool;
  pool = new Pool({
    connectionString: env().DATABASE_URL,
    max: 10, // conservative for free-tier Postgres
    idleTimeoutMillis: 30_000,
    ssl: needsSsl() ? { rejectUnauthorized: false } : undefined,
  });
  return pool;
}

/** Run a function inside a transaction, rolling back on error. */
export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await db().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
