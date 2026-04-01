import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis;

function resolveSqlitePath() {
  const raw = process.env.DATABASE_URL || "file:./dev.db";
  const file = raw.startsWith("file:") ? raw.replace("file:", "") : raw;
  return path.resolve(process.cwd(), file);
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3(
    {
      url: `file:${resolveSqlitePath()}`,
    },
    { timestampFormat: "unixepoch-ms" },
  );

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

