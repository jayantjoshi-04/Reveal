# REVEAL

A hybrid diagnostic that helps design students discover which design domain to pursue — by
reading **what they do**, not just what they say.

REVEAL combines two channels:
- **Channel A (Stated):** forced-choice scenario items.
- **Channel B (Behavioural):** constrained tasks (budget allocation with forced cuts, timed
  attention-capture, visual preference sorts over a 40-artifact grid), tracking selections,
  weights, and response times.

It produces a high-fidelity diagnostic report — the **Design Signature** — with charts, structured
prose, and tailored growth experiments.

## Architecture at a glance

A decoupled four-layer pipeline that keeps the LLM away from any judgment that must be stable:

1. **Capture** — raw inputs stored untouched.
2. **Analysis engine** — pure-JS math turns raw data into a deterministic Findings Object (no LLM).
3. **Synthesis** — one LLM call phrases findings into fixed report slots under a strict contract.
4. **Cache** — the report generates exactly once per instance and is re-served on every view.

No report is generated automatically: a **facilitator review gate** stands between raw data and a
student's report.

**Stack:** React + Tailwind (web) · Node.js + Fastify (api) · PostgreSQL · deployed on free tiers
(Vercel / Render / Supabase or Neon).

## Monorepo layout

```
packages/shared   frozen enums, scoring constants, zod capture/findings contracts, report slots
apps/api          Fastify · the 4-layer pipeline (capture · engine · synthesis · cache)
apps/web          React + Tailwind · capture flow, facilitator gate, admin, Design Signature
```

## Running locally

Requires Node ≥ 20, pnpm, and a PostgreSQL database.

```bash
pnpm install
cp .env.example .env            # set DATABASE_URL (+ ANTHROPIC_API_KEY for live synthesis)

pnpm --filter @reveal/shared build
pnpm --filter @reveal/api db:migrate    # apply schema
pnpm --filter @reveal/api db:seed       # load instrument v1.0 + demo staff

pnpm dev:api                    # API on :4000
pnpm dev:web                    # web on :5173
```

Set `SYNTHESIS_MODE=manual` (or leave `ANTHROPIC_API_KEY` empty) to run the report
generator with the deterministic fallback phraser — the whole pipeline works offline,
no LLM calls. Set `SYNTHESIS_MODE=auto` with a key for the single low-temperature Claude
call on facilitator approval.

Demo accounts (seeded): `facilitator@reveal.test`, `admin@reveal.test`.

## Tests

```bash
pnpm --filter @reveal/api test  # engine golden tests (the Jaanhvi profile)
```

## Docs

- [`docs/DEVELOPMENT_BLUEPRINT.md`](./docs/DEVELOPMENT_BLUEPRINT.md) — folder structure, database
  DDL, and server architecture.
- [`docs/reference/`](./docs/reference) — the five source specs (data schema, app flow, Channel A/B
  content, analysis/report templates, Design Signature).
