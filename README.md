# Radikle — website

The public marketing website for **Radikle**. _Every child is a seed._

A standalone single-page app (client-side routed) built from the Figma design
_"Radikle Website"_. This repository is fully independent — it does **not**
depend on the Reveal repository or any shared package.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** — design tokens (colours, type, spacing) lifted verbatim from Figma (`tailwind.config.ts`)
- **Framer Motion** — hero parallax + scroll reveals
- **React Router** — multi-page site
- Fonts: **Raleway** (headings) + **Host Grotesk** (body/nav) via Google Fonts

No backend, no database, no environment variables — it's a static site.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:5174
pnpm build      # type-check + production build -> dist/
pnpm preview    # preview the production build
```

Requires Node 20+ and pnpm.

## Project structure

```
radikle-website/
├─ index.html                 # entry + Google Fonts
├─ vite.config.ts             # dev server on :5174
├─ tailwind.config.ts         # Radikle design tokens
├─ vercel.json                # SPA deploy config (Vite, dist/, rewrites)
├─ public/assets/<page>/      # illustrations, organised per page
└─ src/
   ├─ main.tsx  App.tsx  index.css
   ├─ components/             # FixedCanvas, Navbar, Footer, Asset, HeroSeed, Reveal, …
   ├─ lib/assets.ts           # asset manifest (grouped by page)
   └─ pages/                  # Home, About, Stories, WhatWeDo, RevealPage, Disha, Discover, NotFound
```

## Pages / routes

| Route | Figma frame | Status |
| --- | --- | --- |
| `/` | Website process | complete |
| `/about` | About us | complete |
| `/stories` | Our Stories | complete |
| `/what-we-do` | What we do | complete |
| `/reveal` | Reveal | complete |
| `/disha` | Disha coming soon | coming soon |
| `/discover` | Discover coming soon | coming soon |

## Design fidelity

The design is a fixed **1440px** canvas. Pages reproduce the exact Figma
coordinates inside `<FixedCanvas>`, which scales the whole canvas to fill the
viewport width (so the full-bleed colour bands always reach both edges).
Illustrations are Figma per-layer exports placed at their outer bounding box.

## Assets

All illustrations live in `public/assets/<page>/` (`home/`, `stories/`,
`what-we-do/`, `reveal/`, `disha/`, `discover/`). The manifest in
`src/lib/assets.ts` maps each to a page-scoped key. `/about` reuses the
`stories/` illustrations (shared, no duplication).

## Deployment

Any static host works (the app builds to `dist/`). `vercel.json` is preconfigured
for Vercel — set the project root to this repo, and it builds with `pnpm build`,
serves `dist/`, and rewrites all routes to `index.html` for client-side routing.
