/** Instrument (admin-editable, versioned) data access. */
import { db } from '../config/db.js';
import { SCORING, CAPACITY_BY_TAG, type Capacity, type ScoringConstants } from '@reveal/shared';

export async function getLiveVersionId(): Promise<string | null> {
  const { rows } = await db().query<{ version_id: string }>(
    "SELECT version_id FROM instrument_version WHERE is_live = true ORDER BY created_at DESC LIMIT 1",
  );
  return rows[0]?.version_id ?? null;
}

export interface AItemWithOptions {
  item_id: string;
  module_code: string;
  seq: number;
  prompt: string;
  is_non_design: boolean;
  options: { option_id: string; label: string; tag: string }[];
}

export async function getAItems(versionId: string, moduleCode?: string): Promise<AItemWithOptions[]> {
  const { rows: items } = await db().query<Omit<AItemWithOptions, 'options'>>(
    `SELECT item_id, module_code, seq, prompt, is_non_design FROM a_item
      WHERE version_id = $1 AND ($2::text IS NULL OR module_code = $2)
      ORDER BY module_code, seq`,
    [versionId, moduleCode ?? null],
  );
  const { rows: opts } = await db().query<{ item_id: string; option_id: string; label: string; tag: string }>(
    `SELECT o.item_id, o.option_id, o.label, o.tag FROM a_option o
       JOIN a_item i ON i.item_id = o.item_id WHERE i.version_id = $1`,
    [versionId],
  );
  const byItem = new Map<string, { option_id: string; label: string; tag: string }[]>();
  for (const o of opts) {
    const list = byItem.get(o.item_id) ?? [];
    list.push({ option_id: o.option_id, label: o.label, tag: o.tag });
    byItem.set(o.item_id, list);
  }
  return items.map((i) => ({ ...i, options: byItem.get(i.item_id) ?? [] }));
}

/**
 * How many times each capacity appears as an option across the A1 items. The
 * engine divides chosen-counts by these to normalise A-scores by appearances —
 * computed server-side from the instrument, never trusted from the client.
 */
export async function getA1Appearances(versionId: string): Promise<Partial<Record<Capacity, number>>> {
  const { rows } = await db().query<{ tag: string }>(
    `SELECT o.tag FROM a_option o
       JOIN a_item i ON i.item_id = o.item_id
      WHERE i.version_id = $1 AND i.module_code = 'a1'`,
    [versionId],
  );
  const counts: Partial<Record<Capacity, number>> = {};
  for (const r of rows) {
    const cap = CAPACITY_BY_TAG[r.tag];
    if (cap) counts[cap] = (counts[cap] ?? 0) + 1;
  }
  return counts;
}

// ── Questionnaire CRUD (admin) ──────────────────────────────────────────────
export async function createAItem(
  versionId: string,
  input: { module_code: string; prompt: string; seq: number; is_non_design?: boolean },
): Promise<{ item_id: string }> {
  const { rows } = await db().query<{ item_id: string }>(
    'INSERT INTO a_item (version_id, module_code, seq, prompt, is_non_design) VALUES ($1,$2,$3,$4,$5) RETURNING item_id',
    [versionId, input.module_code, input.seq, input.prompt, input.is_non_design ?? false],
  );
  return rows[0]!;
}

export async function updateAItem(
  itemId: string,
  patch: { prompt?: string; seq?: number; is_non_design?: boolean },
): Promise<void> {
  await db().query(
    `UPDATE a_item SET
       prompt = COALESCE($2, prompt),
       seq = COALESCE($3, seq),
       is_non_design = COALESCE($4, is_non_design)
     WHERE item_id = $1`,
    [itemId, patch.prompt ?? null, patch.seq ?? null, patch.is_non_design ?? null],
  );
}

export async function deleteAItem(itemId: string): Promise<void> {
  await db().query('DELETE FROM a_item WHERE item_id = $1', [itemId]); // options cascade
}

export async function addOption(itemId: string, label: string, tag: string): Promise<{ option_id: string }> {
  const { rows } = await db().query<{ option_id: string }>(
    'INSERT INTO a_option (item_id, label, tag) VALUES ($1,$2,$3) RETURNING option_id',
    [itemId, label, tag],
  );
  return rows[0]!;
}

export async function updateOption(optionId: string, patch: { label?: string; tag?: string }): Promise<void> {
  await db().query('UPDATE a_option SET label = COALESCE($2,label), tag = COALESCE($3,tag) WHERE option_id = $1', [
    optionId,
    patch.label ?? null,
    patch.tag ?? null,
  ]);
}

export async function deleteOption(optionId: string): Promise<void> {
  await db().query('DELETE FROM a_option WHERE option_id = $1', [optionId]);
}

export async function getBTasks(versionId: string): Promise<unknown[]> {
  const { rows } = await db().query('SELECT task_code, params, trait_tags FROM b_task WHERE version_id = $1 ORDER BY task_code', [
    versionId,
  ]);
  return rows;
}

export async function getArtifacts(versionId: string): Promise<unknown[]> {
  const { rows } = await db().query(
    'SELECT seq, title, domain, imp, hum, st, pair_code, image_ref FROM artifact WHERE version_id = $1 ORDER BY seq',
    [versionId],
  );
  return rows;
}

export async function getScenes(versionId: string): Promise<unknown[]> {
  const { rows } = await db().query('SELECT stimulus_id, image_ref, zones FROM scene_asset WHERE version_id = $1', [
    versionId,
  ]);
  return rows;
}

/** Load the versioned scoring constants, falling back to the frozen defaults. */
export async function getScoringConstants(versionId: string): Promise<ScoringConstants> {
  const { rows } = await db().query<{ key: string; value: string }>(
    'SELECT key, value FROM scoring_constant WHERE version_id = $1',
    [versionId],
  );
  if (rows.length === 0) return SCORING;
  const map = new Map(rows.map((r) => [r.key, Number(r.value)]));
  const g = (k: string, d: number): number => map.get(k) ?? d;
  return {
    WEIGHT_PRIMARY: g('weight_primary', SCORING.WEIGHT_PRIMARY),
    WEIGHT_SECONDARY: g('weight_secondary', SCORING.WEIGHT_SECONDARY),
    A_PRESENT: g('a_present', SCORING.A_PRESENT),
    A_ABSENT: g('a_absent', SCORING.A_ABSENT),
    B_POINTS_TOWARD: g('b_points_toward', SCORING.B_POINTS_TOWARD),
    CONTRADICTION_A: g('contradiction_a', SCORING.CONTRADICTION_A),
    CONTRADICTION_B: g('contradiction_b', SCORING.CONTRADICTION_B),
    DEMONSTRATED_B_WEIGHT: g('demonstrated_b_weight', SCORING.DEMONSTRATED_B_WEIGHT),
    DEMONSTRATED_A_WEIGHT: g('demonstrated_a_weight', SCORING.DEMONSTRATED_A_WEIGHT),
    GAP_MEANINGFUL: g('gap_meaningful', SCORING.GAP_MEANINGFUL),
    B5_BAND_SMALL: g('b5_band_small', SCORING.B5_BAND_SMALL),
    B5_BAND_LARGE: g('b5_band_large', SCORING.B5_BAND_LARGE),
    CC3_MIN_AGREE: g('cc3_min_agree', SCORING.CC3_MIN_AGREE),
    CC2_MIN_AGREE: g('cc2_min_agree', SCORING.CC2_MIN_AGREE),
    SURPRISE_MIN_SITUATIONS: g('surprise_min_situations', SCORING.SURPRISE_MIN_SITUATIONS),
  };
}
