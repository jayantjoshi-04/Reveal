/**
 * Illustration asset manifest.
 *
 * The hand-drawn illustrations live in the Figma file but could NOT be
 * downloaded automatically (Figma's asset host is blocked by the egress
 * proxy). Drop the exported PNG/SVG files into `public/assets/` using the
 * exact filenames below and they appear automatically — no code change
 * needed. Until a file exists, <Asset> renders a placeholder at the exact
 * designed dimensions, so the layout never shifts.
 *
 * Figma layer name  ->  file in public/assets/
 */
const base = '/assets';

export const A = {
  waterCan: `${base}/water-can.png`, // "water can_01 1"
  lines: `${base}/lines.png`, // "lines 1" (hero ground stroke, 1440x84)
  linesB: `${base}/lines-2.png`, // "lines 2" (1065x67)
  lines3: `${base}/lines-3.png`, // "lines 3" (footer stroke, 1440x17)
  seedCluster: `${base}/seed-cluster.png`, // "Layer 2 1" (hero seed cluster)
  seedCluster2: `${base}/seed-cluster-2.png`, // "Layer 2 2" (section seed cluster)
  layer14b: `${base}/layer-14-3.png`, // "Layer 14 3" (mirrored sprout stroke)
  group2: `${base}/group-2.png`, // "Group 2" (combined soil scene: ground+plant+sprout)
  seed2: `${base}/seed-2.png`, // "seed 2 1/2"
  seed4: `${base}/seed-4.png`, // "seed 4 2"
  sun: `${base}/sun.png`, // "sun 1"
  plant01: `${base}/plant-01.png`, // "plant_01 1/2"
  ground: `${base}/ground.png`, // "ground 1"
  sprout: `${base}/sprout.png`, // "sprout 1/2"
  withered: `${base}/withered.png`, // "withered 1"
  radikle: `${base}/radikle.png`, // "radikle 1" (the radicle illustration)
  plant: `${base}/plant.png`, // "plant 1" (nursery roots)
  roots: `${base}/roots.png`, // "roots 1"
  lasst: `${base}/lasst.png`, // "lasst 1" (final seed)
  layer14: `${base}/layer-14.png`, // "Layer 14 1" (small sprout stroke)

  // ── About page ──────────────────────────────────────────────────────
  cell1: `${base}/cell-1.png`, // "cell 1 1"
  cell2: `${base}/cell-2.png`, // "cell 2 1"
  cell3: `${base}/cell-3.png`, // "cell 3 1"
  driftCloser: `${base}/drift-closer.png`, // "drift closer 1"
  fusionnn: `${base}/fusionnn.png`, // "fusionnn 1"
  mainSeed: `${base}/main-seed.png`, // "main seed 1"
  seedRadikle: `${base}/seed-radikle.png`, // "seed radikle 1"

  // ── Reveal page ─────────────────────────────────────────────────────
  revealHero: `${base}/reveal-hero.png`, // "reveal 1 1/2"
  folderA: `${base}/folder-a.png`, // "=1 copy 2"
  folderB: `${base}/folder-b.png`, // "=1 copy 3"
  folderC: `${base}/folder-c.png`, // "=1 copy 4"
  folderD: `${base}/folder-d.png`, // "=1 copy 5"
  folderE: `${base}/folder-e.png`, // "=1 copy 6/7"
  folderF: `${base}/folder-f.png`, // "=1" (base folder)
  resume: `${base}/resume.png`, // "resume 1"
  bridge2: `${base}/bridge-2.png`, // "bridge 2 1"
  bridge3: `${base}/bridge-3.png`, // "bridge 3 1"
  conform: `${base}/conform.png`, // "conform 1"
  aspirational: `${base}/aspirational.png`, // "aspirational 1"
  surprise: `${base}/surprise.png`, // "surprise 1"
  confirmed: `${base}/confirmed.png`, // "confirmed 1"
  plant3: `${base}/plant-3.png`, // "plant 3"

  // ── What we do page ─────────────────────────────────────────────────
  rectangle103: `${base}/rectangle-103.png`, // "Rectangle 103"
  layer20: `${base}/layer-20.png`, // "Layer 20 1"
  layer21: `${base}/layer-21.png`, // "Layer 21 1/2"
  layer22b: `${base}/layer-22b.png`, // "Layer 22 2/3"
  layer23: `${base}/layer-23.png`, // "Layer 23 1..4"
  layer27: `${base}/layer-27.png`, // "Layer 27 1"
  layer28: `${base}/layer-28.png`, // "Layer 28 1"
  layer31: `${base}/layer-31.png`, // "Layer 31 1"
  portrait: `${base}/portrait.png`, // "portrait 1"
} as const;

export type AssetKey = keyof typeof A;
