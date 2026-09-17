// Prisma client — Prisma Postgres via @prisma/adapter-pg (v7 pattern)
// https://pris.ly/d/prisma7-client-config

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set — add it to .env.local (local) or Vercel env vars (prod).');
}

// avoid instantiating too many clients during Next.js hot reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
