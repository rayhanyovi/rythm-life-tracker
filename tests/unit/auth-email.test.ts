import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/auth-email";

async function withEnv(
  updates: Record<string, string | undefined>,
  run: () => Promise<void>,
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
    return await run();
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

describe("auth email delivery", () => {
  it("falls back to console preview when provider env is missing", async () => {
    const originalInfo = console.info;
    const originalFetch = global.fetch;
    let loggedPayload: unknown[] | null = null;
    let fetchCalled = false;

    console.info = (...args: unknown[]) => {
      loggedPayload = args;
    };
    global.fetch = (async () => {
      fetchCalled = true;
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    try {
      await withEnv(
        {
          AUTH_EMAIL_FROM: undefined,
          RESEND_API_KEY: undefined,
        },
        async () => {
          await sendPasswordResetEmail({
            email: "user@example.com",
            name: "Rythm User",
            resetUrl: "https://app.rythm.test/reset-password?token=abc",
          });
        },
      );
    } finally {
      console.info = originalInfo;
      global.fetch = originalFetch;
    }

    assert.equal(fetchCalled, false);
    assert.ok(loggedPayload);
    assert.equal(loggedPayload?.[0], "[Rythm auth email fallback]");
  });

  it("uses Resend when email env is configured", async () => {
    const originalFetch = global.fetch;
    const fetchCalls: Array<{
      init: RequestInit | undefined;
      input: string;
    }> = [];

    global.fetch = (async (input, init?: RequestInit) => {
      fetchCalls.push({ init, input: String(input) });

      return new Response(JSON.stringify({ id: "email_123" }), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      });
    }) as typeof fetch;

    try {
      await withEnv(
        {
          AUTH_EMAIL_FROM: "Rythm <auth@rythm.test>",
          RESEND_API_KEY: "re_test_key",
        },
        async () => {
          await sendPasswordResetEmail({
            email: "user@example.com",
            name: "Rythm User",
            resetUrl: "https://app.rythm.test/reset-password?token=abc",
          });
        },
      );
    } finally {
      global.fetch = originalFetch;
    }

    assert.equal(fetchCalls.length, 1);
    assert.equal(fetchCalls[0]?.input, "https://api.resend.com/emails");
    assert.equal(
      (fetchCalls[0]?.init?.headers as Record<string, string>)?.Authorization,
      "Bearer re_test_key",
    );
    assert.match(String(fetchCalls[0]?.init?.body), /Reset your Rythm password/);
  });

  it("falls back to console preview for verification email when provider env is missing", async () => {
    const originalInfo = console.info;
    let loggedPayload: unknown[] | null = null;

    console.info = (...args: unknown[]) => {
      loggedPayload = args;
    };

    try {
      await withEnv(
        {
          AUTH_EMAIL_FROM: undefined,
          RESEND_API_KEY: undefined,
        },
        async () => {
          await sendVerificationEmail({
            email: "user@example.com",
            name: "Rythm User",
            verificationUrl: "https://app.rythm.test/api/auth/verify-email?token=abc",
          });
        },
      );
    } finally {
      console.info = originalInfo;
    }

    assert.ok(loggedPayload);
    assert.equal(loggedPayload?.[0], "[Rythm auth email fallback]");
    assert.match(JSON.stringify(loggedPayload?.[1]), /verificationUrl/);
  });
});
