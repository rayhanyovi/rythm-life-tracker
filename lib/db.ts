import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prismaAdapter?: PrismaPg;
  prisma?: PrismaClient;
};

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/rythm?schema=public";

const adapter =
  globalForPrisma.prismaAdapter ??
  new PrismaPg({
    connectionString,
  });

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAdapter = adapter;
  globalForPrisma.prisma = db;
}
