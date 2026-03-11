import { expect, test } from "@playwright/test";

test("root layout exposes manifest and service worker entry points", async ({
  page,
  request,
}) => {
  await page.goto("/sign-in");

  const manifestHref = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");

  expect(manifestHref).toBe("/manifest.webmanifest");

  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();

  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe("Rythm");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: "/pwa/icon-192.png" }),
      expect.objectContaining({ src: "/pwa/icon-512.png" }),
    ]),
  );

  const [icon192Response, icon512Response, appleIconResponse, swResponse] =
    await Promise.all([
      request.get("/pwa/icon-192.png"),
      request.get("/pwa/icon-512.png"),
      request.get("/apple-icon"),
      request.get("/sw.js"),
    ]);

  expect(icon192Response.ok()).toBeTruthy();
  expect(icon512Response.ok()).toBeTruthy();
  expect(appleIconResponse.ok()).toBeTruthy();
  expect(swResponse.ok()).toBeTruthy();
});

test("service worker script can register on localhost smoke flow", async ({
  page,
}) => {
  await page.goto("/sign-in");

  const serviceWorkerUrl = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) {
      return null;
    }

    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    return (
      registration?.active?.scriptURL ??
      registration?.installing?.scriptURL ??
      registration?.waiting?.scriptURL ??
      null
    );
  });

  expect(serviceWorkerUrl).toContain("/sw.js");
});
