/** JWT auth decorators & role guards. */
import type { FastifyReply, FastifyRequest } from 'fastify';

export interface AuthUser {
  sub: string; // student_id or staff_id
  role: 'student' | 'facilitator' | 'admin';
  name?: string;
}

// @fastify/jwt owns the `user` property on FastifyRequest — augment its type.
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

/** preHandler: require a valid JWT of one of the allowed roles. */
export function requireRole(...roles: AuthUser['role'][]) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const payload = await req.jwtVerify<AuthUser>();
      if (!roles.includes(payload.role)) {
        await reply.code(403).send({ error: 'forbidden', message: `requires role: ${roles.join(' | ')}` });
        return;
      }
      req.user = payload;
    } catch {
      await reply.code(401).send({ error: 'unauthorized' });
    }
  };
}

export const requireStudent = requireRole('student');
// Facilitator is retired — its functionality lives in the admin portal now.
export const requireFacilitator = requireRole('admin');
export const requireAdmin = requireRole('admin');
