/**
 * Auth. Students sign in with their details (email is the login key); staff sign
 * in by email against the seeded staff table. Pilot-simple — a production build
 * would add magic-link email verification (MAGIC_LINK_TTL_MIN is reserved).
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { getOrCreateStudent } from '../../repositories/instance.repo.js';
import type { Staff } from '@reveal/shared';

const studentBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  program: z.string().optional(),
  institution: z.string().optional(),
  cohort: z.string().optional(),
});

const staffBody = z.object({ email: z.string().email() });

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/student', async (req, reply) => {
    const body = studentBody.parse(req.body);
    const student = await getOrCreateStudent(body);
    const token = app.jwt.sign({ sub: student.student_id, role: 'student', name: student.name });
    return reply.send({ token, student });
  });

  app.post('/auth/staff', async (req, reply) => {
    const { email } = staffBody.parse(req.body);
    const { rows } = await db().query<Staff>('SELECT * FROM staff WHERE email = $1', [email]);
    const staff = rows[0];
    if (!staff) return reply.code(404).send({ error: 'staff not found' });
    const token = app.jwt.sign({ sub: staff.staff_id, role: staff.role, name: staff.name });
    return reply.send({ token, staff });
  });
}
