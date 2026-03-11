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
      page.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Morning Run").first()).toBeVisible();
    await expect(page.getByLabel("Category")).toBeVisible();
    await expect(page.getByText("Show inactive quests")).toBeVisible();
    await expect(page.getByText("Quest detail")).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /open navigation/i }).click();
      await expect(
        page.getByRole("link", { name: /^Dashboard\b/i }),
      ).toBeVisible();
    } else {
      await expect(page.getByText("Personal account session")).toBeVisible();
      await expect(page.getByText("Personal rhythm for recurring quests")).toBeVisible();
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
        name: "Quests",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText("Morning Run").first()).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /filter quests by category/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /filter quests by recurrence type/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /add quest/i }).click();
    await expect(page.getByRole("heading", { name: /create quest/i })).toBeVisible();
    await expect(page.locator("#quest-title")).toBeVisible();
    await expect(page.locator("#quest-category")).toBeVisible();
    await expect(page.locator("#quest-type")).toBeVisible();
    await expect(page.locator("#quest-active")).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /close/i }).click();
      await page.getByRole("button", { name: /open navigation/i }).click();
      await expect(
        page.getByRole("link", { name: /^Quests\b/i }),
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
      page.getByRole("heading", { name: "Categories", exact: true }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Add a new life area")).toBeVisible();
    await expect(page.getByText("Default Starter Pack")).toBeVisible();
    await expect(page.getByRole("button", { name: /seed defaults/i })).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: /open navigation/i }).click();
      await expect(
        page.getByRole("link", { name: /^Categories\b/i }),
      ).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  });

  test("history page keeps filters and detail panel readable", async ({
    page,
  }) => {
    await mockAuthenticatedAppApi(page);

    await page.goto("/history");
    await expect(
      page.getByRole("heading", { name: "History", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Completion detail")).toBeVisible();
    await expect(page.getByText("Morning Run").first()).toBeVisible();
    await expect(page.locator("#history-from")).toBeVisible();
    await expect(page.locator("#history-category")).toBeVisible();
    await expect(page.locator("#history-note")).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });
});
