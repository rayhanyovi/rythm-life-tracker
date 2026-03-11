import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  envFallbacks,
  getAppTimezone,
  getBetterAuthSecret,
  getBetterAuthUrl,
  getDatabaseUrl,
} from "@/lib/env";

function withEnv<T>(
  updates: Record<string, string | undefined>,
  run: () => T,
) {
  const previousValues = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(updates)) {
    previousValues.set(key, process.env[key]);

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return run();
  } finally {
    for (const [key, value] of previousValues.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

describe("env helpers", () => {
  it("uses local fallbacks outside Vercel", () => {
    withEnv(
      {
        AUTH_SECRET: undefined,
        BETTER_AUTH_SECRET: undefined,
        BETTER_AUTH_URL: undefined,
        DATABASE_URL: undefined,
        NEXT_PUBLIC_APP_TIMEZONE: undefined,
        VERCEL: undefined,
      },
      () => {
        assert.equal(getBetterAuthSecret(), envFallbacks.authSecret);
        assert.equal(getBetterAuthUrl(), envFallbacks.authUrl);
        assert.equal(getDatabaseUrl(), envFallbacks.databaseUrl);
        assert.equal(getAppTimezone(), envFallbacks.timeZone);
      },
    );
  });

  it("requires explicit auth secret on Vercel", () => {
    withEnv(
      {
        AUTH_SECRET: undefined,
        BETTER_AUTH_SECRET: undefined,
        VERCEL: "1",
      },
      () => {
        assert.throws(() => getBetterAuthSecret(), /BETTER_AUTH_SECRET/);
      },
    );
  });

  it("requires explicit database url on Vercel when fallback is unavailable", () => {
    withEnv(
      {
        DATABASE_URL: undefined,
        VERCEL: "1",
      },
      () => {
        assert.throws(() => getDatabaseUrl(), /DATABASE_URL/);
      },
    );
  });
});

