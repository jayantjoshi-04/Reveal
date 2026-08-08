/**
 * Stage 6 · Growth-selection.
 *
 * Each vehicle carries an authored selection_predicate string. We evaluate it
 * deterministically with a tiny boolean parser over the atoms the seed uses
 * (cap/capab/gap/disp/readiness/direction_rewards/portfolio_has/env_history).
 * Ranking inverts proximity: relevance × gap_size × closeability weights the
 * CLOSEABLE gaps (the actionable moves), not the hard-to-close ones.
 */
import { SCORING } from '@reveal/shared/v2';
import type { DirectionT, GrowthRow, GrowthSelectionT, MasterData, RawCapture, ReadinessT, ScoreT } from './types.js';
import { readerFor } from './helpers.js';

interface GEnv {
  r: ReturnType<typeof readerFor>;
  scores: ScoreT[];
  readiness: Map<string, ReadinessT>;
  topDirection?: DirectionT;
  rewardsMap: Map<string, number>; // constructId → |required| under top direction
  portfolioTags: Set<string>;
  gapOf: (id: string) => number;
}

/** Evaluate one atomic predicate to a boolean. Unknown atoms → false. */
function evalAtom(atom: string, e: GEnv): boolean {
  atom = atom.trim();
  let m: RegExpMatchArray | null;

  if ((m = atom.match(/^cap\(([^)]+)\)\s*>=\s*(high|mid)$/))) {
    const v = e.r((m![1] ?? '')).demonstrated;
    return (m![2] ?? '') === 'high' ? v >= 60 : v >= 40;
  }
  if ((m = atom.match(/^cap\(([^)]+)\)\s*<\s*mid$/))) return e.r((m![1] ?? '')).demonstrated < 40;
  if ((m = atom.match(/^cap\(([^)]+)\)\s+latent/))) {
    const s = e.scores.find((x) => x.constructId === (m![1] ?? ''));
    return !!s && s.sayDoGapClass === 'real';
  }
  if ((m = atom.match(/^capab\(([^)]+)\)\s*>=\s*evidenced$/))) return e.r((m![1] ?? '')).value >= 50;
  if ((m = atom.match(/^capab\(([^)]+)\)\s*<\s*evidenced$/))) return e.r((m![1] ?? '')).value < 50;
  if ((m = atom.match(/^gap\(([^)]+)\)\s*>\s*0$/))) return e.gapOf((m![1] ?? '')) > 0;
  if ((m = atom.match(/^disp\(([^)]+)\)\s+toward\s+(\w+)$/))) return e.r((m![1] ?? '')).edge === (m![2] ?? '');
  if ((m = atom.match(/^readiness\(([^)]+)\)\s*<\s*strong$/))) return e.readiness.get((m![1] ?? ''))?.tier !== 'strong';
  if ((m = atom.match(/^readiness\(([^)]+)\)\s*=\s*(\w+)$/))) return e.readiness.get((m![1] ?? ''))?.tier === (m![2] ?? '');
  if ((m = atom.match(/^direction_rewards\(([^)]+)\)$/))) return (e.rewardsMap.get((m![1] ?? '')) ?? 0) >= 40;
  if ((m = atom.match(/^portfolio_has\(([^)]+)\)$/))) return e.portfolioTags.has((m![1] ?? '').trim());
  if (atom === 'top_direction.domain') return !!e.topDirection;
  if (atom === 'top_direction.track=digital') return e.topDirection ? isDigitalTop(e) : false;
  if (atom.startsWith('env_history')) return false; // env history not instrumented in this cut
  return false;
}

function isDigitalTop(e: GEnv): boolean {
  return !!e.topDirection && e.topDirection.roleId.length > 0 && e.topDirection.domainName.length > 0 && false;
}

/** Minimal boolean evaluator: parentheses, NOT, AND, OR over evalAtom. */
function evalPredicate(expr: string, e: GEnv): boolean {
  const tokens = tokenize(expr);
  let pos = 0;
  const peek = (): string | undefined => tokens[pos];
  const next = (): string | undefined => tokens[pos++];

  function parseOr(): boolean {
    let v = parseAnd();
    while (peek() === 'OR') {
      next();
      const rhs = parseAnd();
      v = v || rhs;
    }
    return v;
  }
  function parseAnd(): boolean {
    let v = parseUnary();
    while (peek() === 'AND') {
      next();
      const rhs = parseUnary();
      v = v && rhs;
    }
    return v;
  }
  function parseUnary(): boolean {
    if (peek() === 'NOT') {
      next();
      return !parseUnary();
    }
    if (peek() === '(') {
      next();
      const v = parseOr();
      if (peek() === ')') next();
      return v;
    }
    return evalAtom(next() ?? '', e);
  }
  return parseOr();
}

function tokenize(expr: string): string[] {
  const out: string[] = [];
  let i = 0;
  let buf = '';
  const flush = (): void => {
    if (buf.trim()) out.push(buf.trim());
    buf = '';
  };
  while (i < expr.length) {
    const ch = expr[i];
    // A '(' at the start of a term is a GROUPING paren; a '(' right after an
    // identifier (e.g. "cap(") is a function-call paren belonging to an atom —
    // consume the whole balanced group into the current atom token.
    if (ch === '(') {
      if (buf === '' || buf.endsWith(' ')) {
        flush();
        out.push('(');
        i++;
        continue;
      }
      let d = 0;
      let j = i;
      for (; j < expr.length; j++) {
        if (expr[j] === '(') d++;
        else if (expr[j] === ')') {
          d--;
          if (d === 0) {
            j++;
            break;
          }
        }
      }
      buf += expr.slice(i, j);
      i = j;
      continue;
    }
    if (ch === ')') {
      // atom parens were consumed above, so any ')' here closes a group
      flush();
      out.push(')');
      i++;
      continue;
    }
    if (expr.startsWith(' AND ', i)) {
      flush();
      out.push('AND');
      i += 5;
      continue;
    }
    if (expr.startsWith(' OR ', i)) {
      flush();
      out.push('OR');
      i += 4;
      continue;
    }
    if (expr.startsWith('NOT ', i) && !buf.trim()) {
      out.push('NOT');
      i += 4;
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

const closeabilityWeight = (c: string | null): number => (c === 'high' ? 1 : c === 'medium' ? 0.6 : c === 'low' ? 0.3 : 0.6);

/** @internal — exposed for tests/debugging of the predicate parser. */
export const __predicate = { tokenize, evalPredicate, evalAtom };

export interface GrowthStageInput {
  master: MasterData;
  scores: ScoreT[];
  readiness: ReadinessT[];
  directions: DirectionT[];
  raw: RawCapture;
  tier: 'free' | 'paid';
}

export function selectGrowth({ master, scores, readiness, directions, raw, tier }: GrowthStageInput): GrowthSelectionT[] {
  const r = readerFor(scores);
  const readinessMap = new Map(readiness.map((x) => [x.dimension, x]));
  const top = directions.find((d) => d.rank === 1);

  // What the top direction rewards: |required_level| per construct.
  const rewardsMap = new Map<string, number>();
  if (top) {
    for (const p of master.profiles) {
      if (p.targetId === top.roleId || p.targetId === top.domainId) {
        rewardsMap.set(p.constructId, Math.max(rewardsMap.get(p.constructId) ?? 0, Math.abs(p.requiredLevel)));
      }
    }
  }
  const portfolioTags = new Set<string>((raw.portfolio ?? []).flatMap((a) => Object.keys(a.evidenceMap)));

  const gapOf = (id: string): number => {
    const student = r(id).value;
    const required = rewardsMap.get(id) ?? 60; // default target when no direction context
    return Math.max(0, required - student);
  };

  const e: GEnv = { r, scores, readiness: readinessMap, topDirection: top, rewardsMap, portfolioTags, gapOf };

  const fired: (GrowthSelectionT & { score: number })[] = [];
  for (const v of master.growth as GrowthRow[]) {
    let ok = false;
    try {
      ok = evalPredicate(v.selectionPredicate, e);
    } catch {
      ok = false;
    }
    if (!ok) continue;
    // gap_size = the largest gap among the constructs this vehicle closes (its
    // reason for existing), not merely the first-listed target.
    const targets = v.targetConstructs?.length ? v.targetConstructs : [''];
    const gapConstruct = targets.reduce((best, c) => (gapOf(c) > gapOf(best) ? c : best), targets[0] ?? '');
    const gapSize = Math.max(1, gapOf(gapConstruct));
    const relevance = 1 + (rewardsMap.get(gapConstruct) ?? 0) / 100;
    const score = relevance * gapSize * closeabilityWeight(v.closeability);
    fired.push({
      growthVehicleId: v.id,
      title: v.title,
      type: v.type,
      gapTag: v.closesGapType,
      rank: 0,
      renderedText: v.renderTemplate,
      directionRef: top ? `${top.roleId}×${top.domainId}` : null,
      score,
    });
  }
  fired.sort((a, b) => b.score - a.score);
  const cap = SCORING.growthCaps[tier];
  return fired.slice(0, cap).map((g, i) => ({
    growthVehicleId: g.growthVehicleId,
    title: g.title,
    type: g.type,
    gapTag: g.gapTag,
    rank: i + 1,
    renderedText: g.renderedText,
    directionRef: g.directionRef,
  }));
}
