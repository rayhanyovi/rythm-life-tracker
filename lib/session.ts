import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export type AppSession = typeof auth.$Infer.Session;

type HeaderReader = {
  get(name: string): string | null;
};

function getBypassSession(headerReader: HeaderReader): AppSession | null {
  if (process.env.RYTHM_E2E_AUTH_BYPASS !== "true") {
    return null;
  }

  const userId = headerReader.get("x-rythm-e2e-user-id");

  if (!userId) {
    return null;
  }

  const now = new Date();

  return {
    session: {
      createdAt: now,
      expiresAt: new Date(now.getTime() + 86_400_000),
      id: "e2e-session",
      ipAddress: null,
      token: "e2e-session-token",
      updatedAt: now,
      userAgent: "playwright",
      userId,
    },
    user: {
      createdAt: now,
      email: headerReader.get("x-rythm-e2e-user-email") ?? "e2e@rythm.local",
      emailVerified: true,
      id: userId,
      image: null,
      name: headerReader.get("x-rythm-e2e-user-name") ?? "E2E User",
      updatedAt: now,
    },
  } as AppSession;
}

const getCachedSession = cache(async () => {
  const requestHeaders = await headers();
  const bypassSession = getBypassSession(requestHeaders);

  if (bypassSession) {
    return bypassSession;
  }

  return auth.api.getSession({
    headers: requestHeaders,
  });
});

export const sessionApi = {
  getSession: getCachedSession,
  async getSessionFromRequest(request: Request) {
    const bypassSession = getBypassSession(request.headers);

    if (bypassSession) {
      return bypassSession;
    }

    return auth.api.getSession({
      headers: request.headers,
    });
  },
  async requireSession() {
    const session = await sessionApi.getSession();

    if (!session) {
      redirect("/sign-in");
    }

    return session;
  },
  async redirectIfAuthenticated() {
    const session = await sessionApi.getSession();

    if (session) {
      redirect("/dashboard");
    }
  },
};

export const getSession = sessionApi.getSession;

export async function getSessionFromRequest(request: Request) {
  return sessionApi.getSessionFromRequest(request);
}

export async function requireSession() {
  return sessionApi.requireSession();
}

export async function redirectIfAuthenticated() {
  return sessionApi.redirectIfAuthenticated();
}
