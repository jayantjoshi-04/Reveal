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

## Docs

- [`docs/DEVELOPMENT_BLUEPRINT.md`](./docs/DEVELOPMENT_BLUEPRINT.md) — folder structure, database
  DDL, and server architecture.
- [`docs/reference/`](./docs/reference) — the five source specs (data schema, app flow, Channel A/B
  content, analysis/report templates, Design Signature).
