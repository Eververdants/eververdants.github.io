/* Eververdants service worker — repeat-visit acceleration.
 *
 * GitHub Pages serves every response with Cache-Control: max-age=600, so a
 * returning visitor re-downloads the whole static surface (JS/CSS bundles,
 * fonts, work photographs) ten minutes after the last visit. This worker
 * holds that surface in a stale-while-revalidate cache: the first visit
 * after a deploy may hit the network, every subsequent one answers from
 * the cache while a background fetch refreshes it.
 *
 * Deliberate scope:
 * - HTML navigations always go to the network. Documents are small, change
 *   with every deploy, and must never be served stale from here.
 * - Only same-origin GETs under /assets/ (content-hashed by Vite), /fonts/,
 *   /works/ (photographs) and the machine-readable feeds are cached.
 * - Bump VERSION whenever this file changes so old caches are dropped. */
const VERSION = "v1";
const CACHE = `evd-${VERSION}`;

const STATIC_RE = /^\/(assets|fonts|works)\//;
const FEED_RE =
  /^\/(search|posts|works|projects|site|llms|llms-full)\.(json|txt)$|^\/(rss|sitemap)\.xml$/;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("evd-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") return;
  if (!STATIC_RE.test(url.pathname) && !FEED_RE.test(url.pathname)) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const refreshing = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === "opaque")) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);
      /* Cache miss with a live network: wait for it. Cache hit: answer
         instantly and let the background refresh update the entry. */
      return cached || (await refreshing) || Response.error();
    }),
  );
});
