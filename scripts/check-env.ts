import {
  envFallbacks,
  getAppTimezone,
  getAuthEmailDeliveryConfig,
  getBetterAuthSecret,
  getBetterAuthUrl,
  getDatabaseUrl,
  getDirectUrl,
} from "../lib/env";

const isDeploymentCheck = process.argv.includes("--deployment");

function readEnv(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

function reportSection(title: string, lines: string[]) {
  if (!lines.length) {
    return;
  }

  console.log(`${title}:`);

  for (const line of lines) {
    console.log(`- ${line}`);
  }
}

const issues: string[] = [];
const warnings: string[] = [];

const explicitAuthSecret = readEnv("BETTER_AUTH_SECRET") ?? readEnv("AUTH_SECRET");
const explicitAuthUrl = readEnv("BETTER_AUTH_URL");
const explicitDatabaseUrl = readEnv("DATABASE_URL");
const explicitTimezone = readEnv("NEXT_PUBLIC_APP_TIMEZONE");
const authEmailDeliveryConfig = getAuthEmailDeliveryConfig();

let resolvedAuthUrl = "";
let resolvedTimezone = "";

try {
  resolvedAuthUrl = getBetterAuthUrl();
  getBetterAuthSecret();
  getDatabaseUrl();
  resolvedTimezone = getAppTimezone();
} catch (error) {
  issues.push(error instanceof Error ? error.message : "Environment resolution failed.");
}

if (!issues.length) {
  if (!explicitAuthSecret) {
    warnings.push("BETTER_AUTH_SECRET is not set; local fallback secret is active.");
  }

  if (!explicitAuthUrl) {
    warnings.push(`BETTER_AUTH_URL is not set; using local fallback ${envFallbacks.authUrl}.`);
  }

  if (!explicitDatabaseUrl) {
    warnings.push("DATABASE_URL is not set; local fallback Postgres URL is active.");
  }

  if (!explicitTimezone) {
    warnings.push(
      `NEXT_PUBLIC_APP_TIMEZONE is not set; defaulting to ${envFallbacks.timeZone}.`,
    );
  }

  if (authEmailDeliveryConfig.isPartiallyConfigured) {
    warnings.push(
      "AUTH_EMAIL_FROM and RESEND_API_KEY should be configured together; auth email delivery is partially configured.",
    );
  }

  if (!authEmailDeliveryConfig.isConfigured) {
    warnings.push(
      "Auth email delivery is not fully configured; verification and password reset emails will fall back to server logs.",
    );
  }

  if (isDeploymentCheck) {
    if (!explicitAuthSecret) {
      issues.push("BETTER_AUTH_SECRET must be explicitly set for deployment.");
    }

    if (!explicitAuthUrl) {
      issues.push("BETTER_AUTH_URL must be explicitly set for deployment.");
    }

    if (!explicitDatabaseUrl) {
      issues.push("DATABASE_URL must be explicitly set for deployment.");
    }

    if (resolvedAuthUrl.startsWith("http://localhost")) {
      issues.push("BETTER_AUTH_URL must not point to localhost for deployment.");
    }

    if (!authEmailDeliveryConfig.isConfigured) {
      issues.push(
        "AUTH_EMAIL_FROM and RESEND_API_KEY must be explicitly set for deployment because verification and password reset emails are part of the MVP auth flow.",
      );
    }
  }
}

if (issues.length) {
  reportSection("Environment issues", issues);
  reportSection("Warnings", warnings);
  process.exit(1);
}

console.log("Environment check passed.");
console.log(`- BETTER_AUTH_URL: ${resolvedAuthUrl}`);
console.log(
  `- BETTER_AUTH_SECRET: ${
    explicitAuthSecret ? "explicitly configured" : "local fallback active"
  }`,
);
console.log(
  `- DATABASE_URL: ${
    explicitDatabaseUrl ? "explicitly configured" : "local fallback active"
  }`,
);
console.log(`- NEXT_PUBLIC_APP_TIMEZONE: ${resolvedTimezone}`);
console.log(
  `- AUTH_EMAIL_DELIVERY: ${
    authEmailDeliveryConfig.isConfigured ? "explicitly configured" : "fallback to server log"
  }`,
);

if (getDirectUrl()) {
  console.log("- DIRECT_URL: configured");
}

reportSection("Warnings", warnings);
