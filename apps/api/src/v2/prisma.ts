/** Prisma client singleton for the v2 data model. */
import { PrismaClient } from '@prisma/client';

let client: PrismaClient | null = null;

export function prisma(): PrismaClient {
  if (!client) client = new PrismaClient();
  return client;
}
