import { expect, test } from "@playwright/test";

test("root redirects anonymous users to sign-in", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/sign-in$/);
});

test("sign-in layout stays usable on all supported viewports", async ({
  page,
  isMobile,
}) => {
  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: "Rythm" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in with better auth/i }),
  ).toBeVisible();

  const authPanel = page.locator(".app-auth-panel");

  if (isMobile) {
    await expect(authPanel).toBeHidden();
  } else {
    await expect(authPanel).toBeVisible();
    await expect(
      page.getByText("A quieter, clearer home for recurring life quests."),
    ).toBeVisible();
  }

  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  expect(hasHorizontalOverflow).toBeFalsy();
});

test("sign-up layout keeps the longer form readable on mobile and desktop", async ({
  page,
}) => {
  await page.goto("/sign-up");

  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.locator("#sign-up-password")).toBeVisible();
  await expect(page.getByLabel("Confirm password")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  expect(hasHorizontalOverflow).toBeFalsy();
});
