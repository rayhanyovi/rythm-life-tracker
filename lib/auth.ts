import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import {
  getBetterAuthAllowedHosts,
  getBetterAuthSecret,
  getBetterAuthTrustedOrigins,
  getBetterAuthUrl,
} from "@/lib/env";

const fallbackBaseUrl = getBetterAuthUrl();
const fallbackProtocol = fallbackBaseUrl.startsWith("https://") ? "https" : "http";

export const auth = betterAuth({
  appName: "Rythm",
  secret: getBetterAuthSecret(),
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: {
    allowedHosts: getBetterAuthAllowedHosts(),
    fallback: fallbackBaseUrl,
    protocol: fallbackProtocol,
  },
  trustedOrigins: getBetterAuthTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [nextCookies()],
});
