import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Supabase transaction pooler (PgBouncer) does not support Prisma's default
 * prepared statements → Postgres 42P05 "prepared statement s0 already exists".
 * Prisma disables them when `pgbouncer=true` is on the URL.
 */
function databaseUrlForPrisma(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  const lower = raw.toLowerCase();
  if (!lower.includes("pooler.supabase.com")) return raw;
  if (lower.includes("pgbouncer=true")) return raw;
  return raw + (raw.includes("?") ? "&" : "?") + "pgbouncer=true";
}

const resolvedUrl =
  databaseUrlForPrisma(process.env.DATABASE_URL) ||
  process.env.DATABASE_URL ||
  "";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: resolvedUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
