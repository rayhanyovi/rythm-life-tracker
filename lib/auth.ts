import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/auth-email";
import { db } from "@/lib/db";
import {
  getBetterAuthAllowedHosts,
  getBetterAuthSecret,
  getBetterAuthTrustedOrigins,
  getBetterAuthUrl,
  isLocalEmailVerificationBypassEnabled,
} from "@/lib/env";

const fallbackBaseUrl = getBetterAuthUrl();
const fallbackProtocol = fallbackBaseUrl.startsWith("https://") ? "https" : "http";
const skipEmailVerificationInDev = isLocalEmailVerificationBypassEnabled();

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
    requireEmailVerification: !skipEmailVerificationInDev,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ url, user }) => {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60,
    sendOnSignIn: !skipEmailVerificationInDev,
    sendOnSignUp: !skipEmailVerificationInDev,
    sendVerificationEmail: async ({ url, user }) => {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationUrl: url,
      });
    },
  },
  plugins: [nextCookies()],
});
