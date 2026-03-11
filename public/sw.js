const CACHE_NAME = "rythm-app-shell-v2";
const OFFLINE_ROUTE = "/offline";
const STATIC_ROUTES_TO_CACHE = [
  OFFLINE_ROUTE,
  "/manifest.webmanifest",
  "/apple-icon",
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ROUTES_TO_CACHE);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );

      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(request) {
  return (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (new URL(request.url).pathname === OFFLINE_ROUTE && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(OFFLINE_ROUTE, response.clone());
          }

          return response;
        } catch {
          const cached = await caches.match(request);

          if (cached) {
            return cached;
          }

          return caches.match(OFFLINE_ROUTE);
        }
      })(),
    );

    return;
  }

  if (isStaticAsset(request) || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        return cached ?? networkFetch;
      })(),
    );
  }
});
