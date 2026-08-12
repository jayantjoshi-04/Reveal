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
  lines: `${base}/lines.png`, // "lines 1/2/3" (hand-drawn ground strokes)
  seedCluster: `${base}/seed-cluster.png`, // "Layer 2 1/2" (hero seed cluster)
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
} as const;

export type AssetKey = keyof typeof A;
