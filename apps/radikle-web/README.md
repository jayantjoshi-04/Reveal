# @radikle/web — Radikle marketing site

The public website for **Radikle** (the parent company of Reveal), built from the
Figma design _"Radikle Website (Copy)"_.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** (design tokens lifted verbatim from Figma — see `tailwind.config.ts`)
- **Framer Motion** (hero parallax, scroll reveals)
- **React Router** (multi-page site)
- Fonts: **Raleway** (headings) + **Host Grotesk** (body/nav) via Google Fonts

## Run

```bash
pnpm install          # from the repo root
pnpm --filter @radikle/web dev      # http://localhost:5174
pnpm --filter @radikle/web build    # typecheck + production build
```

## Design fidelity

The design is a fixed **1440px** canvas. Pages reproduce the exact Figma
coordinates inside `<FixedCanvas>`, which scales the whole canvas to fit smaller
viewports so nothing breaks. Palette, type, and spacing are the exact values
read from the design layers.

## Illustrations — how to add the exported assets

The hand-drawn illustrations could **not** be pulled automatically (Figma's
asset host is blocked by the environment's egress proxy). Until the exported
files are present, `<Asset>` renders a neutral placeholder **at the exact
designed size**, so dropping the real files in never shifts the layout.

To add them:

1. In Figma, export each illustration as **PNG (2x or 3x)** — or SVG where the
   layer is vector — at the highest quality.
2. Save them into `public/assets/` using the filenames in
   [`src/lib/assets.ts`](src/lib/assets.ts). For example:
   - `water can_01 1` → `public/assets/water-can.png`
   - `radikle 1` → `public/assets/radikle.png`
   - `roots 1` → `public/assets/roots.png`
   - …see `src/lib/assets.ts` for the full mapping.
3. Reload — the illustrations appear automatically. No code changes needed.

> Tip: a ZIP of all exports can be unzipped straight into `public/assets/` as
> long as the filenames match the manifest.

## Pages

| Route | Figma frame | Status |
| --- | --- | --- |
| `/` | Website process | **complete** |
| `/about` | About us | **complete** |
| `/stories` | Our Stories | **complete** |
| `/what-we-do` | What we do | **complete** |
| `/reveal` | Reveal | **complete** |
| `/disha` | Disha coming soon | coming soon |
| `/discover` | Discover coming soon | coming soon |

All seven designed frames are reproduced at their exact 1440px coordinates.
Illustrations render from `public/assets/` once the exports are added (see
above); until then each shows a dimension-preserving placeholder.
