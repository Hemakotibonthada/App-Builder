/**
 * Prisma Client Singleton
 * 
 * Ensures a single PrismaClient instance is used across the application.
 * In development, the client is cached on `globalThis` to survive HMR reloads.
 * 
 * Prisma 7 uses the "client" engine by default, which requires a driver adapter.
 * We use @prisma/adapter-better-sqlite3 for local SQLite.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
