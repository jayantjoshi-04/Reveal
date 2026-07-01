# REVEAL — Development Blueprint (Step 1)

> A hybrid diagnostic that helps design students discover which design domain to pursue.
> This document is the build-time spine: folder structure, database DDL, and server
> architecture. It is grounded in the five reference specs in [`docs/reference/`](./reference).

---

## 0. Architecture confirmation — the one governing idea

**REVEAL is a deterministic diagnostic with an LLM bolted to the very end as a _phrasing_
device — not an app with an LLM in it.** Per `Analysis_Report_Templates_v3`: _"The LLM never
decides what is true about a student… Those are computed. The LLM only decides how to say
findings it is handed."_ Every decision below serves that boundary.

### The four decoupled layers

| Layer | Responsibility | Location | LLM? |
|---|---|---|---|
| **1 · Capture** | Raw inputs — selections, keywords, weights, **response times** — written untouched into `raw_capture` | Student capture API → Postgres | No |
| **2 · Analysis engine** | Pure-JS math: frozen scoring constants → per-trait scores → deterministic finding rules → the **Findings Object** | `apps/api/src/engine/` | No |
| **3 · Synthesis** | Takes the Findings Object _only_ (never raw data), phrases it into fixed report slots under a strict contract | `apps/api/src/synthesis/`, one API call | **Yes — once** |
| **4 · Cache** | `report_payload` persisted per `report_instance`; re-views re-serve bytes, never regenerate | Postgres JSONB | No |

### Three structural facts we build around

1. **Raw is stored separately from derived, and derived separately from the cached report.**
   This makes the engine re-runnable on old data when constants change. The schema enforces the
   separation physically.
2. **Capture is three sealed, resumable sessions** (S1 Foundations, S2 Values & Direction,
   S3 Pulls & Aspiration). Sessions **seal on completion**; behavioural answers become immutable;
   a returning student **resumes at the next item and never sees prior behavioural responses**.
   B runs before A on game-prone traits (B1→A3, B5→A7).
3. **No report generates automatically.** A facilitator reviews the high-stakes calls (surprises,
   coherence adjudication, market tension) and clicks **"Approve & Generate"** — the only trigger
   for the single LLM call. At 5,000 students this caps lifetime synthesis calls at ≤5,000; cache
   serves everything after.

### Confirmed decisions
- **Backend framework:** Fastify (JSON-schema validation enforces frozen `raw_capture` shapes at
  the edge; low per-request overhead for free-tier hosting).
- **Synthesis mode:** automated Claude call on facilitator approve, low temperature (≈0.3),
  self-validated against the slot contract before caching.
- **Scale/cost target:** 5,000 active students on free tiers — Vercel (web), Render/serverless
  (api), Supabase/Neon (Postgres + Storage). Queue is Postgres-backed (pg-boss) → zero extra infra.

---

## 1. File & Folder Structure

Monorepo — one repo, two deployables, plus shared enum/contract constants imported by both sides
so the frozen enums live in exactly one place.

```
reveal/
├── package.json                # workspaces: apps/*, packages/*
├── pnpm-workspace.yaml
├── .env.example
├── docs/                       # the reference specs (source of truth)
│
├── packages/
│   └── shared/                 # imported by BOTH frontend & backend
│       └── src/
│           ├── enums.ts        # capacity(6) capability(12) role(7) value(12)
│           │                   #   theme condition · instance status · confidence
│           ├── constants.ts    # scoring constants (●1.0 ○0.5, thresholds, B5 bands)
│           ├── contracts/
│           │   ├── findings.schema.ts    # Findings Object shape (zod)
│           │   ├── raw-capture.schema.ts # channel_a/b + portfolio shapes (zod)
│           │   └── report-slots.ts       # slot ids + word ceilings + rules
│           └── types.ts
│
├── apps/
│   ├── api/                    # Node.js · Fastify · backend
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── app.ts          # plugin registration, CORS, auth, error handler
│   │   │   ├── config/         # env parsing, db pool, storage client
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   ├── student/        # LAYER 1 — capture only
│   │   │   │   │   ├── instances.routes.ts   # start / resume-state
│   │   │   │   │   ├── sessions.routes.ts    # submit module · seal
│   │   │   │   │   └── uploads.routes.ts     # portfolio · images · resume
│   │   │   │   ├── facilitator/    # the review gate
│   │   │   │   │   ├── queue.routes.ts
│   │   │   │   │   └── review.routes.ts       # approve-&-generate
│   │   │   │   ├── admin/          # instrument authoring (versioned)
│   │   │   │   │   ├── items.routes.ts        # A questions/options/tags
│   │   │   │   │   ├── tasks.routes.ts        # B task params
│   │   │   │   │   ├── artifacts.routes.ts    # 40-artifact library + B4 zones
│   │   │   │   │   ├── rubrics.routes.ts      # B6 + scoring constants
│   │   │   │   │   └── reports.routes.ts      # re-run scoring / generate
│   │   │   │   ├── report/         # LAYER 4 — read cached payload only
│   │   │   │   │   └── report.routes.ts
│   │   │   │   └── auth/
│   │   │   │       └── auth.routes.ts         # student magic-link · staff login
│   │   │   │
│   │   │   ├── services/           # orchestration (routes stay thin)
│   │   │   │   ├── session.service.ts   # seal/resume state machine
│   │   │   │   ├── capture.service.ts   # merge module → raw_capture (immutability)
│   │   │   │   ├── review.service.ts
│   │   │   │   └── generation.service.ts # once-only guard around L2→L3
│   │   │   │
│   │   │   ├── engine/             # ★ LAYER 2 — PURE, no I/O, no LLM, unit-tested
│   │   │   │   ├── index.ts        # run(rawCapture, constants) → Findings Object
│   │   │   │   ├── scorers/        # aScore, bScore, capacitySpike, agreement…
│   │   │   │   ├── rules/          # surprise, gap-classify, coherence, market
│   │   │   │   └── __tests__/      # golden test: Jaanhvi profile → known findings
│   │   │   │
│   │   │   ├── synthesis/          # ★ LAYER 3 — the only LLM step
│   │   │   │   ├── index.ts        # findings → validated report_payload
│   │   │   │   ├── prompt.ts       # system prompt = Report-template contract
│   │   │   │   ├── validate.ts     # word ceilings · must-end-in-? · no-compare lint
│   │   │   │   └── client.ts       # Claude API, temp≈0.3, retry, cost log
│   │   │   │
│   │   │   ├── repositories/       # all SQL — the only layer that touches the DB
│   │   │   │   ├── instance.repo.ts
│   │   │   │   ├── rawCapture.repo.ts
│   │   │   │   ├── derived.repo.ts
│   │   │   │   ├── reportPayload.repo.ts
│   │   │   │   └── instrument.repo.ts
│   │   │   │
│   │   │   ├── jobs/               # pg-boss (Postgres-backed queue — no new infra)
│   │   │   │   └── generate-report.job.ts
│   │   │   ├── middleware/         # auth guards: student | facilitator | admin
│   │   │   └── db/
│   │   │       ├── migrations/     # numbered SQL (Section 2)
│   │   │       └── seed/           # seeds instrument tables from reference content
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                    # React · Vite · Tailwind · frontend
│       ├── index.html
│       ├── tailwind.config.ts  # DM Serif/Sans/Mono + orange/ink/cream/navy tokens
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx          # role-based router: student | facilitator | admin
│       │   ├── lib/
│       │   │   ├── api.ts       # typed client (imports packages/shared contracts)
│       │   │   └── queryClient.ts   # React Query — server-authoritative state
│       │   ├── store/
│       │   │   └── captureDraft.ts   # Zustand: local draft only; server owns seal
│       │   │
│       │   ├── features/
│       │   │   ├── capture/         # the student journey
│       │   │   │   ├── SessionShell.tsx   # progress bar, chip, seal screen
│       │   │   │   ├── ResumeGate.tsx     # "welcome back · resume at next item"
│       │   │   │   ├── channelA/          # A1..A7 item components
│       │   │   │   ├── channelB/          # B1 budget · B4 tap-zones · B5 sort…
│       │   │   │   └── portfolio/         # inventory · uploads · interpretive
│       │   │   ├── facilitator/     # desktop console: Queue, ReviewGate
│       │   │   ├── admin/           # Overview, Items, Tasks, Library, Rubrics
│       │   │   └── report/          # the Design Signature dashboard renderer
│       │   │       ├── Hero.tsx · Vitals.tsx
│       │   │       ├── SectionToday.tsx · SurpriseCallout.tsx
│       │   │       ├── SectionHeading.tsx · EvidenceRoom.tsx
│       │   │       └── charts/      # gauges, bullet, scatter, market-axis (SVG)
│       │   │
│       │   ├── components/ui/       # design-system primitives (Figma tokens)
│       │   └── styles/
│       └── package.json
│
└── infra/
    ├── vercel.json             # web deploy
    └── render.yaml             # api deploy
```

**Two structural choices:**
- `packages/shared` exists because the spec freezes enums, constants, and slot contracts.
  Defining them once and importing both ways means the frontend renders exactly the traits the
  engine scores, and the synthesis validator enforces the same word ceilings the UI expects.
- `engine/` and `synthesis/` are **separate, pure modules** with no route/DB imports. The engine
  is unit-tested against the **Jaanhvi golden profile** (`ChannelAB_Content` requires validating
  the B5 tagging against her known impact/human quadrant before trusting a cohort).

---

## 2. PostgreSQL Database Setup

Targets Postgres 14+ (Supabase/Neon). Order: extensions → enums → spine → operational →
instrument → indexes & integrity.

### 2.0 Extensions & enums

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

CREATE TYPE instance_status    AS ENUM ('in_progress','capture_complete','generated','reviewed','released');
CREATE TYPE session_status     AS ENUM ('not_started','in_progress','sealed');
CREATE TYPE confidence_code    AS ENUM ('CC3','CC2','contradicted','surprise');
CREATE TYPE gap_classification AS ENUM ('real','performed','latent');
CREATE TYPE gap_kind           AS ENUM ('capability','capacity');
CREATE TYPE market_class       AS ENUM ('aligned','drifting_to_market','holding_to_pull');
CREATE TYPE resume_frame       AS ENUM ('commercial','impact','mixed','unknown');
CREATE TYPE staff_role         AS ENUM ('facilitator','admin');
CREATE TYPE review_decision    AS ENUM ('pending','approved','flagged','edited');

-- Trait vocabularies (capability(12), value(12), role(7), theme, condition) are large and
-- admin-tunable, so they live as CHECKed text / lookup rows rather than hard enums.
```

### 2.1 The spine

```sql
-- ENTITY 1 · student (email is the natural login key)
CREATE TABLE student (
  student_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  program      TEXT,
  institution  TEXT,
  cohort       TEXT,                                   -- cohort grouping + queue filter
  consent      JSONB NOT NULL DEFAULT '{}'::jsonb,     -- {data_use,retention_ack,granted_at}
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ENTITY 2 · report_instance (a student owns MANY, dated — enables drift/re-run)
CREATE TABLE report_instance (
  instance_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  schema_version  TEXT NOT NULL DEFAULT '1.0',         -- which scoring applied, for re-runs
  status          instance_status NOT NULL DEFAULT 'in_progress',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,                         -- capture done (all 3 sessions sealed)
  generated_at    TIMESTAMPTZ                          -- report built (single LLM run)
);

-- ENTITY 3+4+5 · raw_capture (1:1, LAYER 1). One JSONB per channel.
-- channel_a = a1..a7 · channel_b = b1..b8 · portfolio = {projects[],resume}
-- Written incrementally; a sealed session's keys are immutable.
CREATE TABLE raw_capture (
  instance_id  UUID PRIMARY KEY REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  channel_a    JSONB NOT NULL DEFAULT '{}'::jsonb,
  channel_b    JSONB NOT NULL DEFAULT '{}'::jsonb,
  portfolio    JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ENTITY 6 · derived (1:1, LAYER 2 output). ONLY the engine writes here.
-- Re-computable from raw_capture; wiped & rebuilt on re-run.
CREATE TABLE derived (
  instance_id      UUID PRIMARY KEY REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  engine_version   TEXT NOT NULL,
  findings         JSONB NOT NULL,        -- the handoff object (differentiation, capacities[],
                                          --   roles[], values[], surprises[], gap[], market, …)
  trait_scores     JSONB NOT NULL DEFAULT '[]'::jsonb,
  coherence        JSONB,
  market_tension   JSONB,
  computed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LAYER 4 · report_payload (1:1 cache). Written ONCE by synthesis; re-served forever.
CREATE TABLE report_payload (
  instance_id   UUID PRIMARY KEY REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  slots         JSONB NOT NULL,           -- filled slot text keyed by slot id
  model         TEXT NOT NULL,            -- provenance: model + temperature
  generated     BOOLEAN NOT NULL DEFAULT true,   -- once-only guard flag
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Idempotency: PK on instance_id makes a second synthesis physically impossible.
-- generation.service uses INSERT … ON CONFLICT DO NOTHING, so re-approve is a no-op.
```

### 2.2 Operational tables

```sql
-- The 3 sealed, resumable sessions. Seal + resume cursor live here.
CREATE TABLE capture_session (
  session_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id   UUID NOT NULL REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  session_no    SMALLINT NOT NULL CHECK (session_no IN (1,2,3)),
  status        session_status NOT NULL DEFAULT 'not_started',
  resume_cursor TEXT,                          -- module_code of the NEXT item to serve
  sealed_at     TIMESTAMPTZ,
  UNIQUE (instance_id, session_no)
);

-- Append-only capture log: one row per submitted module/task.
-- Grain the engine needs for response-time signals; enforces post-seal immutability.
CREATE TABLE module_response (
  response_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id   UUID NOT NULL REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  session_no    SMALLINT NOT NULL,
  module_code   TEXT NOT NULL,                 -- 'a1'..'a7','b1'..'b8','portfolio_facts',…
  payload       JSONB NOT NULL,                -- exactly what the task exports
  response_ms   INTEGER,                       -- total time on this module
  sealed        BOOLEAN NOT NULL DEFAULT false,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instance_id, module_code)
);

-- Uploaded files (portfolio PDF/link, B6 images, resume) — object storage refs only.
CREATE TABLE upload (
  upload_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id  UUID NOT NULL REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  kind         TEXT NOT NULL,                  -- 'portfolio' | 'b6_image' | 'resume'
  storage_ref  TEXT NOT NULL,                  -- Supabase Storage / S3 key
  meta         JSONB DEFAULT '{}'::jsonb,      -- {why} for B6, filename, mime
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff (facilitators + admins)
CREATE TABLE staff (
  staff_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  role         staff_role NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The Facilitator Review Gate. One review per instance.
CREATE TABLE review (
  review_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id      UUID NOT NULL UNIQUE REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  reviewer_id      UUID REFERENCES staff(staff_id),
  decision         review_decision NOT NULL DEFAULT 'pending',
  high_stakes      JSONB DEFAULT '{}'::jsonb,  -- snapshot of surprises/coherence/gap/market shown
  facilitator_note TEXT,
  slot_edits       JSONB,                      -- optional light edits applied post-generation
  decided_at       TIMESTAMPTZ
);
```

### 2.3 Instrument tables (admin-editable, versioned)

The admin console edits the instrument without a developer, so content is data — versioned so a
live cohort's scoring is stable.

```sql
CREATE TABLE instrument_version (
  version_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label        TEXT NOT NULL,                  -- '1.0'
  is_live      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Channel A · questions + options + capacity/role tags
CREATE TABLE a_item (
  item_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id    UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  module_code   TEXT NOT NULL,                 -- 'a1'..'a7'
  seq           SMALLINT NOT NULL,
  prompt        TEXT NOT NULL,
  is_non_design BOOLEAN DEFAULT false          -- the ★ orthodoxy-guard items
);
CREATE TABLE a_option (
  option_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID NOT NULL REFERENCES a_item(item_id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  tag          TEXT NOT NULL                   -- capacity/role code, e.g. 'empathy','narrative'
);

-- Channel B · task parameters + trait tags (weights ● / ○)
CREATE TABLE b_task (
  task_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  task_code    TEXT NOT NULL,                  -- 'b1'..'b8'
  params       JSONB NOT NULL,                 -- e.g. b1 {fund:6,keep:4,cut:2}
  trait_tags   JSONB NOT NULL                  -- [{trait:'values',weight:1.0}, …]
);

-- B5 · the 40-artifact library (hidden metric taxonomy)
CREATE TABLE artifact (
  artifact_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  seq          SMALLINT NOT NULL,              -- 1..40
  title        TEXT NOT NULL,
  domain       TEXT,
  imp          NUMERIC(3,2) NOT NULL,          -- commercial(-1) ↔ impact(+1)
  hum          NUMERIC(3,2) NOT NULL,          -- object(-1) ↔ human(+1)
  st           TEXT NOT NULL,                  -- craft | systems | concept
  pair_code    TEXT,                           -- 'P1'..'P10' look-alike pairs, else NULL
  image_ref    TEXT
);

-- B4 · attention scenes + invisible, area-balanced category zones
CREATE TABLE scene_asset (
  scene_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  stimulus_id  TEXT NOT NULL,                  -- 's1_market'…
  image_ref    TEXT,
  zones        JSONB NOT NULL                  -- [{category:'PEOPLE',polygon:[[x,y]…]}, …]
);

-- B6 rubric dimensions + frozen scoring constants (both versioned)
CREATE TABLE rubric_dimension (
  dimension_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  name         TEXT NOT NULL,                  -- subject, era, complexity…
  poles        TEXT NOT NULL
);
CREATE TABLE scoring_constant (
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  key          TEXT NOT NULL,                  -- 'weight_primary','a_present','b5_band_real'…
  value        NUMERIC NOT NULL,
  PRIMARY KEY (version_id, key)
);
```

### 2.4 Indexes & integrity

```sql
CREATE INDEX idx_instance_status   ON report_instance (status);
CREATE INDEX idx_instance_student  ON report_instance (student_id);
CREATE INDEX idx_student_cohort    ON student (cohort);
CREATE INDEX idx_session_instance  ON capture_session (instance_id);
CREATE INDEX idx_response_instance ON module_response (instance_id);
CREATE INDEX idx_review_decision   ON review (decision);
CREATE INDEX idx_derived_findings_gin ON derived USING GIN (findings jsonb_path_ops);
```

**Integrity rules the schema encodes:**
- **Nothing writes `derived` except the engine; the engine reads only `raw_capture`.** Enforced
  in code (only `derived.repo` is called from generation), hardenable with Supabase RLS so the
  student/facilitator JWT roles have no write grant on `derived` or `report_payload`.
- **Immutability of sealed answers:** `module_response.sealed` + the app rejecting writes to a
  sealed session's `module_code`. Optional belt-and-braces: a `BEFORE UPDATE` trigger.
- **Generate-once:** the PK on `report_payload.instance_id` makes a second synthesis impossible;
  re-view and re-approve both no-op.

### Scoring constants to seed (from `Analysis_Report_Templates_v3`)

| Constant | Value |
|---|---|
| Primary-tag weight (●) / Secondary (○) | 1.0 / 0.5 |
| A-score "present" / "absent" threshold | ≥ 0.50 / ≤ 0.20 |
| B-task "points-toward" threshold | ≥ 0.50 |
| Contradiction (A high / B low) | A ≥ 0.60 ∧ B ≤ 0.30 |
| Capacity demonstrated (display) | 0.6·B + 0.4·A, ×100 |
| Gap "meaningful" band | stated_gap ≥ 0.40 |
| B5 distance bands (0–2.83) | small ≤ 0.45 · real 0.45–0.90 · large > 0.90 |
| Surprise | A ≤ 0.20 ∧ B ≥ 0.50 ∧ agreeing situations ≥ 2 |
| Confidence | CC-3: A≥0.50 ∧ agree≥3 · CC-2: A≥0.50 ∧ agree 1–2 |

---

## 3. Server Architecture Plan

Fastify, layered `routes → services → repositories`, with the pure `engine/` and single-call
`synthesis/` outside the request path.

### 3.1 Student capture — the three-locked-session state machine

The server, not the client, owns session state and the resume cursor, and **never returns sealed
behavioural answers** to the client.

```
POST /api/instances                         → create/resume instance
                                              → { instance_id, active_session, cursor }
GET  /api/instances/:id/state               → resume payload: which session, next module_code.
                                              ⚠ Filters out sealed behavioural answers by design.
POST /api/instances/:id/sessions/:n/start   → mark session in_progress
POST /api/instances/:id/sessions/:n/modules/:code
                                            → append one module answer (Layer 1 write).
                                              409 if session n already sealed.
                                              Merges the key into raw_capture.channel_*.
POST /api/instances/:id/sessions/:n/seal    → transactional seal:
                                              set session sealed, mark its module_responses sealed,
                                              advance cursor. Idempotent. On session 3 seal →
                                              status='capture_complete', completed_at=now(),
                                              enqueue engine run.
POST /api/instances/:id/uploads             → portfolio / b6_image / resume → object storage
```

**Why this is efficient and safe:**
- **Resume is computed, not client-side** — `GET /state` reads `capture_session.resume_cursor` and
  returns only the next item, so a refreshed client can't desync.
- **Seal is one transaction** — a dropped connection mid-seal either fully seals or doesn't.
- **Behavioural contamination is impossible by construction** — the read projection omits sealed
  channel_b keys.
- **Interleave order (B1→A3, B5→A7) is data, not code** — the ordered `module_code` sequence is
  seeded per `instrument_version`, so admins can retune it.

### 3.2 Engine run (Layer 2) — triggered at capture_complete

On session-3 seal, a pg-boss job runs the pure engine:

```
jobs/generate-scores  →  engine.run(raw_capture, constants@version)
                      →  writes derived.findings   (NO report yet, NO LLM)
```

Split from synthesis deliberately: the facilitator must see the **computed** surprises/coherence/
gap/market _before_ any prose exists.

### 3.3 Facilitator review gate — queue + single generation trigger

```
GET  /api/facilitator/queue?status=to_review&cohort=7&page=1
       → paginated instances at status='capture_complete', annotated from derived.findings:
         surprise count · coherence flag · "clean".
GET  /api/facilitator/reviews/:instanceId
       → high-stakes panel: surprises, coherence adjudication, gap classification, market tension.
         No raw data, no LLM.
POST /api/facilitator/reviews/:instanceId/note      → save facilitator note
POST /api/facilitator/reviews/:instanceId/approve   → ★ THE ONLY LLM TRIGGER
       → generation.service:
           1. guard: if report_payload exists → return cached (no-op)
           2. synthesis.run(derived.findings)  ← single Claude call, temp≈0.3
           3. validate slots (word ceilings, surprise-ends-in-?, no-comparison lint)
           4. INSERT report_payload ON CONFLICT DO NOTHING
           5. status='generated'→'released'; review.decision='approved'
POST /api/facilitator/reviews/:instanceId/flag      → hold, do not generate
```

The cost guarantees stack: LLM gated behind a human click, runs at most once, wrapped in an
idempotent insert, and self-validated against the contract before persisting. Hard ceiling of
≤5,000 synthesis calls for the cohort's life; everything after is cache.

### 3.4 Report delivery (Layer 4) — read-only

```
GET /api/report/:instanceId   → 200 with report_payload.slots + derived (for charts) if
                                 status='released', else 403/"in review". Pure cache read.
```

The frontend renders the Design Signature from `derived` (numbers → gauges, bullet charts,
scatter, market axis) + `report_payload.slots` (phrased captions) — the "~65% visual" split.

### 3.5 Admin, auth, deployment

- **Admin API** — versioned CRUD on instrument tables, plus
  `POST /api/admin/reports/rerun-scoring` which re-runs the engine over existing `raw_capture` at
  a new constant version (the payoff of storing raw separately from derived).
- **Auth** — students via email magic-link (email is the login key); staff via role-guarded JWT
  (`facilitator` | `admin`). Middleware guards segregate the three route trees.
- **Deploy** — `apps/web` → Vercel; `apps/api` → Render/serverless; Postgres + Storage →
  Supabase/Neon. pg-boss lives inside the same Postgres. Free-tier footprint: 1 static host +
  1 small Node host + 1 Postgres. No Redis, no separate worker fleet.

---

## Reference specs

| File | Drives |
|---|---|
| `reference/REVEAL_DataSchema_v2.html` | The database spine (Section 2) |
| `reference/REVEAL_AppFlow_Mockup_v1.html` | Sessions, seal/resume, facilitator + admin flows (Section 3) |
| `reference/REVEAL_ChannelAB_Content_v2.html` | A1–A7 items, B1–B8 tasks, 40-artifact taxonomy (seed data) |
| `reference/REVEAL_Analysis_Report_Templates_v3.html` | Layer-2 rules, scoring constants, Layer-3 slot contract |
| `reference/REVEAL_Design_Signature_v4.html` | The `report_payload` shape + frontend report renderer |

## Next: Step 2

Scaffold the monorepo — `packages/shared` (enums, constants, contracts), the Fastify app skeleton
with the route trees above, the first SQL migration (Section 2), and the seed script that loads
the instrument tables from the reference content.
