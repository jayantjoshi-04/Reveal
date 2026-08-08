/**
 * Stage 3 · Molecules — the authored rule library, encoded deterministically.
 *
 * The seed carries each rule's human-readable trigger + its pre-written
 * render_template (the ONLY source of report prose). Here we encode the 23
 * "Fires when" conditions as reviewable predicates over the construct reads,
 * exactly as the Molecule Library specifies. Confidence = MIN(leg levels).
 */
import type { MoleculeConfidence } from '@reveal/shared/v2';
import { CONFIDENCE_WEIGHT, TOP_N_PER_SLOT } from '@reveal/shared/v2';
import type { MasterData, MoleculeFiredT, ScoreT } from './types.js';
import { readerFor, type Level, type Read } from './helpers.js';

export interface IntentProfile {
  present: Set<string>; // drivers observed
  valence: Map<string, 'approach' | 'avoidance'>;
  mixedValence: Set<string>; // driver seen both approach & avoidance
  dominant: Set<string>; // top drivers
}

interface Ctx {
  r: (id: string) => Read;
  leans: (id: string, pole: string) => boolean;
  highCapacities: string[];
  intent: IntentProfile;
}

const legConf = (level: Level | 'split'): MoleculeConfidence =>
  level === 'high' ? 'determined' : level === 'medium' ? 'tentative' : 'undetermined';

/** A bipolar leg's confidence, from how firmly it leans. */
function bipolarConf(read: Read): MoleculeConfidence {
  const m = Math.abs(read.position);
  if (read.score?.resolvedness === 'genuinely_split') return 'undetermined';
  return m >= 50 ? 'determined' : m >= 20 ? 'tentative' : 'undetermined';
}

const minConf = (...cs: MoleculeConfidence[]): MoleculeConfidence => {
  const order: MoleculeConfidence[] = ['undetermined', 'tentative', 'determined'];
  return cs.reduce((acc, c) => (order.indexOf(c) < order.indexOf(acc) ? c : acc), 'determined');
};

interface RuleDef {
  id: string;
  fires: (c: Ctx) => boolean;
  conf: (c: Ctx) => MoleculeConfidence;
}

// Environment / disposition / value poles (high edge unless noted).
const RULES: RuleDef[] = [
  { id: 'G0', fires: (c) => c.intent.mixedValence.size > 0, conf: () => 'tentative' },
  {
    id: 'G1',
    fires: (c) => c.r('Empathy').level === 'high' && c.leans('Insul↔Feedback', 'Feedback'),
    conf: (c) => minConf(legConf(c.r('Empathy').level), bipolarConf(c.r('Insul↔Feedback'))),
  },
  {
    id: 'G2',
    fires: (c) => c.r('Conviction').level === 'high' && c.leans('Blame↔Safe', 'Safe'),
    conf: (c) => minConf(legConf(c.r('Conviction').level), bipolarConf(c.r('Blame↔Safe'))),
  },
  {
    id: 'G3',
    fires: (c) => c.r('Systems').level === 'high' && c.leans('Silo↔CrossD', 'CrossD'),
    conf: (c) => minConf(legConf(c.r('Systems').level), bipolarConf(c.r('Silo↔CrossD'))),
  },
  {
    id: 'G4',
    fires: (c) => c.r('Analytical').level === 'high' && c.leans('Routine↔Challenge', 'Challenge'),
    conf: (c) => minConf(legConf(c.r('Analytical').level), bipolarConf(c.r('Routine↔Challenge'))),
  },
  {
    id: 'G5',
    fires: (c) => c.r('Making').level === 'high' && c.leans('Boot↔Resourced', 'Resourced'),
    conf: (c) => minConf(legConf(c.r('Making').level), bipolarConf(c.r('Boot↔Resourced'))),
  },
  {
    id: 'G6',
    fires: (c) =>
      (c.intent.dominant.has('Creation') || c.intent.dominant.has('Understanding')) &&
      c.leans('Concept↔Launch', 'Launch'),
    conf: () => 'tentative',
  },
  {
    id: 'S1',
    fires: (c) => c.r('Aesthetic').level === 'high' && c.r('Digital/Intx').level === 'low',
    conf: (c) => minConf(legConf(c.r('Aesthetic').level), 'tentative'),
  },
  {
    id: 'S2',
    fires: (c) => c.r('Empathy').level === 'high',
    conf: (c) => minConf(legConf(c.r('Empathy').level), legConf(c.r('Research').level === 'low' ? 'high' : c.r('Research').level)),
  },
  {
    id: 'S3',
    fires: (c) => c.r('Systems').level === 'high' && c.r('Research').present,
    conf: (c) => minConf(legConf(c.r('Systems').level), legConf(c.r('Research').level)),
  },
  {
    id: 'S4',
    fires: (c) => c.r('Aesthetic').level === 'low' && c.r('Digital/Intx').level === 'high',
    conf: (c) => minConf('tentative', legConf(c.r('Digital/Intx').level)),
  },
  {
    id: 'T1',
    fires: (c) => c.r('Conviction').level === 'high' && c.r('Analytical').level === 'high',
    conf: (c) => minConf(legConf(c.r('Conviction').level), legConf(c.r('Analytical').level)),
  },
  {
    id: 'T2',
    fires: (c) => c.r('Empathy').level === 'high' && c.r('Analytical').level === 'high',
    conf: (c) => minConf(legConf(c.r('Empathy').level), legConf(c.r('Analytical').level)),
  },
  {
    id: 'T3',
    fires: (c) => c.intent.dominant.has('Creation') && c.leans('Bold↔Careful', 'Careful'),
    conf: (c) => minConf('determined', bipolarConf(c.r('Bold↔Careful'))),
  },
  {
    id: 'T4',
    fires: (c) => c.r('Aesthetic').level === 'high' && c.r('Conviction').level === 'high',
    conf: (c) => minConf(legConf(c.r('Aesthetic').level), legConf(c.r('Conviction').level)),
  },
  {
    id: 'Tn1',
    fires: (c) => c.leans('Deep↔Broad', 'Deep') && c.highCapacities.length >= 3,
    conf: (c) => minConf(bipolarConf(c.r('Deep↔Broad')), 'tentative'),
  },
  {
    id: 'Tn2',
    fires: (c) => c.r('Conviction').level === 'high' && c.leans('Insul↔Feedback', 'Feedback'),
    conf: (c) => minConf(legConf(c.r('Conviction').level), bipolarConf(c.r('Insul↔Feedback'))),
  },
  {
    id: 'Tn3',
    fires: (c) =>
      c.intent.valence.get('Creation') === 'approach' && c.intent.valence.get('Security') === 'avoidance',
    conf: () => 'tentative',
  },
  {
    id: 'Tn4',
    fires: (c) => c.intent.dominant.has('Autonomy') && c.leans('With↔Alone', 'With'),
    conf: (c) => minConf('tentative', bipolarConf(c.r('With↔Alone'))),
  },
  {
    id: 'Ch1',
    fires: (c) => c.leans('With↔Alone', 'With') && c.r('Narrative').present,
    conf: (c) => minConf(bipolarConf(c.r('With↔Alone')), legConf(c.r('Narrative').level)),
  },
  {
    id: 'Ch2',
    fires: (c) => c.leans('Experiment↔Study', 'Experiment') && c.r('Making').present,
    conf: (c) => minConf(bipolarConf(c.r('Experiment↔Study')), legConf(c.r('Making').level)),
  },
];

/** Which canonical slots a rule can fill, parsed from the seed report_slot. */
function canonicalSlots(reportSlot: string): string[] {
  const s = reportSlot.toLowerCase();
  const slots: string[] = [];
  if (s.includes('headline')) slots.push('headline');
  if (s.includes('why')) slots.push('why_aligns');
  if (s.includes('hard')) slots.push('whats_hard');
  if (s.includes('how')) slots.push('how_you_work');
  return slots.length ? slots : ['why_aligns'];
}

export interface MoleculeStageInput {
  master: MasterData;
  scores: ScoreT[];
  intent: IntentProfile;
}

/** Stage 3 — evaluate, confidence-tag, then curate top-N per slot. */
export function fireMolecules({ master, scores, intent }: MoleculeStageInput): MoleculeFiredT[] {
  const r = readerFor(scores);
  const leans = (id: string, pole: string): boolean => r(id).edge === pole;
  const highCapacities = scores.filter((s) => s.family === 'capacity' && s.demonstratedValue >= 60).map((s) => s.constructId);
  const ctx: Ctx = { r, leans, highCapacities, intent };
  const ruleMeta = new Map(master.molecules.map((m) => [m.id, m]));

  // 1 · candidate set + confidence
  const candidates: MoleculeFiredT[] = [];
  for (const def of RULES) {
    const meta = ruleMeta.get(def.id);
    if (!meta) continue;
    if (!def.fires(ctx)) continue;
    const confidence = def.conf(ctx);
    const slots = canonicalSlots(meta.reportSlot);
    const priority = meta.priority ?? 1;
    candidates.push({
      moleculeRuleId: def.id,
      type: meta.type,
      fired: true,
      curatedIn: false,
      confidenceTier: confidence,
      reportSlot: slots[0] ?? 'why_aligns',
      renderedText: meta.renderTemplate,
      priority,
      signal: priority * CONFIDENCE_WEIGHT[confidence],
    });
  }

  // 2 · sibling exclusivity (T1 earned XOR gut-led handled by trigger; S1/S4 are
  //     mutually exclusive by construction — a construct can't be both high&low).

  // 3 · curation — rank by priority × confidence-weight, take top-N per slot.
  const bySlotCap = { ...TOP_N_PER_SLOT };
  const curated = new Set<string>();

  // headline first: the single top temper/convergence
  const headlineCands = candidates
    .filter((c) => canonicalSlots(ruleMeta.get(c.moleculeRuleId)!.reportSlot).includes('headline'))
    .sort((a, b) => b.signal - a.signal);
  const headline = headlineCands[0];
  if (headline) {
    headline.curatedIn = true;
    headline.reportSlot = 'headline';
    curated.add(headline.moleculeRuleId);
  }

  const fillSlot = (slot: 'why_aligns' | 'whats_hard' | 'how_you_work'): void => {
    const cands = candidates
      .filter((c) => !curated.has(c.moleculeRuleId))
      .filter((c) => canonicalSlots(ruleMeta.get(c.moleculeRuleId)!.reportSlot).includes(slot))
      .sort((a, b) => b.signal - a.signal)
      .slice(0, bySlotCap[slot]);
    for (const c of cands) {
      c.curatedIn = true;
      c.reportSlot = slot;
      curated.add(c.moleculeRuleId);
    }
  };
  fillSlot('why_aligns');
  fillSlot('whats_hard');
  fillSlot('how_you_work');

  return candidates;
}
