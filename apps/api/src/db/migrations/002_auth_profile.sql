-- REVEAL · migration 002 · student credentials + profile, staff passwords
-- Adds real auth (bcrypt hashes) and the signup profile fields.

-- ── student: credentials + profile ─────────────────────────────────────────
ALTER TABLE student ADD COLUMN IF NOT EXISTS username           TEXT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS password_hash      TEXT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS gender             TEXT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS dob                DATE;
ALTER TABLE student ADD COLUMN IF NOT EXISTS domain_of_interest TEXT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS email_verified     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE student ADD COLUMN IF NOT EXISTS verification_code  TEXT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS account_status     TEXT NOT NULL DEFAULT 'active';

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_username ON student (username) WHERE username IS NOT NULL;

-- ── staff (now admins): password ───────────────────────────────────────────
ALTER TABLE staff ADD COLUMN IF NOT EXISTS username      TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_username ON staff (username) WHERE username IS NOT NULL;
