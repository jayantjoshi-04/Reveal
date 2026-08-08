/** Build the intent-driver profile (drivers, valence, robustness) from raw capture. */
import type { IntentProfile } from './molecules.js';
import type { MasterData, RawCapture } from './types.js';

export function buildIntent(master: MasterData, raw: RawCapture): IntentProfile {
  const optionById = new Map(master.options.map((o) => [o.id, o]));
  const count = new Map<string, number>();
  const valence = new Map<string, 'approach' | 'avoidance'>();
  const seenValence = new Map<string, Set<string>>();

  const record = (driver: string | null | undefined, val: string | null | undefined): void => {
    if (!driver) return;
    count.set(driver, (count.get(driver) ?? 0) + 1);
    if (val === 'approach' || val === 'avoidance') {
      valence.set(driver, val);
      const set = seenValence.get(driver) ?? new Set<string>();
      set.add(val);
      seenValence.set(driver, set);
    }
  };

  for (const res of raw.responses) {
    for (const optId of res.rawPayload.selected_option_ids ?? []) {
      const opt = optionById.get(optId);
      if (opt?.driver) record(opt.driver, opt.valence);
    }
    for (const sig of res.rawPayload.signals ?? []) {
      if (sig.driver) record(sig.driver, sig.valence ?? null);
    }
  }

  const present = new Set(count.keys());
  const mixedValence = new Set([...seenValence.entries()].filter(([, s]) => s.size > 1).map(([d]) => d));
  const max = Math.max(0, ...count.values());
  const dominant = new Set([...count.entries()].filter(([, n]) => n >= Math.max(2, max)).map(([d]) => d));

  return { present, valence, mixedValence, dominant };
}

/** Reason robustness for the report intent block. */
export function driverRobustness(master: MasterData, raw: RawCapture, driver: string): 'over_determined' | 'fragile' {
  const optionById = new Map(master.options.map((o) => [o.id, o]));
  let n = 0;
  for (const res of raw.responses)
    for (const optId of res.rawPayload.selected_option_ids ?? []) {
      const opt = optionById.get(optId);
      if (opt?.driver === driver) n++;
    }
  return n >= 2 ? 'over_determined' : 'fragile';
}
