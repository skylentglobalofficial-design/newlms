/**
 * Skylent Service Worker (v42 — Safe Network-Only HTML & Verified Asset Cache)
 *
 * Fixes the V37 white-screen bug where caching '/' (index.html) or falling back to
 * caches.match('/') for missing /assets/*.js chunks after a new deployment caused
 * Chrome to receive text/html for ES module scripts.
 */
const CACHE_NAME = 'skylent-app-shell-v42';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never intercept API calls, OAuth callbacks, HTML navigation documents, or JS/CSS chunks across deploys
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html')
  ) {
    return;
  }

  // Only cache static icons/manifest; let hashed /assets/ use standard HTTP browser cache
  if (url.pathname === '/favicon.svg' || url.pathname === '/manifest.webmanifest') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});
