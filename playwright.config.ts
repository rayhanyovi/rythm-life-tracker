import { defineConfig, devices } from "@playwright/test";

const appPort = Number(
  process.env.PLAYWRIGHT_APP_PORT ??
    (process.env.RYTHM_E2E_AUTH_BYPASS === "true" ? "3100" : "3000"),
);
const appBaseUrl = `http://localhost:${appPort}`;
const webServerCommand =
  process.env.RYTHM_E2E_AUTH_BYPASS === "true"
    ? `cross-env NEXT_DIST_DIR=.next-e2e npm run dev -- --port ${appPort}`
    : `npm run dev -- --port ${appPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: appBaseUrl,
    serviceWorkers: "allow",
    trace: "on-first-retry",
  },
  webServer: {
    command: webServerCommand,
    port: appPort,
    reuseExistingServer:
      !process.env.CI && process.env.RYTHM_E2E_AUTH_BYPASS !== "true",
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
});
