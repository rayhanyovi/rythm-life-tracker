import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

import { Client } from "pg";

const DEFAULT_E2E_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/rythm_e2e?schema=public";
const RETRY_COUNT = 30;
const RETRY_DELAY_MS = 1_000;

function runDockerComposeDb() {
  const result = spawnSync("docker", ["compose", "up", "-d", "db"], {
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error("Unable to start the local Postgres container with Docker Compose.");
  }
}

function getDatabaseName(databaseUrl: URL) {
  const name = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));

  if (!name) {
    throw new Error("E2E database URL must include a database name.");
  }

  return name;
}

function getAdminDatabaseUrl(databaseUrl: URL) {
  const adminUrl = new URL(databaseUrl.toString());
  adminUrl.pathname = "/postgres";
  adminUrl.searchParams.delete("schema");

  return adminUrl.toString();
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function connectWithRetry(connectionString: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_COUNT; attempt += 1) {
    const client = new Client({ connectionString });

    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => undefined);

      if (attempt < RETRY_COUNT) {
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to connect to local Postgres.");
}

async function ensureDatabase() {
  const databaseUrl = new URL(
    process.env.E2E_DATABASE_URL?.trim() || DEFAULT_E2E_DATABASE_URL,
  );
  const databaseName = getDatabaseName(databaseUrl);
  const adminClient = await connectWithRetry(getAdminDatabaseUrl(databaseUrl));

  try {
    const existingDatabase = await adminClient.query(
      "select 1 from pg_database where datname = $1",
      [databaseName],
    );

    if (!existingDatabase.rowCount) {
      await adminClient.query(`create database ${quoteIdentifier(databaseName)}`);
      console.log(`Created local e2e database: ${databaseName}`);
      return;
    }

    console.log(`Local e2e database is ready: ${databaseName}`);
  } finally {
    await adminClient.end();
  }
}

async function main() {
  runDockerComposeDb();
  await ensureDatabase();
}

main().catch((error) => {
  console.error("Failed to prepare local e2e database.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
