import "dotenv/config";

import { defineConfig } from "prisma/config";
import { getDatabaseUrl } from "./lib/env";

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
