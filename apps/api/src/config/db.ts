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

export function db(): pg.Pool {
  if (pool) return pool;
  pool = new Pool({
    connectionString: env().DATABASE_URL,
    max: 10, // conservative for free-tier Postgres
    idleTimeoutMillis: 30_000,
    // Supabase/Neon require SSL in production
    ssl: env().NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
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
