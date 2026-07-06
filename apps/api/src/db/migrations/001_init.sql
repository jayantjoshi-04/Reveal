-- REVEAL · migration 001 · initial schema
-- Spine (student → instance → raw/derived/payload) + operational + instrument.
-- See docs/DEVELOPMENT_BLUEPRINT.md §2 and docs/reference/REVEAL_DataSchema_v2.html.

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

-- ── Enums ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE instance_status    AS ENUM ('in_progress','capture_complete','generated','reviewed','released');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE session_status     AS ENUM ('not_started','in_progress','sealed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE confidence_code    AS ENUM ('CC3','CC2','contradicted','surprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE gap_classification AS ENUM ('real','performed','latent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE gap_kind           AS ENUM ('capability','capacity');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE market_class       AS ENUM ('aligned','drifting_to_market','holding_to_pull');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE resume_frame       AS ENUM ('commercial','impact','mixed','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE staff_role         AS ENUM ('facilitator','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE review_decision    AS ENUM ('pending','approved','flagged','edited');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Spine ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student (
  student_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  program      TEXT,
  institution  TEXT,
  cohort       TEXT,
  consent      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_instance (
  instance_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  schema_version  TEXT NOT NULL DEFAULT '1.0',
  status          instance_status NOT NULL DEFAULT 'in_progress',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  generated_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS raw_capture (
  instance_id  UUID PRIMARY KEY REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  channel_a    JSONB NOT NULL DEFAULT '{}'::jsonb,
  channel_b    JSONB NOT NULL DEFAULT '{}'::jsonb,
  portfolio    JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ONLY the engine writes here. Re-computable from raw_capture.
CREATE TABLE IF NOT EXISTS derived (
  instance_id      UUID PRIMARY KEY REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  engine_version   TEXT NOT NULL,
  findings         JSONB NOT NULL,
  trait_scores     JSONB NOT NULL DEFAULT '[]'::jsonb,
  coherence        JSONB,
  market_tension   JSONB,
  computed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Layer 4 cache. Written ONCE by synthesis; PK makes a second write impossible.
CREATE TABLE IF NOT EXISTS report_payload (
  instance_id   UUID PRIMARY KEY REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  slots         JSONB NOT NULL,
  model         TEXT NOT NULL,
  generated     BOOLEAN NOT NULL DEFAULT true,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Operational ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS capture_session (
  session_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id   UUID NOT NULL REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  session_no    SMALLINT NOT NULL CHECK (session_no IN (1,2,3)),
  status        session_status NOT NULL DEFAULT 'not_started',
  resume_cursor TEXT,
  sealed_at     TIMESTAMPTZ,
  UNIQUE (instance_id, session_no)
);

CREATE TABLE IF NOT EXISTS module_response (
  response_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id   UUID NOT NULL REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  session_no    SMALLINT NOT NULL,
  module_code   TEXT NOT NULL,
  payload       JSONB NOT NULL,
  response_ms   INTEGER,
  sealed        BOOLEAN NOT NULL DEFAULT false,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instance_id, module_code)
);

CREATE TABLE IF NOT EXISTS upload (
  upload_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id  UUID NOT NULL REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  kind         TEXT NOT NULL,
  storage_ref  TEXT NOT NULL,
  meta         JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff (
  staff_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  role         staff_role NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review (
  review_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id      UUID NOT NULL UNIQUE REFERENCES report_instance(instance_id) ON DELETE CASCADE,
  reviewer_id      UUID REFERENCES staff(staff_id),
  decision         review_decision NOT NULL DEFAULT 'pending',
  high_stakes      JSONB DEFAULT '{}'::jsonb,
  facilitator_note TEXT,
  slot_edits       JSONB,
  decided_at       TIMESTAMPTZ
);

-- ── Instrument (admin-editable, versioned) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS instrument_version (
  version_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label        TEXT NOT NULL,
  is_live      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS a_item (
  item_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id    UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  module_code   TEXT NOT NULL,
  seq           SMALLINT NOT NULL,
  prompt        TEXT NOT NULL,
  is_non_design BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS a_option (
  option_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID NOT NULL REFERENCES a_item(item_id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  tag          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS b_task (
  task_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  task_code    TEXT NOT NULL,
  params       JSONB NOT NULL,
  trait_tags   JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS artifact (
  artifact_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  seq          SMALLINT NOT NULL,
  title        TEXT NOT NULL,
  domain       TEXT,
  imp          NUMERIC(3,2) NOT NULL,
  hum          NUMERIC(3,2) NOT NULL,
  st           TEXT NOT NULL,
  pair_code    TEXT,
  image_ref    TEXT
);

CREATE TABLE IF NOT EXISTS scene_asset (
  scene_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  stimulus_id  TEXT NOT NULL,
  image_ref    TEXT,
  zones        JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS rubric_dimension (
  dimension_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  poles        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scoring_constant (
  version_id   UUID NOT NULL REFERENCES instrument_version(version_id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  value        NUMERIC NOT NULL,
  PRIMARY KEY (version_id, key)
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_instance_status   ON report_instance (status);
CREATE INDEX IF NOT EXISTS idx_instance_student  ON report_instance (student_id);
CREATE INDEX IF NOT EXISTS idx_student_cohort    ON student (cohort);
CREATE INDEX IF NOT EXISTS idx_session_instance  ON capture_session (instance_id);
CREATE INDEX IF NOT EXISTS idx_response_instance ON module_response (instance_id);
CREATE INDEX IF NOT EXISTS idx_review_decision   ON review (decision);
CREATE INDEX IF NOT EXISTS idx_derived_findings_gin ON derived USING GIN (findings jsonb_path_ops);

-- ── Integrity · reject writes to a sealed module_response ───────────────────
CREATE OR REPLACE FUNCTION reject_sealed_module_update() RETURNS trigger AS $$
BEGIN
  IF OLD.sealed = true AND NEW.payload IS DISTINCT FROM OLD.payload THEN
    RAISE EXCEPTION 'module_response % is sealed and cannot be modified', OLD.module_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reject_sealed_module ON module_response;
CREATE TRIGGER trg_reject_sealed_module
  BEFORE UPDATE ON module_response
  FOR EACH ROW EXECUTE FUNCTION reject_sealed_module_update();
