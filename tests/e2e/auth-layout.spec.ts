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
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /forgot password\?/i }),
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

test("forgot-password layout stays readable and keeps recovery copy visible", async ({
  page,
}) => {
  await page.goto("/forgot-password");

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /send reset link/i }),
  ).toBeVisible();
  await expect(page.getByText(/request a reset link/i)).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  expect(hasHorizontalOverflow).toBeFalsy();
});

test("reset-password page handles missing tokens without breaking the layout", async ({
  page,
}) => {
  await page.goto("/reset-password");

  await expect(page.getByText(/missing token/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /back to sign in/i })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  expect(hasHorizontalOverflow).toBeFalsy();
});
