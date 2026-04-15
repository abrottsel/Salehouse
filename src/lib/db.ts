import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 client singleton.
 *
 * Prisma 7 dropped the old "read DATABASE_URL at runtime from the
 * generated client" model. Instead, you pass an explicit driver
 * adapter (here: @prisma/adapter-pg, which wraps node-postgres) and
 * the adapter owns the connection URL. The schema.prisma file only
 * declares the provider, and prisma.config.ts wires the env var for
 * CLI operations (migrate, db push, etc).
 *
 * Single instance per worker — Next.js dev hot-reloads modules, so we
 * stash the client on globalThis to avoid exhausting Postgres slots.
 * In prod (standalone build) this module is loaded once per worker.
 *
 * Lazy connection: the pool does NOT connect until the first query.
 * A missing DATABASE_URL therefore does not crash cold boot; the first
 * query throws, and /api/leads catches and degrades to Telegram-only.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Let the module load so the build doesn't crash — throw only on
    // first query. Route handlers wrap in try/catch and degrade.
    console.warn("[lib/db] DATABASE_URL is not set — Prisma will throw on first query");
  }

  const adapter = new PrismaPg({
    connectionString: connectionString ?? "postgresql://invalid",
    max: 5,           // modest pool for a 4 GB single-node box
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Best-effort health ping — returns true if Postgres is reachable and
 * the zemplus DB accepts queries. Used by /api/leads to decide whether
 * to write-first-to-DB or fall back to Telegram-only delivery.
 */
export async function isDbHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
