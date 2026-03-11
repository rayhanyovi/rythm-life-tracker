import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { chromium, devices } from "@playwright/test";

import {
  e2eAuthHeaders,
  mockAuthenticatedAppApi,
} from "../tests/e2e/helpers/app-mocks";

const port = Number(process.env.QA_PORT ?? "3201");
const baseUrl = `http://localhost:${port}`;
const outputRoot = join(
  process.cwd(),
  ".artifacts",
  "manual-layout-review",
  new Date().toISOString().replaceAll(":", "-"),
);

function createDevCommand() {
  const command = `npm run dev -- --port ${port}`;

  if (process.platform === "win32") {
    return {
      command: "cmd",
      args: ["/c", command],
    };
  }

  return {
    command: "sh",
    args: ["-lc", command],
  };
}

async function waitForServerReady(timeoutMs = 120_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/sign-in`);

      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for dev server at ${baseUrl}.`);
}

async function captureDeviceScreenshots() {
  const browser = await chromium.launch();
  const outputs: string[] = [];

  try {
    const deviceEntries = [
      {
        key: "desktop",
        options: devices["Desktop Chrome"],
      },
      {
        key: "mobile",
        options: devices["Pixel 7"],
      },
    ] as const;

    for (const device of deviceEntries) {
      const publicContext = await browser.newContext({
        ...device.options,
        baseURL: baseUrl,
      });
      const publicPage = await publicContext.newPage();

      await publicPage.goto("/sign-in");
      const signInPath = join(outputRoot, `${device.key}-sign-in.png`);
      await publicPage.screenshot({
        fullPage: true,
        path: signInPath,
      });
      outputs.push(signInPath);
      await publicContext.close();

      const authedContext = await browser.newContext({
        ...device.options,
        baseURL: baseUrl,
        extraHTTPHeaders: e2eAuthHeaders,
      });

      for (const route of ["dashboard", "quests", "categories", "history"]) {
        const page = await authedContext.newPage();
        await mockAuthenticatedAppApi(page);
        await page.goto(`/${route}`);
        const screenshotPath = join(outputRoot, `${device.key}-${route}.png`);
        await page.screenshot({
          fullPage: true,
          path: screenshotPath,
        });
        outputs.push(screenshotPath);
        await page.close();
      }

      await authedContext.close();
    }

    return outputs;
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(outputRoot, {
    recursive: true,
  });

  const devCommand = createDevCommand();
  const server = spawn(devCommand.command, devCommand.args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      BETTER_AUTH_URL: baseUrl,
      NEXT_DIST_DIR: ".next-manual",
      NEXT_PUBLIC_PWA_DEV_ENABLED: "true",
      RYTHM_E2E_AUTH_BYPASS: "true",
    },
    stdio: "ignore",
  });

  try {
    await waitForServerReady();
    const outputs = await captureDeviceScreenshots();

    console.log("Manual layout review screenshots generated:");

    for (const output of outputs) {
      console.log(`- ${output}`);
    }
  } finally {
    server.kill();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

