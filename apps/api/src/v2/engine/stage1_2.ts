/**
 * Stage 1 · Derivation (raw_payload → atoms)
 * Stage 2 · Aggregation (atoms → construct_scores)
 *
 * The pinned numbers: blend = 0.65·do + 0.35·say; say↔do gap cutoff 15;
 * evidence_threshold 3; the confidence tree. All from ruleset v2.0.0.
 */
import type { ConfidenceTier, SayDoGapClass } from '@reveal/shared/v2';
import { SCORING } from '@reveal/shared/v2';
import type { AtomT, MasterData, RawCapture, ScoreT } from './types.js';
import { clamp, mean } from './helpers.js';

const isAmount = (type: string): boolean => type === 'amount' || type === 'gap';
const isBipolar = (type: string): boolean => type === 'bipolar' || type === 'tradeoff_axis';

/** Stage 1 — deposit an atom for every scorable tick and every direct signal. */
export function derive(master: MasterData, raw: RawCapture): AtomT[] {
  const optionById = new Map(master.options.map((o) => [o.id, o]));
  const constructById = new Map(master.constructs.map((c) => [c.id, c]));
  const atoms: AtomT[] = [];

  for (const res of raw.responses) {
    // (a) ticked options → unit directional atoms
    for (const optId of res.rawPayload.selected_option_ids ?? []) {
      const opt = optionById.get(optId);
      if (!opt || opt.isEscape) continue; // escape routes to mentor, never scored
      if (!opt.mapsToConstructId || opt.magnitude !== '1') continue; // ladder-r1 counts handled elsewhere
      const c = constructById.get(opt.mapsToConstructId);
      if (!c) continue;
      const channel = (opt.channel as 'say' | 'do' | null) ?? res.channel;
      // sign a bipolar/axis tick by which pole it lands on
      let sign = 1;
      if (isBipolar(c.type) && opt.edge) sign = opt.edge === c.edgeLow ? -1 : 1;
      atoms.push({
        constructId: c.id,
        channel,
        value: sign,
        position: isBipolar(c.type) ? sign : null,
        resolvedness: null,
        sourceActivityId: res.activityId,
      });
    }
    // (b) direct behavioural/claim signals → full-magnitude atoms
    for (const sig of res.rawPayload.signals ?? []) {
      atoms.push({
        constructId: sig.constructId,
        channel: sig.channel,
        value: sig.value,
        position: sig.position ?? null,
        resolvedness: null,
        sourceActivityId: res.activityId,
      });
    }
  }
  return atoms;
}

function confidenceTier(
  n: number,
  bothPresent: boolean,
  agree: boolean,
  doOnly: boolean,
): ConfidenceTier {
  if (n < 2) return 'undetermined';
  if (doOnly) return n >= 2 ? 'behavioural_not_neural' : 'undetermined';
  if (n >= 3 && bothPresent && agree) return 'evidenced';
  if (n >= 3 || (n === 2 && agree)) return 'well_motivated';
  if (n === 2 && !agree) return 'plausible';
  return 'plausible';
}

/** Stage 2 — aggregate atoms per construct into one scored row. */
export function aggregate(master: MasterData, atoms: AtomT[]): ScoreT[] {
  const constructById = new Map(master.constructs.map((c) => [c.id, c]));
  const byConstruct = new Map<string, AtomT[]>();
  for (const a of atoms) {
    const arr = byConstruct.get(a.constructId) ?? [];
    arr.push(a);
    byConstruct.set(a.constructId, arr);
  }

  const scores: ScoreT[] = [];
  const cutoff = SCORING.sayDoGapCutoff;

  for (const [constructId, group] of byConstruct) {
    const c = constructById.get(constructId);
    if (!c) continue;

    const channelValue = (channel: 'say' | 'do'): number | null => {
      const list = group.filter((a) => a.channel === channel);
      if (!list.length) return null;
      const mag = list.filter((a) => Math.abs(a.value) > 1.0001);
      if (mag.length) return mean(mag.map((a) => a.value));
      // only unit ticks: a signed lean for bipolar, a density for amount
      const m = mean(list.map((a) => a.value));
      return isBipolar(c.type) ? clamp(m * 100, -100, 100) : clamp(Math.abs(m) * 100, 0, 100);
    };

    const sayValue = channelValue('say');
    const doValue = channelValue('do');
    const bothPresent = sayValue !== null && doValue !== null;
    const doOnly = doValue !== null && sayValue === null;

    let blended: number;
    if (bothPresent) blended = SCORING.sayDoBlend.do * doValue! + SCORING.sayDoBlend.say * sayValue!;
    else blended = (doValue ?? sayValue) as number;

    // say↔do relationship
    let gapClass: SayDoGapClass | null = null;
    if (bothPresent) {
      const d = doValue! - sayValue!;
      gapClass = Math.abs(d) <= cutoff ? 'agree' : d > 0 ? 'real' : 'performed';
    } else if (doOnly) gapClass = 'latent';
    else gapClass = 'performed';

    const agree = bothPresent ? Math.abs(doValue! - sayValue!) <= cutoff : false;
    const sourceActivities = [...new Set(group.map((a) => a.sourceActivityId))];
    const n = sourceActivities.length;

    let positionEdge: string | null = null;
    let resolvedness = group.find((a) => a.resolvedness)?.resolvedness ?? null;
    if (isBipolar(c.type)) {
      positionEdge = blended >= 0 ? c.edgeHigh : c.edgeLow;
      if (!resolvedness) resolvedness = 'resolved';
    }

    // Capacities are demonstrated, not claimed — firing/fit read the do channel
    // even when a low self-claim drags the displayed blend down (the surprise).
    const demonstratedValue = c.family === 'capacity' ? (doValue ?? blended) : blended;

    scores.push({
      constructId,
      family: c.family,
      type: c.type,
      name: c.name,
      sayValue,
      doValue,
      blendedValue: Math.round(blended * 100) / 100,
      demonstratedValue: Math.round(demonstratedValue * 100) / 100,
      positionEdge,
      resolvedness,
      confidenceTier: confidenceTier(n, bothPresent, agree, doOnly),
      evidenceCount: n,
      gateFlag: false,
      sayDoGapClass: gapClass,
      sourceActivities,
    });
  }
  return scores;
}
