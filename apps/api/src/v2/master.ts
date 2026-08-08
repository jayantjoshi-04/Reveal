/**
 * Load the Layer-2 master data into the engine's MasterData shape — from the
 * seeded database (production path) or from the raw seed JSONs (tests).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import type { Family } from '@reveal/shared/v2';
import type { MasterData } from './engine/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadMasterFromDb(prisma: PrismaClient): Promise<MasterData> {
  const [constructs, options, derivations, molecules, roles, domains, profiles, growth] = await Promise.all([
    prisma.construct.findMany(),
    prisma.activityOption.findMany(),
    prisma.derivationRule.findMany(),
    prisma.moleculeRule.findMany(),
    prisma.role.findMany(),
    prisma.domain.findMany(),
    prisma.requiredProfile.findMany(),
    prisma.growthVehicle.findMany(),
  ]);
  return {
    constructs: constructs.map((c) => ({
      id: c.id,
      family: c.family as Family,
      name: c.name,
      type: c.type,
      scale: c.scale,
      edgeLow: c.edgeLow,
      edgeHigh: c.edgeHigh,
      hardnessToClose: c.hardnessToClose,
    })),
    options: options.map((o) => ({
      id: o.id,
      activityId: o.activityId,
      rungOrStep: o.rungOrStep,
      label: o.label,
      mapsToConstructId: o.mapsToConstructId,
      channel: o.channel,
      edge: o.edge,
      driver: o.driver,
      valence: o.valence,
      axis: o.axis,
      magnitude: o.magnitude,
      isEscape: o.isEscape,
    })),
    derivations: derivations.map((d) => ({
      id: d.id,
      activityId: d.activityId,
      source: d.source,
      observable: d.observable,
      mapsToConstructId: d.mapsToConstructId,
      channel: d.channel,
      edgeOrSignal: d.edgeOrSignal,
      note: d.note,
    })),
    molecules: molecules.map((m) => ({
      id: m.id,
      type: m.type,
      name: m.name,
      legs: m.legs,
      renderTemplate: m.renderTemplate,
      reportSlot: m.reportSlot,
      priority: m.priority,
    })),
    roles: roles.map((r) => ({ id: r.id, track: r.track, name: r.name, primaryIntent: r.primaryIntent })),
    domains: domains.map((d) => ({
      id: d.id,
      track: d.track,
      name: d.name,
      criticalSkills: (d.criticalSkills as { skill: string; required_level: number }[]) ?? [],
    })),
    profiles: profiles.map((p) => ({
      id: p.id,
      targetType: p.targetType,
      targetId: p.targetId,
      constructId: p.constructId,
      requiredLevel: p.requiredLevel,
      isCritical: p.isCritical,
    })),
    growth: growth.map((g) => ({
      id: g.id,
      type: g.type,
      title: g.title,
      closesGapType: g.closesGapType,
      targetConstructs: (g.targetConstructs as string[]) ?? [],
      selectionPredicate: g.selectionPredicate,
      closeability: g.closeability,
      renderTemplate: g.renderTemplate,
    })),
  };
}

/** Load master data straight from the seed JSONs — no DB needed (tests). */
export function loadMasterFromSeed(dir = join(__dirname, '..', '..', 'prisma', 'seed', 'data')): MasterData {
  const j = <T = Record<string, unknown>>(f: string): T[] => JSON.parse(readFileSync(join(dir, f), 'utf8')) as T[];
  const s = (v: unknown): string | null => (v == null || v === 'None' ? null : String(v));

  const constructs = j('constructs.json').map((c) => ({
    id: String(c.id),
    family: String(c.family) as Family,
    name: String(c.name),
    type: String(c.type),
    scale: String(c.scale),
    edgeLow: s(c.edge_low),
    edgeHigh: s(c.edge_high),
    hardnessToClose: c.hardness_to_close == null ? null : Number(c.hardness_to_close),
  }));
  const options = j('activity_options.json').map((o) => ({
    id: String(o.id),
    activityId: String(o.activity_id),
    rungOrStep: String(o.rung_or_step),
    label: String(o.label),
    mapsToConstructId: s(o.maps_to_construct_id),
    channel: s(o.channel),
    edge: s(o.edge),
    driver: s(o.driver),
    valence: s(o.valence),
    axis: s(o.axis),
    magnitude: s(o.magnitude),
    isEscape: o.is_escape === true,
  }));
  const derivations = j('derivation_rules.json').map((d) => ({
    id: String(d.id),
    activityId: String(d.activity_id),
    source: String(d.source),
    observable: String(d.observable),
    mapsToConstructId: s(d.maps_to_construct_id),
    channel: s(d.channel),
    edgeOrSignal: s(d.edge_or_signal),
    note: s(d.note),
  }));
  const molecules = j('molecule_rules.json').map((m) => ({
    id: String(m.id),
    type: String(m.type),
    name: String(m.name),
    legs: String(m.legs),
    renderTemplate: String(m.render_template),
    reportSlot: String(m.report_slot),
    priority: m.priority == null ? null : Number(m.priority),
  }));
  const roles = j('roles.json').map((r) => ({ id: String(r.id), track: String(r.track), name: String(r.name), primaryIntent: s(r.primary_intent) }));
  const domains = j('domains.json').map((d) => ({
    id: String(d.id),
    track: String(d.track),
    name: String(d.name),
    criticalSkills: (d.critical_skills as { skill: string; required_level: number }[]) ?? [],
  }));
  const profiles = j('required_profiles.json').map((p) => ({
    id: String(p.id),
    targetType: String(p.target_type),
    targetId: String(p.target_id),
    constructId: String(p.construct_id),
    requiredLevel: Number(p.required_level),
    isCritical: p.is_critical === true,
  }));
  const growth = j('growth_vehicles.json').map((g) => ({
    id: String(g.id),
    type: String(g.type),
    title: String(g.title),
    closesGapType: String(g.closes_gap_type),
    targetConstructs: (g.target_constructs as string[]) ?? [],
    selectionPredicate: String(g.selection_predicate),
    closeability: s(g.closeability),
    renderTemplate: String(g.render_template),
  }));

  // dedupe domains to the 21 distinct ids (matches the seed loader)
  const seen = new Set<string>();
  const domainsUnique = domains.filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)));

  return { constructs, options, derivations, molecules, roles, domains: domainsUnique, profiles, growth };
}
