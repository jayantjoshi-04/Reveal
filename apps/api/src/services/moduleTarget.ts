/** Maps a module_code → where in raw_capture its payload lands. */
import type { ModuleCode } from '@reveal/shared';

const CHANNEL_A_KEYS: Partial<Record<ModuleCode, string>> = {
  a1: 'a1_capacities',
  a3: 'a3_values',
  a4: 'a4_conditions',
  a5: 'a5_encounters',
  a6: 'a6_obsessions',
  a7: 'a7_aspiration',
};

const CHANNEL_B_KEYS: Partial<Record<ModuleCode, string>> = {
  b1: 'b1_budget',
  b2: 'b2_dilemmas',
  b3: 'b3_moves',
  b4: 'b4_attention',
  b5: 'b5_wishsort',
  b6: 'b6_upload',
  b7: 'b7_year',
  b8: 'b8_disruption',
  b9: 'b9_scenarios',
};

export type ModuleTarget =
  | { kind: 'channel_a'; key: string }
  | { kind: 'channel_b'; key: string }
  | { kind: 'portfolio' }
  | { kind: 'consent' };

export function moduleTarget(code: ModuleCode): ModuleTarget {
  if (CHANNEL_A_KEYS[code]) return { kind: 'channel_a', key: CHANNEL_A_KEYS[code]! };
  if (CHANNEL_B_KEYS[code]) return { kind: 'channel_b', key: CHANNEL_B_KEYS[code]! };
  if (code === 'consent') return { kind: 'consent' };
  // portfolio_facts, portfolio_interpretive, resume
  return { kind: 'portfolio' };
}
