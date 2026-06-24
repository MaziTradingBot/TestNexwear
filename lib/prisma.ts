import { PrismaClient } from "@prisma/client";

/**
 * Render Postgres requires SSL. Force `sslmode=require` onto the connection
 * string if it isn't already present, so the app connects even if the env var
 * was pasted without it (otherwise Prisma errors with "Server has closed the
 * connection").
 */
function withSsl(url?: string): string | undefined {
  if (!url) return url;
  if (url.includes("sslmode=")) return url;
  return url + (url.includes("?") ? "&" : "?") + "sslmode=require";
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: withSsl(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
