/**
 * Stage 8 · Report assembly — compile the derived layer into the L5 payload.
 *
 * Pure assembly: no new numbers, no prose that wasn't authored upstream.
 * Undetermined items route to open_questions, never the headline; outlier
 * stays null rather than being manufactured; entitlement is by tier.
 */
import type {
  ConfidenceLegendItem,
  DirectionOut,
  MoleculeLine,
  ReportPayloadV2,
} from '@reveal/shared/v2';
import type { EngineResult, MasterData, RawCapture } from './types.js';
import { driverRobustness, buildIntent } from './intent.js';

export interface AssemblyMeta {
  reportInstanceId: string;
  studentName: string;
  enrolledField: string | null;
  tier: 'free' | 'paid';
  instanceType: 'baseline' | 're_run';
  rulesetVersion: string;
  asOfDate: string;
  priorInstanceId: string | null;
}

const LEGEND: ConfidenceLegendItem[] = [
  { tier: 'evidenced', dot: '●', label: 'Evidenced', meaning: 'seen across 3+ situations, both channels agree' },
  { tier: 'well_motivated', dot: '◐', label: 'Well-motivated', meaning: 'strong signal, but on one channel or fewer situations' },
  { tier: 'plausible', dot: '○', label: 'Plausible', meaning: 'seen, but only a couple of times' },
  { tier: 'undetermined', dot: '·', label: 'Still open', meaning: 'not enough yet to say — a question, not a finding' },
];

const DOT: Record<string, ConfidenceLegendItem['dot']> = {
  evidenced: '●',
  well_motivated: '◐',
  behavioural_not_neural: '◐',
  plausible: '○',
  undetermined: '·',
};

export function assemblePayload(
  result: EngineResult,
  master: MasterData,
  raw: RawCapture,
  meta: AssemblyMeta,
): ReportPayloadV2 {
  const { scores, molecules, directions, readiness, growth, findings } = result;
  const isFirst = meta.priorInstanceId == null;
  const curated = molecules.filter((m) => m.curatedIn);
  const bySlot = (slot: string): MoleculeLine[] =>
    curated
      .filter((m) => m.reportSlot === slot)
      .map((m) => ({ molecule_id: m.moleculeRuleId, text: m.renderedText, tier: m.confidenceTier }));

  const headline = curated.find((m) => m.reportSlot === 'headline');

  // ── hero tiles: top-3 capacities, surprise flagged ──
  const surprise = findings.find((f) => f.kind === 'surprise');
  const surpriseCid = (surprise?.meta as { constructId?: string } | undefined)?.constructId;
  const capacityScores = scores.filter((s) => s.family === 'capacity').sort((a, b) => b.blendedValue - a.blendedValue);
  const tiles = capacityScores.slice(0, 3).map((s) => ({
    label: s.name + (s.constructId === surpriseCid ? ' ⚡' : ''),
    ring_value: Math.round(s.blendedValue),
    is_surprise: s.constructId === surpriseCid,
  }));

  // ── directions to show ──
  const enrolled = meta.enrolledField?.toLowerCase() ?? '';
  const enrolledMatch = enrolled
    ? directions.find((d) => enrolled.split(/[\s/]+/).some((t) => t.length > 3 && d.roleName.toLowerCase().includes(t)))
    : undefined;
  const shownIds = new Set<string>();
  const shown = [];
  for (const d of directions) {
    const key = `${d.roleId}×${d.domainId}`;
    const include = d.rank <= 2 || d.isChosen || (enrolledMatch && key === `${enrolledMatch.roleId}×${enrolledMatch.domainId}`);
    if (include && !shownIds.has(key)) {
      shownIds.add(key);
      const unlocked = meta.tier === 'paid' || d.rank <= 2 || d.isChosen;
      const out: DirectionOut = {
        rank: d.rank,
        role: d.roleName,
        domain: d.domainName,
        proximity_score: d.proximityScore,
        aptitude_level: d.aptitudeLevel,
        interest_level: d.interestLevel,
        quadrant: d.quadrant,
        values_conflict_flag: d.valuesConflictFlag,
        is_chosen: d.isChosen,
        unlocked,
        why_aligns: d.rank === 1 ? bySlot('why_aligns') : undefined,
        whats_hard: d.rank === 1 ? bySlot('whats_hard') : undefined,
      };
      if (enrolledMatch && key === `${enrolledMatch.roleId}×${enrolledMatch.domainId}` && d.rank > 2)
        out.note = 'your enrolled field — shown honestly, wherever it ranks';
      shown.push(out);
    }
  }
  shown.sort((a, b) => a.rank - b.rank);

  // ── capability gaps ──
  const top = directions.find((d) => d.rank === 1);
  const reqByConstruct = new Map<string, number>();
  if (top)
    for (const p of master.profiles)
      if (p.targetId === top.roleId || p.targetId === top.domainId)
        reqByConstruct.set(p.constructId, Math.max(reqByConstruct.get(p.constructId) ?? 0, p.requiredLevel));
  const capabilityGaps = scores
    .filter((s) => s.family === 'capability')
    .map((s) => {
      const desired = Math.max(reqByConstruct.get(s.constructId) ?? 70, Math.round(s.blendedValue));
      const current = Math.round(s.blendedValue);
      return { name: s.name, current, desired, gap: Math.max(0, desired - current) };
    })
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 4);

  // ── intent block ──
  const intent = buildIntent(master, raw);
  const intentDrivers = [...intent.present].slice(0, 3).map((driver) => ({
    driver,
    valence: (intent.valence.get(driver) ?? 'approach') as 'approach' | 'avoidance',
    robustness: driverRobustness(master, raw, driver),
  }));

  // ── open questions from undetermined constructs ──
  const openQuestions = scores
    .filter((s) => s.confidenceTier === 'undetermined')
    .slice(0, 4)
    .map((s) => ({ text: `We don't have enough yet on ${s.name}.`, related_construct: s.name, why_open: 'only seen once or not at all — needs more evidence.' }));

  const gate = findings.find((f) => f.kind === 'gate_observation');
  const coherence = findings.find((f) => f.kind === 'coherence');

  return {
    meta: {
      report_instance_id: meta.reportInstanceId,
      ruleset_version: meta.rulesetVersion,
      student_name: meta.studentName,
      enrolled_field: meta.enrolledField,
      tier: meta.tier,
      instance_type: meta.instanceType,
      as_of_date: meta.asOfDate,
      is_first_reading: isFirst,
      prior_instance_id: meta.priorInstanceId,
    },
    how_to_read: {
      opener_text: 'This is a reading of how you design — drawn from what you did, not a test you passed.',
      you_vs_you_note: 'Everything here is you compared with you, never a ranking against other students.',
      confidence_legend: LEGEND,
    },
    hero: {
      headline: headline?.renderedText ?? 'A reading of how you design.',
      headline_molecule_id: headline?.moleculeRuleId ?? null,
      signature_tiles: tiles,
      timestamp_copy: isFirst
        ? `As of today · ${meta.asOfDate} — your first reading. Re-run later to watch it move.`
        : `As of ${meta.asOfDate}.`,
    },
    section_today: {
      capacities: capacityScores.map((s) => ({
        construct_id: s.constructId,
        name: s.name,
        ring_value: Math.round(s.blendedValue),
        value_state: s.confidenceTier === 'evidenced' ? 'demonstrated' : 'likely',
        tier: s.confidenceTier,
        science_chip: '',
        evidence_tags: s.sourceActivities,
      })),
      conditions_card: {
        position_note: 'This sits high because it explains the others.',
        bands: scores
          .filter((s) => s.family === 'environment')
          .slice(0, 4)
          .map((s) => ({
            state: s.confidenceTier === 'undetermined' ? 'undetermined' : s.blendedValue >= 0 ? 'opens' : 'closes',
            room_descriptor: `${s.positionEdge ?? ''} rooms`,
            text: `Your work reads differently in ${s.positionEdge ?? 'certain'} rooms.`,
          })),
        framing_note: 'This is about the room, not about you — and rooms change.',
      },
      dispositions: scores
        .filter((s) => s.family === 'disposition')
        .map((s) => {
          const c = master.constructs.find((x) => x.id === s.constructId);
          return {
            construct_id: s.constructId,
            edge_low: c?.edgeLow ?? '',
            edge_high: c?.edgeHigh ?? '',
            pin_value: Math.round(s.blendedValue),
            resolvedness: s.resolvedness ?? 'resolved',
            tier: s.confidenceTier,
          };
        }),
      values: scores
        .filter((s) => s.family === 'value')
        .map((s) => {
          const c = master.constructs.find((x) => x.id === s.constructId);
          const lean = s.positionEdge ?? (s.blendedValue >= 0 ? c?.edgeHigh : c?.edgeLow) ?? '';
          const settled = s.resolvedness === 'resolved' ? 'settled' : s.resolvedness === 'leaning' ? 'leaning' : 'negotiating';
          return {
            axis_id: s.constructId,
            lean_edge: lean,
            render_text: `When ${c?.edgeLow} and ${c?.edgeHigh} pull against each other, you lean ${lean} — and you're ${settled} about it.`,
            resolvedness: s.resolvedness ?? 'resolved',
          };
        }),
      intent: { drivers: intentDrivers },
      roles: [...directions]
        .sort((a, b) => b.roleFit - a.roleFit)
        .reduce<{ role: string; evidence_count: number }[]>((acc, d) => {
          if (!acc.find((x) => x.role === d.roleName)) acc.push({ role: d.roleName, evidence_count: Math.round(d.roleFit * 5) });
          return acc;
        }, [])
        .slice(0, 3),
      how_you_work: bySlot('how_you_work'),
      causal_spread: [],
      causal_spread_closing_line: '',
    },
    mode_switch: { text: 'From here on — not where you are, where you’re heading.' },
    section_heading: {
      directions: shown,
      readiness: readiness.map((r) => ({ dimension: r.dimension, tier: r.tier, score: r.score })),
      capability_gaps: capabilityGaps,
      growth: growth.map((g) => ({
        vehicle_id: g.growthVehicleId,
        title: g.title,
        type: g.type,
        render_text: g.renderedText,
        direction_ref: g.directionRef,
      })),
    },
    surprises: surprise
      ? [
          {
            construct_id: surpriseCid ?? '',
            text: surprise.text,
            confirm_question: 'Does that land — is this something you lean on more than you’d claim?',
            tier: surprise.confidenceTier,
          },
        ]
      : [],
    findings: {
      coherence: { band: result.coherenceBand, text: coherence?.text ?? '' },
      gate_observation: gate ? { text: gate.text } : null,
      outlier: null,
    },
    open_questions: openQuestions,
    evidence_room: scores
      .filter((s) => s.evidenceCount > 0)
      .slice(0, 12)
      .map((s) => ({
        claim: `${s.name} — ${s.sayDoGapClass ?? 'observed'}`,
        channel: s.sayValue !== null && s.doValue !== null ? 'both' : s.doValue !== null ? 'do' : 'say',
        source_activities: s.sourceActivities,
        evidence_count: s.evidenceCount,
        tier: s.confidenceTier,
      })),
  };
}

export { DOT };
