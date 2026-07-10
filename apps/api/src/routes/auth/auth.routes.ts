/**
 * Auth routes. Students: signup → verify email → signin. Admins: admin/signin.
 * Passwords are bcrypt-hashed; JWTs carry {sub, role} and expire.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../../config/env.js';
import * as auth from '../../services/auth.service.js';

const signupBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_.]+$/, 'letters, numbers, _ or . only'),
  password: z.string().min(8, 'at least 8 characters'),
  gender: z.string().optional(),
  dob: z.string().optional(),
  institution: z.string().optional(),
  domain_of_interest: z.string().optional(),
  cohort: z.string().optional(),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const signOpts = { expiresIn: env().JWT_EXPIRES_IN };

  app.post('/auth/signup', async (req, reply) => {
    const body = signupBody.parse(req.body);
    const { student, devVerificationCode } = await auth.signup(body);
    return reply.send({ student, devVerificationCode });
  });

  app.post('/auth/verify', async (req, reply) => {
    const { email, code } = z.object({ email: z.string().email(), code: z.string() }).parse(req.body);
    await auth.verifyEmail(email, code);
    return reply.send({ ok: true, verified: true });
  });

  app.post('/auth/signin', async (req, reply) => {
    const { identifier, password } = z.object({ identifier: z.string().min(1), password: z.string() }).parse(req.body);
    const student = await auth.signinStudent(identifier, password);
    const token = app.jwt.sign({ sub: student.student_id, role: 'student', name: student.name }, signOpts);
    return reply.send({ token, student: { student_id: student.student_id, name: student.name, email: student.email } });
  });

  app.post('/auth/admin/signin', async (req, reply) => {
    const { username, password } = z.object({ username: z.string().min(1), password: z.string() }).parse(req.body);
    const admin = await auth.signinAdmin(username, password);
    const token = app.jwt.sign({ sub: admin.staff_id, role: 'admin', name: admin.name }, signOpts);
    return reply.send({ token, admin: { staff_id: admin.staff_id, name: admin.name, email: admin.email } });
  });
}
