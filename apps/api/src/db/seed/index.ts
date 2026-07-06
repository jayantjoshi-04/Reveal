/**
 * Seed instrument version 1.0 from the reference content, plus a demo
 * facilitator + admin. Idempotent: skips if a live version already exists.
 */
import { db, withTransaction, closeDb } from '../../config/db.js';
import { A1_ITEMS } from './data/a-items.js';
import { ARTIFACTS } from './data/artifacts.js';
import { B_TASKS, RUBRIC_DIMENSIONS, SCENES, SCORING_CONSTANTS } from './data/instrument.js';

async function seed(): Promise<void> {
  const existing = await db().query("SELECT version_id FROM instrument_version WHERE is_live = true LIMIT 1");
  if (existing.rowCount && existing.rowCount > 0) {
    console.log('✓ A live instrument version already exists — skipping instrument seed.');
  } else {
    await withTransaction(async (c) => {
      const v = await c.query<{ version_id: string }>(
        "INSERT INTO instrument_version (label, is_live) VALUES ('1.0', true) RETURNING version_id",
      );
      const versionId = v.rows[0]!.version_id;

      for (const item of A1_ITEMS) {
        const r = await c.query<{ item_id: string }>(
          'INSERT INTO a_item (version_id, module_code, seq, prompt, is_non_design) VALUES ($1,$2,$3,$4,$5) RETURNING item_id',
          [versionId, item.module_code, item.seq, item.prompt, item.is_non_design],
        );
        const itemId = r.rows[0]!.item_id;
        for (const opt of item.options) {
          await c.query('INSERT INTO a_option (item_id, label, tag) VALUES ($1,$2,$3)', [itemId, opt.label, opt.tag]);
        }
      }

      for (const task of B_TASKS) {
        await c.query('INSERT INTO b_task (version_id, task_code, params, trait_tags) VALUES ($1,$2,$3,$4)', [
          versionId,
          task.task_code,
          JSON.stringify(task.params),
          JSON.stringify(task.trait_tags),
        ]);
      }

      for (const a of ARTIFACTS) {
        await c.query(
          'INSERT INTO artifact (version_id, seq, title, domain, imp, hum, st, pair_code) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [versionId, a.seq, a.title, a.domain, a.imp, a.hum, a.st, a.pair],
        );
      }

      for (const s of SCENES) {
        await c.query('INSERT INTO scene_asset (version_id, stimulus_id, zones) VALUES ($1,$2,$3)', [
          versionId,
          s.stimulus_id,
          JSON.stringify(s.zones),
        ]);
      }

      for (const d of RUBRIC_DIMENSIONS) {
        await c.query('INSERT INTO rubric_dimension (version_id, name, poles) VALUES ($1,$2,$3)', [
          versionId,
          d.name,
          d.poles,
        ]);
      }

      for (const k of SCORING_CONSTANTS) {
        await c.query('INSERT INTO scoring_constant (version_id, key, value) VALUES ($1,$2,$3)', [
          versionId,
          k.key,
          k.value,
        ]);
      }

      console.log(
        `✓ Seeded instrument v1.0: ${A1_ITEMS.length} A1 items, ${B_TASKS.length} B tasks, ${ARTIFACTS.length} artifacts, ${SCENES.length} scenes, ${SCORING_CONSTANTS.length} constants.`,
      );
    });
  }

  // Demo staff (idempotent by unique email)
  await db().query(
    `INSERT INTO staff (email, name, role) VALUES
       ('facilitator@reveal.test', 'Demo Facilitator', 'facilitator'),
       ('admin@reveal.test', 'Demo Admin', 'admin')
     ON CONFLICT (email) DO NOTHING`,
  );
  console.log('✓ Demo staff ready (facilitator@reveal.test, admin@reveal.test).');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(closeDb);
