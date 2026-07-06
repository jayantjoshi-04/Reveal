/**
 * Deterministic rules for the non-capacity findings: values, roles, capability
 * gaps, market tension, direction check, and the project pattern.
 * Each is arithmetic or a threshold test on raw_capture (Analysis template §2).
 */
import { CAPABILITIES, type Capability, type Capacity } from '@reveal/shared';
import type { Findings, RawCapture, ScoringConstants } from '@reveal/shared';
import { centroid, clamp01, distance, round, type Vec2 } from './util.js';

// ── Values ─────────────────────────────────────────────────────────────────
export function scoreValues(raw: RawCapture): Findings['values'] {
  const a3 = raw.channel_a.a3_values;
  if (!a3) return [];
  const core = new Set(
    (raw.channel_b.b1_budget?.revealed_rank ?? []).filter((r) => r.tier === 'core').map((r) => r.value),
  );
  return a3.ranked.map((name, i) => ({ name, rank: i + 1, protected: core.has(name) }));
}

// ── Roles ──────────────────────────────────────────────────────────────────
export function scoreRoles(raw: RawCapture): Findings['roles'] {
  const projects = raw.portfolio.projects ?? [];
  const direct = new Set(raw.channel_a.a2_roles?.direct_pick ?? []);
  const counts = new Map<string, number>();
  for (const p of projects) for (const r of p.roles ?? []) counts.set(r, (counts.get(r) ?? 0) + 1);

  const nProjects = Math.max(1, projects.length);
  const roles = [...counts.entries()].map(([name, count]) => {
    // project-tag frequency (w 1.0) + direct pick bonus (w 0.5), normalised
    const freq = clamp01(count / nProjects + (direct.has(name as never) ? 0.5 : 0) / 2);
    return { name, frequency: round(freq), tier: (count >= 3 ? 'demonstrated' : 'emerging') as 'demonstrated' | 'emerging' };
  });
  return roles.sort((a, b) => b.frequency - a.frequency);
}

// ── Capability gaps ────────────────────────────────────────────────────────
/** current-demonstrated for a capability = share of projects that evidence it. */
function demonstratedCapability(raw: RawCapture, cap: Capability): number {
  const projects = raw.portfolio.projects ?? [];
  if (projects.length === 0) return 0;
  const n = projects.filter((p) => (p.demonstrated_capabilities ?? []).includes(cap)).length;
  return clamp01(n / projects.length);
}

/** Capabilities whose natural home is impact / human-centred work — a strong
 *  B5 wish-pull toward impact counts as revealed pull for these. */
const IMPACT_CAPABILITIES = new Set<Capability>([
  'field_research',
  'design_research',
  'systems_service',
  'facilitation',
]);

export function scoreGaps(raw: RawCapture, k: ScoringConstants, wishImp = 0): Findings['gap'] {
  const desiredMap = (raw.channel_a.a7_aspiration?.desired_levels ?? {}) as Partial<Record<Capability, number>>;
  const out: Findings['gap'] = [];

  for (const cap of CAPABILITIES) {
    const desired = clamp01(desiredMap[cap] ?? 0);
    const current = demonstratedCapability(raw, cap);
    const stated_gap = Math.max(0, desired - current);
    // Revealed pull: the portfolio already leans this way, OR the B5 wish-sort
    // pulls toward impact and this is an impact-native capability.
    const revealedPull = current >= k.B_POINTS_TOWARD || (IMPACT_CAPABILITIES.has(cap) && wishImp >= k.A_PRESENT);

    let classification: 'real' | 'performed' | 'latent' | null = null;
    if (stated_gap >= k.GAP_MEANINGFUL) classification = revealedPull ? 'real' : 'performed';
    else if (stated_gap <= k.A_ABSENT && current >= k.B5_BAND_LARGE) classification = 'latent';

    if (classification) {
      out.push({
        capability: cap,
        current: round(current),
        desired: round(desired),
        stated_gap: round(stated_gap),
        classification,
        kind: 'capability', // gaps are always measured on learnable capabilities
      });
    }
  }
  return out.sort((a, b) => b.stated_gap - a.stated_gap);
}

// ── Market tension (B5 pays-best pass + A7 perceived market) ────────────────
function passCentroid(pass: { imp: number; hum: number }[] | undefined, given: Vec2 | undefined): Vec2 {
  if (given) return given;
  return centroid((pass ?? []).map((p) => ({ imp: p.imp, hum: p.hum })));
}

function dirLabel(c: Vec2): string {
  if (c.imp > 0.15) return 'impact';
  if (c.imp < -0.15) return 'commercial';
  return 'mixed';
}

/** The impact-axis value of the wish centroid (used to detect revealed pull). */
export function wishImp(raw: RawCapture): number {
  const b5 = raw.channel_b.b5_wishsort;
  return passCentroid(b5?.wish, b5?.centroid_wish).imp;
}

export function scoreMarket(raw: RawCapture, k: ScoringConstants): Findings['market'] {
  const b5 = raw.channel_b.b5_wishsort;
  const wish = passCentroid(b5?.wish, b5?.centroid_wish);
  const actual = passCentroid(b5?.actual, b5?.centroid_actual);
  const pays = passCentroid(b5?.pays_best, b5?.centroid_lucrative);

  const market_gap = round(distance(wish, pays));
  let classification: 'aligned' | 'drifting_to_market' | 'holding_to_pull';
  if (market_gap <= k.B5_BAND_SMALL) classification = 'aligned';
  else classification = distance(actual, wish) <= distance(actual, pays) ? 'holding_to_pull' : 'drifting_to_market';

  return {
    wish_dir: dirLabel(wish),
    actual_dir: dirLabel(actual),
    pays_dir: dirLabel(pays),
    market_gap,
    classification,
  };
}

// ── Direction check (does the student's wiring support their direction?) ────
const DIRECTION_REQUIRES: Record<string, Capacity[]> = {
  impact: ['empathy', 'conviction', 'systems_sensing'],
  commercial: ['aesthetic', 'analytical'],
  mixed: ['empathy', 'analytical'],
};

export function directionCheck(
  direction: string,
  capacityDemonstrated: Map<Capacity, number>,
): Findings['direction_check'] {
  const required = DIRECTION_REQUIRES[direction] ?? DIRECTION_REQUIRES.mixed!;
  const capacity_gaps = required.filter((c) => (capacityDemonstrated.get(c) ?? 0) < 50);
  return {
    requires_capacities: required,
    all_present: capacity_gaps.length === 0,
    direction_blocked: capacity_gaps.length > 0,
    capacity_gaps,
  };
}

// ── Project pattern (publish ≠ do) ──────────────────────────────────────────
export function projectPattern(raw: RawCapture): Findings['project_pattern'] {
  const projects = raw.portfolio.projects ?? [];
  const lead_impact = projects
    .filter((p) => (p.commercial_impact_self_tag ?? 0) > 0)
    .map((p) => p.title);
  const commercial = projects.filter((p) => (p.commercial_impact_self_tag ?? 0) < 0);
  const outlier = lead_impact.length > commercial.length && commercial[0] ? commercial[0].title : null;

  const hasCommunity = projects.some((p) =>
    /community|children|child/i.test(`${p.domain ?? ''} ${p.title}`),
  );
  const gap_note = !hasCommunity && projects.length > 0 ? 'no community/children project' : null;

  return { lead_impact, outlier, gap_note };
}
