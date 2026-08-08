/**
 * Stage 4 · Proximity (directions) · Stage 5 · Readiness · Stage 7 · Findings.
 */
import type { CoherenceBand } from '@reveal/shared/v2';
import { FAMILY_WEIGHTS, SCORING } from '@reveal/shared/v2';
import type {
  DirectionT,
  FindingT,
  MasterData,
  RawCapture,
  ReadinessT,
  ScoreT,
} from './types.js';
import { clamp, mean, readerFor } from './helpers.js';

const AMOUNT_FAMILIES = new Set(['capacity', 'capability']);

/** Stage 4 — weighted asymmetric Manhattan fit over role × domain. */
export function proximity(master: MasterData, scores: ScoreT[], raw: RawCapture): DirectionT[] {
  const scoreById = new Map(scores.map((s) => [s.constructId, s]));
  const familyOf = new Map(master.constructs.map((c) => [c.id, c.family]));

  const profilesByTarget = new Map<string, typeof master.profiles>();
  for (const p of master.profiles) {
    const arr = profilesByTarget.get(p.targetId) ?? [];
    arr.push(p);
    profilesByTarget.set(p.targetId, arr);
  }

  const fit = (targetId: string): number => {
    const profiles = profilesByTarget.get(targetId) ?? [];
    if (!profiles.length) return 0;
    let wsum = 0;
    let pen = 0;
    for (const p of profiles) {
      const fam = familyOf.get(p.constructId);
      if (!fam || fam === 'readiness') continue;
      const fw = (FAMILY_WEIGHTS as Record<string, number>)[fam] ?? 0.1;
      const w = fw * (p.isCritical ? 1.5 : 1);
      const sc = scoreById.get(p.constructId);
      // capacities score on the demonstrated (do) read; everything else on blend
      const student = (AMOUNT_FAMILIES.has(fam) ? sc?.demonstratedValue : sc?.blendedValue) ?? 0;
      let penalty: number;
      if (AMOUNT_FAMILIES.has(fam)) penalty = Math.max(0, p.requiredLevel - student); // shortfall only
      else penalty = Math.min(100, Math.abs(student - p.requiredLevel)); // match-type
      wsum += w;
      pen += w * penalty;
    }
    if (wsum === 0) return 0;
    return clamp(1 - pen / (wsum * 100), 0, 1);
  };

  const roleFit = new Map(master.roles.map((r) => [r.id, fit(r.id)]));
  const domainFit = new Map(master.domains.map((d) => [d.id, fit(d.id)]));

  const raw2: DirectionT[] = [];
  for (const role of master.roles) {
    for (const domain of master.domains) {
      if (role.track !== domain.track) continue; // fit within track
      const rf = roleFit.get(role.id) ?? 0;
      const df = domainFit.get(domain.id) ?? 0;
      const prox = SCORING.roleDomainSplit.role * rf + SCORING.roleDomainSplit.domain * df;
      raw2.push({
        roleId: role.id,
        domainId: domain.id,
        roleName: role.name,
        domainName: domain.name,
        roleFit: Math.round(rf * 100) / 100,
        domainFit: Math.round(df * 100) / 100,
        proximityScore: Math.round(prox * 100) / 100,
        rank: 0,
        aptitudeLevel: rf >= SCORING.aptitudeHighFit ? 'high' : 'low',
        interestLevel: 'low',
        quadrant: '',
        valuesConflictFlag: valuesConflict(master, scores, role.id, domain.id),
        isChosen: false,
        unlocked: false,
      });
    }
  }
  raw2.sort((a, b) => b.proximityScore - a.proximityScore);
  const thirdCut = raw2[Math.floor(raw2.length / 3)]?.proximityScore ?? 0;
  raw2.forEach((d, i) => {
    d.rank = i + 1;
    d.interestLevel = d.proximityScore >= thirdCut ? 'high' : 'low';
    d.quadrant = `${d.aptitudeLevel}-apt / ${d.interestLevel}-int`;
    if (raw.chosenDirection && d.roleId === raw.chosenDirection.roleId && d.domainId === raw.chosenDirection.domainId)
      d.isChosen = true;
  });
  return raw2;
}

function valuesConflict(master: MasterData, scores: ScoreT[], roleId: string, domainId: string): boolean {
  const valueConstructs = new Set(master.constructs.filter((c) => c.family === 'value').map((c) => c.id));
  const req = new Map<string, number>();
  for (const p of master.profiles) {
    if ((p.targetId === roleId || p.targetId === domainId) && valueConstructs.has(p.constructId)) req.set(p.constructId, p.requiredLevel);
  }
  for (const s of scores) {
    if (!valueConstructs.has(s.constructId)) continue;
    const r = req.get(s.constructId);
    if (r == null) continue;
    if (Math.abs(s.blendedValue) >= 40 && Math.abs(r) >= 40 && Math.sign(s.blendedValue) !== Math.sign(r)) return true;
  }
  return false;
}

// ── Stage 5 · Readiness ─────────────────────────────────────────────────────
const tierOf = (score: number): ReadinessT['tier'] =>
  score < SCORING.readinessTiers.emergingBelow ? 'emerging' : score > SCORING.readinessTiers.strongAbove ? 'strong' : 'developing';

export function readiness(master: MasterData, scores: ScoreT[], raw: RawCapture, topDirection?: DirectionT): ReadinessT[] {
  const r = readerFor(scores);
  const capacityScores = scores.filter((s) => s.family === 'capacity');
  const capabilityScores = scores.filter((s) => s.family === 'capability');

  // capacity — confidence-weighted mean of the direction-relevant capacities
  // (demonstrated reads). Falls back to all capacities when no direction context.
  const relevant = topDirection
    ? new Set(master.profiles.filter((p) => p.targetId === topDirection.roleId || p.targetId === topDirection.domainId).map((p) => p.constructId))
    : null;
  const relevantCaps = capacityScores.filter((s) => !relevant || relevant.has(s.constructId));
  const capPool = relevantCaps.length ? relevantCaps : capacityScores;
  const capWeight = (s: ScoreT): number =>
    s.confidenceTier === 'evidenced' ? 1 : s.confidenceTier === 'well_motivated' || s.confidenceTier === 'behavioural_not_neural' ? 0.75 : s.confidenceTier === 'plausible' ? 0.5 : 0.3;
  const capW = capPool.reduce((a, s) => a + capWeight(s), 0);
  const capacity = capW ? capPool.reduce((a, s) => a + s.demonstratedValue * capWeight(s), 0) / capW : 0;

  // capability — mean of demonstrated capability reads (the evidence rubric).
  const capability = capabilityScores.length ? mean(capabilityScores.map((s) => s.blendedValue)) : 0;

  // portfolio — mean evidence strength across uploaded artifacts
  const portfolioStrength = raw.portfolio?.length
    ? mean(raw.portfolio.flatMap((a) => Object.values(a.evidenceMap))) * 100
    : 0;

  // experience/exposure — Σ(min(reps,5) × variety × realism), normalized
  const expRaw = (raw.experience ?? []).reduce(
    (a, e) => a + Math.min(e.reps, 5) * Math.max(1, e.contextVariety) * (e.realVsSimulated === 'real' ? 1 : 0.5),
    0,
  );
  const experience_exposure = clamp((expRaw / 40) * 100, 0, 100); // 40 ≈ a full, varied slate

  // professional — presence of factual-inventory facts
  const facts = raw.factual ? Object.values(raw.factual).filter(Boolean).length : 0;
  const professional = clamp((facts / 6) * 100, 0, 100);

  const dims: [ReadinessT['dimension'], number][] = [
    ['capacity', capacity],
    ['capability', capability],
    ['portfolio', portfolioStrength],
    ['experience_exposure', experience_exposure],
    ['professional', professional],
  ];
  return dims.map(([dimension, score]) => ({ dimension, score: Math.round(score), tier: tierOf(score) }));
}

// ── Stage 7 · Findings ──────────────────────────────────────────────────────
export function findings(scores: ScoreT[]): { findings: FindingT[]; coherenceBand: CoherenceBand } {
  const out: FindingT[] = [];

  // coherence — profile-wide say/do agreement
  const paired = scores.filter((s) => s.sayValue !== null && s.doValue !== null);
  const meanGap = paired.length ? mean(paired.map((s) => Math.abs((s.doValue as number) - (s.sayValue as number)))) : 0;
  const band: CoherenceBand = meanGap < SCORING.coherence.coherentBelow ? 'coherent' : meanGap > SCORING.coherence.divergentAbove ? 'divergent' : 'mixed';
  out.push({
    kind: 'coherence',
    text:
      band === 'coherent'
        ? 'Mostly you say and do the same thing — a coherent read.'
        : band === 'divergent'
          ? 'What you say and what you do pull apart in several places.'
          : 'Mostly you say and do the same thing — the notable gap is where your work outruns your self-description.',
    confidenceTier: 'well_motivated',
  });

  // surprise — largest (do − say) ≥ 30 AND do ≥ 60, curated to one
  const surprises = paired
    .filter((s) => (s.doValue as number) - (s.sayValue as number) >= SCORING.surprise.minGap && (s.doValue as number) >= SCORING.surprise.minDo)
    .sort((a, b) => (b.doValue as number) - (b.sayValue as number) - ((a.doValue as number) - (a.sayValue as number)));
  const s = surprises[0];
  if (s) {
    out.push({
      kind: 'surprise',
      text: `${s.name} is a bigger part of your work than you say it is.`,
      confidenceTier: s.confidenceTier,
      meta: { constructId: s.constructId, say: s.sayValue, do: s.doValue },
    });
  }

  // gate observation — honest null when no closed-gate room observed
  const closedGate = scores.find((s) => s.gateFlag);
  out.push({
    kind: 'gate_observation',
    text: closedGate
      ? `A room seems to be closing a strength: ${closedGate.name}.`
      : 'No closed-gate room observed yet — you’ve been good at self-selecting rooms that suit you.',
    confidenceTier: 'plausible',
  });

  return { findings: out, coherenceBand: band };
}
