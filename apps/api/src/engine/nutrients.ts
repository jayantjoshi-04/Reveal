/**
 * REVEAL · Layer 2 · Nutrients & bands (pure, deterministic)
 * ---------------------------------------------------------------------------
 * What conditions the work needs to give you. Six nutrients, each read on two
 * channels and sorted into a band. Source (Analysis_Report_Templates_v4 · §2):
 *   stated_need     ← B9 scenario Q2 bundle dosages
 *   revealed_present← condition_tags of went_well portfolio projects
 *   hindrance       ← struggled_project tags (neg pole) or B8 abandon (Structure)
 *   band            ← the deterministic rule below
 * HARD RULE: Unsupportive requires hindrance evidence — never avoidance.
 */
import {
  CONDITION_TAG_TO_NUTRIENT,
  NUTRIENTS,
  NUTRIENT_LABEL,
  SCENARIOS,
  type Findings,
  type Nutrient,
  type NutrientLevel,
  type RawCapture,
} from '@reveal/shared';

type NutrientFinding = NonNullable<Findings['nutrients']>[number];

const LEVEL_VALUE: Record<NutrientLevel, number> = { low: 0, moderate: 0.5, high: 1 };
// Frozen dosage cut-points (Analysis template §1).
function dosage(avg: number): NutrientLevel {
  return avg <= 0.35 ? 'low' : avg <= 0.65 ? 'moderate' : 'high';
}

export function scoreNutrients(raw: RawCapture): { nutrients: NutrientFinding[]; environment_surprise: Findings['environment_surprise'] } {
  // 1 · stated_need — average dosage across the Q2 variants the student chose.
  const sNum: Partial<Record<Nutrient, number>> = {};
  const sCount: Partial<Record<Nutrient, number>> = {};
  for (const s of raw.channel_b.b9_scenarios?.scenarios ?? []) {
    const def = SCENARIOS.find((x) => x.id === s.scenario_id);
    const variant = def?.q2[s.q2_choice];
    if (!variant) continue;
    for (const b of variant.bundle) {
      sNum[b.nutrient] = (sNum[b.nutrient] ?? 0) + LEVEL_VALUE[b.level];
      sCount[b.nutrient] = (sCount[b.nutrient] ?? 0) + 1;
    }
  }

  // 2 · revealed_present — share of went_well projects carrying the positive pole.
  const wentWell = (raw.portfolio.projects ?? []).filter((p) => p.went_well && (p.condition_tags?.length ?? 0) > 0);
  const revealedShare = (nut: Nutrient): number | null => {
    if (wentWell.length < 2) return null; // revealed_present floor → forces undetermined
    let pos = 0;
    for (const p of wentWell) {
      const carries = (p.condition_tags ?? []).some((tg) => {
        const m = CONDITION_TAG_TO_NUTRIENT[tg];
        return m.nutrient === nut && m.positive;
      });
      if (carries) pos++;
    }
    return pos / wentWell.length;
  };

  // 3 · hindrance_evidence — struggled-project negative tag, or B8 abandon (Structure only).
  const struggled = raw.portfolio.struggled_project;
  const b8Abandon = (raw.channel_b.b8_disruption?.disruptions ?? []).some((d) => d.response === 'abandon');
  const hindranceFor = (nut: Nutrient): boolean => {
    if (struggled?.present) {
      const neg = (struggled.condition_tags ?? []).some((tg) => {
        const m = CONDITION_TAG_TO_NUTRIENT[tg];
        return m.nutrient === nut && !m.positive;
      });
      if (neg) return true;
    }
    return nut === 'structure' && b8Abandon;
  };

  const nutrients: NutrientFinding[] = NUTRIENTS.map((nut) => {
    const stated_need: NutrientLevel = sCount[nut] ? dosage(sNum[nut]! / sCount[nut]!) : 'moderate';
    const share = revealedShare(nut);
    const revealed_present = share === null ? null : dosage(share);
    const hindrance_evidence = hindranceFor(nut);
    const required_by_direction = false; // no validated nutrient↔direction mapping yet — conservative

    const band = bandOf(stated_need, revealed_present, hindrance_evidence, required_by_direction);
    return { nutrient: nut, stated_need, revealed_present, band, hindrance_evidence, required_by_direction };
  });

  // 4 · Environment surprise — best work happened in a condition you say you don't need.
  const surp = nutrients.find((n) => n.stated_need === 'low' && n.revealed_present === 'high');
  const environment_surprise = surp
    ? { nutrient: NUTRIENT_LABEL[surp.nutrient as Nutrient] ?? surp.nutrient, stated_need: 'low', revealed_present: 'high' }
    : null;

  return { nutrients, environment_surprise };
}

/** The band rule — the one place Unsupportive can be produced, and only with hindrance evidence. */
function bandOf(
  stated: NutrientLevel,
  revealed: NutrientLevel | null,
  hindrance: boolean,
  required: boolean,
): NutrientFinding['band'] {
  if (revealed === null) {
    // No revealed side: only a direction-driven stretch is defensible; else undetermined.
    if (stated === 'low' && required) return 'stretch';
    return 'undetermined';
  }
  if (stated === 'high' && revealed === 'high') return 'preferred';
  if (stated === 'low' && (revealed === 'high' || required)) return 'stretch';
  if (stated === 'low' && hindrance && !required) return 'unsupportive';
  return 'undetermined';
}
