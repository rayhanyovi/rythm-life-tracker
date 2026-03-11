import "dotenv/config";

import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/rythm?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Keep CLI commands usable before local env is fully populated.
  datasource: {
    url: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
});
