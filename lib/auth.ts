import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";

const fallbackBaseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const fallbackUrl = new URL(fallbackBaseUrl);
const fallbackProtocol = fallbackBaseUrl.startsWith("https://")
  ? "https"
  : "http";
const allowedHosts = [...new Set(["localhost:3000", fallbackUrl.host, "*.vercel.app"])];
const trustedOrigins = [
  ...new Set(["http://localhost:3000", fallbackUrl.origin, "https://*.vercel.app"]),
];
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  process.env.AUTH_SECRET ??
  (!process.env.VERCEL
    ? "rythm-local-build-secret-change-me-before-deploy"
    : undefined);

if (!authSecret) {
  throw new Error(
    "BETTER_AUTH_SECRET must be set for Vercel preview and production deployments.",
  );
}

export const auth = betterAuth({
  appName: "Rythm",
  secret: authSecret,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: {
    allowedHosts,
    fallback: fallbackBaseUrl,
    protocol: fallbackProtocol,
  },
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [nextCookies()],
});
