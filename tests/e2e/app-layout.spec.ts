import { expect, test, type Page } from "@playwright/test";

import {
  e2eAuthHeaders,
  mockAuthenticatedAppApi,
} from "./helpers/app-mocks";

async function expectNoHorizontalOverflow(page: Page) {
  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  expect(hasHorizontalOverflow).toBeFalsy();
}

test.describe("authenticated app shell", () => {
  test.use({
    extraHTTPHeaders: e2eAuthHeaders,
  });

  test("dashboard layout stays usable on mobile and desktop", async ({
    isMobile,
    page,
  }) => {
    await mockAuthenticatedAppApi(page);
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: "Today", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Morning Run").first()).toBeVisible();
    await expect(page.getByLabel("Filter by list")).toBeVisible();
    await expect(page.getByText("Show inactive")).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /open workspace navigation/i }).click();
      await expect(
        page.getByRole("link", { name: /^Today\b/i }),
      ).toBeVisible();
    } else {
      await expect(page.getByText("Tasks workspace")).toBeVisible();
      await expect(page.getByText("Personal workspace")).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  });

  test("upcoming screen keeps date groups and filters usable", async ({
    isMobile,
    page,
  }) => {
    await mockAuthenticatedAppApi(page);
    await page.goto("/upcoming");

    await expect(
      page.getByRole("heading", { name: "Upcoming", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Morning Run").first()).toBeVisible();
    await expect(page.getByLabel("Horizon")).toBeVisible();
    await expect(page.getByLabel("Habit list")).toBeVisible();
    await expect(page.getByLabel("Cadence")).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /open workspace navigation/i }).click();
      await expect(
        page.getByRole("link", { name: /^Upcoming\b/i }),
      ).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  });

  test("calendar screen keeps month grid and selected agenda usable", async ({
    isMobile,
    page,
  }) => {
    await mockAuthenticatedAppApi(page);
    await page.goto("/calendar");

    await expect(
      page.getByRole("heading", { name: "Calendar", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("March 2026").first()).toBeVisible();
    await expect(page.getByText("Morning Run").first()).toBeVisible();
    await expect(page.getByLabel("Habit list")).toBeVisible();
    await expect(page.getByLabel("Cadence")).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /open workspace navigation/i }).click();
      await expect(
        page.getByRole("link", { name: /^Calendar\b/i }),
      ).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  });

  test("quests screen keeps filters and form shell accessible", async ({
    isMobile,
    page,
  }) => {
    await mockAuthenticatedAppApi(page);
    await page.goto("/quests");

    await expect(
      page.getByRole("heading", {
        name: "Lists",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText("Morning Run").first()).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /filter tasks by list/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /filter tasks by type/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /add task/i }).click();
    await expect(page.getByRole("heading", { name: /create task/i })).toBeVisible();
    await expect(page.locator("#list-task-title")).toBeVisible();
    await expect(page.locator("#list-task-category")).toBeVisible();
    await expect(page.locator("#list-task-type")).toBeVisible();
    await expect(page.getByText("Task is active")).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /close/i }).click();
      await page.getByRole("button", { name: /open workspace navigation/i }).click();
      await expect(
        page.getByRole("link", { name: /^Lists\b/i }),
      ).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  });

  test("categories screen keeps management and starter pack panels visible", async ({
    isMobile,
    page,
  }) => {
    await mockAuthenticatedAppApi(page);

    await page.goto("/categories");
    await expect(
      page.getByRole("heading", { name: "Habit Lists", exact: true }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Add a new habit list")).toBeVisible();
    await expect(page.getByText("Starter pack").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /seed starter pack/i })).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /open workspace navigation/i }).click();
      await expect(
        page.getByRole("link", { name: /^Habit Lists\b/i }),
      ).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  });

  test("history page keeps filters and detail panel readable", async ({
    isMobile,
    page,
  }) => {
    await mockAuthenticatedAppApi(page);

    await page.goto("/history");
    await expect(
      page.getByRole("heading", { name: "Activity Log", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Morning Run").first()).toBeVisible();
    await expect(page.locator("#activity-from")).toBeVisible();
    await expect(page.locator("#activity-category")).toBeVisible();

    await page.getByRole("button", { name: /detail/i }).first().click();

    if (isMobile) {
      await expect(page.getByText("Completion detail")).toBeVisible();
    } else {
      await expect(page.getByText("Context pane")).toBeVisible();
      await expect(page.getByText("Selected completion", { exact: true })).toBeVisible();
    }

    await expect(
      page.getByLabel("Completion note").filter({ visible: true }),
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });
});
