/**
 * Illustration asset manifest, organised by page (mirrors public/assets/<page>/).
 *
 * Every PNG is a Figma per-layer export at its final bounding box (rotation and
 * clipping already baked in), so components place each image at its layer's
 * OUTER box and simply fill it — no CSS transforms are re-applied.
 */
const b = '/assets';

export const A = {
  // ── Home ("Website process") ────────────────────────────────────────
  home: {
    group2: `${b}/home/group-2.png`, // combined soil scene (ground+plant+sprout)
    lasst: `${b}/home/lasst-1.png`,
    layer14: `${b}/home/layer-14-1.png`,
    layer14b: `${b}/home/layer-14-3.png`,
    seedCluster: `${b}/home/layer-2-1.png`, // hero seed
    seedCluster2: `${b}/home/layer-2-2.png`, // section seed
    lines: `${b}/home/lines-1.png`, // hero ground stroke
    linesB: `${b}/home/lines-2.png`,
    lines3: `${b}/home/lines-3.png`, // footer stroke
    plant01: `${b}/home/plant-01-2.png`,
    plant: `${b}/home/plant-1.png`,
    radikle: `${b}/home/radikle-1.png`,
    roots: `${b}/home/roots-1.png`,
    seed2: `${b}/home/seed-2-1.png`,
    seed4: `${b}/home/seed-4-2.png`,
    sprout: `${b}/home/sprout-2.png`,
    sun: `${b}/home/sun-1.png`,
    waterCan: `${b}/home/water-can-01-1.png`,
    withered: `${b}/home/withered-1.png`,
  },

  // ── Our Stories / About (shared illustrations) ──────────────────────
  stories: {
    cell1: `${b}/stories/cell-1-1.png`,
    cell2: `${b}/stories/cell-2-1.png`,
    cell3: `${b}/stories/cell-3-1.png`,
    driftCloser: `${b}/stories/drift-closer-1.png`,
    fusionnn: `${b}/stories/fusionnn-1.png`,
    mainSeed: `${b}/stories/main-seed-1.png`,
    seedRadikle: `${b}/stories/seed-radikle-1.png`,
  },

  // ── What we do ──────────────────────────────────────────────────────
  whatWeDo: {
    seedCluster: `${b}/what-we-do/layer-2-2.png`,
    roots2: `${b}/what-we-do/roots-2.png`,
    roots3: `${b}/what-we-do/roots-3.png`,
    waterCan2: `${b}/what-we-do/water-can-01-2.png`,
    radikle2: `${b}/what-we-do/radikle-2.png`,
    layer20: `${b}/what-we-do/layer-20-1.png`,
    layer21a: `${b}/what-we-do/layer-21-1.png`,
    layer21b: `${b}/what-we-do/layer-21-2.png`,
    layer22b: `${b}/what-we-do/layer-22-2.png`,
    layer22c: `${b}/what-we-do/layer-22-3.png`,
    layer23: `${b}/what-we-do/layer-23-1.png`,
    layer27: `${b}/what-we-do/layer-27-1.png`,
    layer28: `${b}/what-we-do/layer-28-1.png`,
    layer31: `${b}/what-we-do/layer-31-1.png`,
    portrait: `${b}/what-we-do/portrait-1.png`,
    rectangle103: `${b}/what-we-do/rectangle-103.png`,
    ground: `${b}/what-we-do/ground-1.png`,
    sun2: `${b}/what-we-do/sun-2.png`,
    aspirational1: `${b}/what-we-do/aspirational-1.png`,
    aspirational2: `${b}/what-we-do/aspirational-2.png`,
    aspirational3: `${b}/what-we-do/aspirational-3.png`,
  },

  // ── Reveal ──────────────────────────────────────────────────────────
  reveal: {
    hero: `${b}/reveal/reveal-1-1.png`,
    hero2: `${b}/reveal/reveal-1-2.png`,
    // portfolio folder tiles (two instances of each, plus the base "=1")
    copy2a: `${b}/reveal/1-copy-2-1.png`,
    copy2b: `${b}/reveal/1-copy-2-2.png`,
    copy3a: `${b}/reveal/1-copy-3-1.png`,
    copy3b: `${b}/reveal/1-copy-3-2.png`,
    copy4a: `${b}/reveal/1-copy-4-1.png`,
    copy4b: `${b}/reveal/1-copy-4-2.png`,
    copy5a: `${b}/reveal/1-copy-5-1.png`,
    copy5b: `${b}/reveal/1-copy-5-2.png`,
    copy6: `${b}/reveal/1-copy-6.png`,
    copy7: `${b}/reveal/1-copy-7.png`,
    one1: `${b}/reveal/1-1.png`,
    one2: `${b}/reveal/1-2.png`,
    one3: `${b}/reveal/1-3.png`,
    one4: `${b}/reveal/1-4.png`,
    resume: `${b}/reveal/resume-1.png`,
    bridge2: `${b}/reveal/bridge-2-1.png`,
    bridge3: `${b}/reveal/bridge-3-1.png`,
    conform: `${b}/reveal/conform-1.png`,
    confirmed: `${b}/reveal/confirmed-1.png`,
    aspirational: `${b}/reveal/aspirational-1.png`,
    surprise: `${b}/reveal/surprise-1.png`,
    plant01: `${b}/reveal/plant-01-1.png`,
    plant3: `${b}/reveal/plant-3.png`,
    sun: `${b}/reveal/sun-2.png`,
    layer14: `${b}/reveal/layer-14-4.png`,
  },

  // ── Coming-soon pages ───────────────────────────────────────────────
  disha: { sprout: `${b}/disha/sprout-1.png` },
  discover: { sprout: `${b}/discover/sprout-1.png` },
} as const;
