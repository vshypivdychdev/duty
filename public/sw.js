// Service Worker for Черговий PWA
//
// PRECACHE_URLS and CACHE_VERSION are replaced at build time by scripts/postcache.cjs.
// CACHE_VERSION is a build timestamp so each deploy gets a unique cache name.
//
const CACHE_VERSION = 'BUILD_TS' // ← replaced by postcache.cjs
const CACHE_NAME = `duty-${CACHE_VERSION}`
const APP_BASE = '/' // ← replaced by postcache.cjs

const PRECACHE_URLS = [] // ← replaced by postcache.cjs after build

// ── Install: pre-cache everything ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => {
        console.error('[SW] precache failed:', err)
        throw err
      })
      .then(() => self.skipWaiting()),
  )
})

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

// ── Fetch: cache-first for assets, network-first for navigation ───────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return

  // Navigation (HTML): try network so updates are picked up; fall back to cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches
            .open(CACHE_NAME)
            .then((c) => c.put(request, clone))
            .catch((err) => console.warn('[SW] navigation cache.put failed:', err))
          return res
        })
        .catch(async () => {
          const byUrl = await caches.match(request, { ignoreVary: true })
          if (byUrl) return byUrl
          const byIndex = await caches.match(`${APP_BASE}index.html`, { ignoreVary: true })
          if (byIndex) return byIndex
          return new Response('<h1>Offline</h1><p>Reload when connected.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html' },
          })
        }),
    )
    return
  }

  // Everything else: cache-first (hashed asset filenames never change).
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((res) => {
          if (res.ok) {
            caches
              .open(CACHE_NAME)
              .then((c) => c.put(request, res.clone()))
              .catch((err) => console.warn('[SW] asset cache.put failed:', err))
          }
          return res
        }),
    ),
  )
})
