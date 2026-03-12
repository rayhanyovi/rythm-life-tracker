const DEFAULT_APP_TIMEZONE = "Asia/Jakarta";
const LOCAL_AUTH_URL = "http://localhost:3000";
const LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/rythm?schema=public";
const LOCAL_AUTH_SECRET = "rythm-local-build-secret-change-me-before-deploy";

function readEnv(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

export function isVercelRuntime() {
  return Boolean(readEnv("VERCEL"));
}

export function getAppTimezone() {
  return readEnv("NEXT_PUBLIC_APP_TIMEZONE") ?? DEFAULT_APP_TIMEZONE;
}

export function getBetterAuthUrl() {
  return readEnv("BETTER_AUTH_URL") ?? LOCAL_AUTH_URL;
}

export function getBetterAuthSecret() {
  const explicitSecret = readEnv("BETTER_AUTH_SECRET") ?? readEnv("AUTH_SECRET");

  if (explicitSecret) {
    return explicitSecret;
  }

  if (!isVercelRuntime()) {
    return LOCAL_AUTH_SECRET;
  }

  throw new Error(
    "BETTER_AUTH_SECRET must be set for Vercel preview and production deployments.",
  );
}

export function getDatabaseUrl(options?: { allowLocalFallback?: boolean }) {
  const explicitUrl = readEnv("DATABASE_URL");

  if (explicitUrl) {
    return explicitUrl;
  }

  if (options?.allowLocalFallback !== false && !isVercelRuntime()) {
    return LOCAL_DATABASE_URL;
  }

  throw new Error(
    "DATABASE_URL must be set for Vercel preview and production deployments.",
  );
}

export function getDirectUrl() {
  return readEnv("DIRECT_URL");
}

export function getAuthEmailFrom() {
  return readEnv("AUTH_EMAIL_FROM");
}

export function getResendApiKey() {
  return readEnv("RESEND_API_KEY");
}

export function getAuthEmailDeliveryConfig() {
  const from = getAuthEmailFrom();
  const resendApiKey = getResendApiKey();

  return {
    from,
    isConfigured: Boolean(from && resendApiKey),
    isPartiallyConfigured: Boolean(from || resendApiKey) && !(from && resendApiKey),
    resendApiKey,
  };
}

export function isDevEmailVerificationBypassRequested() {
  return readEnv("RYTHM_DEV_SKIP_EMAIL_VERIFICATION") === "true";
}

export function isLocalEmailVerificationBypassEnabled() {
  return isDevEmailVerificationBypassRequested() && !isVercelRuntime();
}

export function getBetterAuthAllowedHosts() {
  const authUrl = new URL(getBetterAuthUrl());

  return [...new Set(["localhost:3000", authUrl.host, "*.vercel.app"])];
}

export function getBetterAuthTrustedOrigins() {
  const authUrl = new URL(getBetterAuthUrl());

  return [
    ...new Set(["http://localhost:3000", authUrl.origin, "https://*.vercel.app"]),
  ];
}

export const envFallbacks = {
  authSecret: LOCAL_AUTH_SECRET,
  authUrl: LOCAL_AUTH_URL,
  databaseUrl: LOCAL_DATABASE_URL,
  timeZone: DEFAULT_APP_TIMEZONE,
};
