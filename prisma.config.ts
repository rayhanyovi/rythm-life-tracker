import { existsSync } from "node:fs";

import { config as loadEnv } from "dotenv";

import { defineConfig } from "prisma/config";
import { getDatabaseUrl, getDirectUrl } from "./lib/env";

for (const path of [".env.local", ".env"]) {
  if (existsSync(path)) {
    loadEnv({ path, override: false });
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Keep CLI commands usable before local env is fully populated.
  datasource: {
    url: getDatabaseUrl(),
    // Prisma 7 defineConfig type lags behind the runtime — `directUrl` is not yet
    // in the TS type but IS supported (and required for Neon PgBouncer). Spread as
    // Record until @prisma/config ships the updated type.
    // See: https://pris.ly/d/config-datasource
    ...({ directUrl: getDirectUrl() } as Record<string, string>),
  },
});
