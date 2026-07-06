/**
 * Deterministic fallback phraser. Fills every report slot from the Findings
 * Object using templates that already respect the contract (no comparison,
 * surprise ends in a question, word ceilings). Used when SYNTHESIS_MODE=manual
 * or no API key is set — so the whole pipeline runs end-to-end offline, and it
 * doubles as the pilot's hand-analysis phrasing.
 */
import type { Findings, ReportSlots } from '@reveal/shared';
import { label } from './labels.js';

export function fallbackSlots(f: Findings): ReportSlots {
  const spike = label(f.differentiation.top_capacity);
  const second = label(f.differentiation.second);
  const dir = label(f.differentiation.direction);

  const topRoles = f.roles.slice(0, 2).map((r) => label(r.name));
  const protectedValues = f.values.filter((v) => v.protected).slice(0, 2).map((v) => label(v.name));
  const realGaps = f.gap.filter((g) => g.classification === 'real');

  const surprise = f.surprises[0];
  const surprisePhrasing = surprise
    ? `In ${surprise.situations} separate situations your choices leaned on ${label(
        surprise.trait,
      )} — yet you never claimed it. Strong in what you do, absent in what you say. Does that feel true?`
    : 'No surprises surfaced this time — your stated and revealed selves largely agree. Does that match how you see yourself?';

  const marketLine =
    f.market.classification === 'aligned'
      ? `The work you love and the work you think pays sit close together — little tension to manage right now.`
      : `Your wish leans ${label(f.market.wish_dir)} while you believe ${label(
          f.market.pays_dir,
        )} pays best. Right now you're ${f.market.classification === 'holding_to_pull' ? 'holding to your pull' : 'drifting toward the market'} — worth examining that belief, since "what pays" is a guess to test.`;

  const gapKindLine = f.direction_check.direction_blocked
    ? `Some of what your direction needs is a way of thinking, not a skill — so cultivate it slowly, team up with someone who has it, or reconsider the direction. Not a course.`
    : `Good news: nothing about how you think is in the way. Every gap you have is a learnable skill.`;

  const gapLine = realGaps.length
    ? `Your clearest gaps are ${realGaps.slice(0, 2).map((g) => label(g.capability)).join(' and ')} — real, and worth closing first.`
    : `No large, real skill gaps stand out yet — your reach and your evidence are close.`;

  const actionMenu = [
    realGaps[0] ? `Skills: build ${label(realGaps[0].capability)} first — short courses, workshops, and practice.` : '',
    `Internships: placements that fit your ${dir} direction and build the gap.`,
    f.market.classification !== 'aligned'
      ? `A both/and bridge: roles that pay better and still use your strengths in your direction may mean you don't have to choose.`
      : '',
    f.project_pattern.gap_note ? `Projects: take on ${f.project_pattern.gap_note} to fill the portfolio gap.` : '',
    `Re-frame: lead your portfolio with the work that matches who you are.`,
    `To verify: certifications, salaries, and employers are yours to research — not shown here as fact.`,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    differentiation_statement: `A ${spike}-led, ${second} designer whose work reaches for ${dir}.`,
    capacity_line: `${cap(spike)} is what you reach for first — your thickest network today. None of it is fixed; a smaller strength is simply room to grow.`,
    roles_line: topRoles.length
      ? `On project after project you become the ${topRoles.join(' and the ')} — drawn to understanding more than to building.`
      : `Your recurring roles are still taking shape across your work.`,
    values_line: protectedValues.length
      ? `Under a tight budget, what you protected was ${protectedValues.join(' and ')} — the truest sign of what you value.`
      : `What you protect under pressure is the truest read on your values.`,
    conditions_line: `You work best where the work has a purpose you believe in and a real person it helps; you lose energy when it's purely commercial or has to be perfect before you can begin.`,
    project_line: f.project_pattern.gap_note
      ? `The projects you led lean ${dir}${f.project_pattern.outlier ? `; ${f.project_pattern.outlier} is the outlier` : ''}. The gap: ${f.project_pattern.gap_note}.`
      : `Your project pattern is consistent across what you've led.`,
    surprise_phrasing: surprisePhrasing,
    gap_line: gapLine,
    market_line: marketLine,
    gap_kind_line: gapKindLine,
    experiment_text: realGaps[0]
      ? `Run one project that targets ${label(realGaps[0].capability)} — the gap your evidence most wants closed. Then run REVEAL again and watch it move.`
      : `Keep building in your direction, then re-run REVEAL to watch the picture move.`,
    action_menu: actionMenu,
  };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
