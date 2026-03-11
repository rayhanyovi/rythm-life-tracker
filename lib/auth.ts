import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";

const fallbackBaseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const fallbackProtocol = fallbackBaseUrl.startsWith("https://")
  ? "https"
  : "http";

export const auth = betterAuth({
  appName: "Rythm",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: {
    allowedHosts: ["localhost:3000", "*.vercel.app"],
    fallback: fallbackBaseUrl,
    protocol: fallbackProtocol,
  },
  trustedOrigins: ["http://localhost:3000", "https://*.vercel.app"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [nextCookies()],
});
