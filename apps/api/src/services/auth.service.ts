/**
 * Authentication service. Passwords are bcrypt-hashed on write and compared on
 * read; email verification uses a short code (dev returns it so the flow works
 * without an email provider). Facilitator is retired — staff are all admins.
 */
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { BadRequest, Conflict, HttpError } from './errors.js';
import { sendVerificationEmail } from './email.service.js';
import type { Staff, Student } from '@reveal/shared';

const ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}
export function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(plain, hash);
}

function makeCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

export interface SignupInput {
  name: string;
  email: string;
  username: string;
  password: string;
  gender?: string;
  dob?: string;
  institution?: string;
  domain_of_interest?: string;
  cohort?: string;
}

/**
 * Best-effort verification email. Never throws — a provider outage must not
 * break signup; the failure is logged and reflected in the returned flag.
 */
async function emailCode(to: string, name: string, code: string): Promise<boolean> {
  try {
    const via = await sendVerificationEmail(to, name, code);
    return via !== 'console';
  } catch (err) {
    console.error(`[auth] verification email to ${to} failed: ${(err as Error).message}`);
    return false;
  }
}

/** Create an unverified student and email the verification code. */
export async function signup(
  input: SignupInput,
): Promise<{ student: Student; devVerificationCode?: string; emailSent: boolean }> {
  const dupe = await db().query('SELECT 1 FROM student WHERE email = $1 OR username = $2', [input.email, input.username]);
  if (dupe.rowCount) throw new Conflict('email or username already registered');

  const password_hash = await hashPassword(input.password);
  const code = makeCode();
  const { rows } = await db().query<Student>(
    `INSERT INTO student (name, email, username, password_hash, gender, dob, institution, domain_of_interest, cohort, verification_code, email_verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false)
     RETURNING student_id, name, email, cohort, created_at`,
    [
      input.name,
      input.email,
      input.username,
      password_hash,
      // Empty strings from optional form fields → NULL (a DATE column rejects "").
      input.gender || null,
      input.dob || null,
      input.institution || null,
      input.domain_of_interest || null,
      input.cohort || null,
      code,
    ],
  );
  const emailSent = await emailCode(input.email, input.name, code);
  // The code travels by email. In non-production we also return it so the local
  // dev flow can auto-fill without a mail provider; never in production.
  return { student: rows[0]!, devVerificationCode: env().NODE_ENV === 'production' ? undefined : code, emailSent };
}

/**
 * Re-send the verification code to an unverified account. Silent for unknown or
 * already-verified emails so it can't be used to probe who has an account.
 */
export async function resendVerification(email: string): Promise<{ emailSent: boolean }> {
  const { rows } = await db().query<{ name: string; verification_code: string | null; email_verified: boolean }>(
    'SELECT name, verification_code, email_verified FROM student WHERE email = $1',
    [email],
  );
  const row = rows[0];
  if (!row || row.email_verified) return { emailSent: false };

  // Reissue a fresh code so a lost/expired one is replaced.
  const code = makeCode();
  await db().query('UPDATE student SET verification_code = $1 WHERE email = $2', [code, email]);
  const emailSent = await emailCode(email, row.name, code);
  return { emailSent };
}

export async function verifyEmail(email: string, code: string): Promise<void> {
  const { rows } = await db().query<{ verification_code: string | null; email_verified: boolean }>(
    'SELECT verification_code, email_verified FROM student WHERE email = $1',
    [email],
  );
  const row = rows[0];
  if (!row) throw new HttpError(404, 'no account for that email');
  if (row.email_verified) return;
  if (!row.verification_code || row.verification_code !== code) throw new BadRequest('incorrect verification code');
  await db().query('UPDATE student SET email_verified = true, verification_code = NULL WHERE email = $1', [email]);
}

/** Sign in with username OR email + password. */
export async function signinStudent(identifier: string, password: string): Promise<Student> {
  const { rows } = await db().query<Student & { password_hash: string | null; account_status: string; email_verified: boolean }>(
    'SELECT * FROM student WHERE username = $1 OR email = $1',
    [identifier],
  );
  const s = rows[0];
  if (!s || !(await verifyPassword(password, s.password_hash))) throw new HttpError(401, 'invalid credentials');
  if (s.account_status !== 'active') throw new HttpError(403, 'account is not active');
  return s;
}

export async function signinAdmin(username: string, password: string): Promise<Staff> {
  const { rows } = await db().query<Staff & { password_hash: string | null }>(
    "SELECT * FROM staff WHERE (username = $1 OR email = $1) AND role = 'admin'",
    [username],
  );
  const a = rows[0];
  if (!a || !(await verifyPassword(password, a.password_hash))) throw new HttpError(401, 'invalid admin credentials');
  return a;
}
