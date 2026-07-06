/**
 * Minimal SQL migration runner. Applies every *.sql in migrations/ in order,
 * tracking applied files in a `_migration` table. Idempotent.
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, closeDb } from '../config/db.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, 'migrations');

async function run(): Promise<void> {
  const pool = db();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migration (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
  const { rows } = await pool.query<{ name: string }>('SELECT name FROM _migration');
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`✓ ${file} (already applied)`);
      continue;
    }
    const sql = await readFile(join(migrationsDir, file), 'utf8');
    console.log(`→ applying ${file} …`);
    await pool.query(sql);
    await pool.query('INSERT INTO _migration (name) VALUES ($1)', [file]);
    console.log(`✓ ${file}`);
  }
  console.log('Migrations complete.');
}

run()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  })
  .finally(closeDb);
