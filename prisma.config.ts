import { existsSync } from "node:fs";

import { config as loadEnv } from "dotenv";

import { defineConfig } from "prisma/config";
import { getDatabaseUrl } from "./lib/env";

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
  },
});
