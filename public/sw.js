// Skylent Zero-Cache Pass-Through Service Worker (V59)
// Automatically purges any legacy browser caches and unregisters itself so
// live deployments and demos never serve stale HTML/JS/CSS bundles.

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
      .catch(() => undefined)
  )
})
