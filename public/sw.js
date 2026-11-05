/**
 * Skylent Service Worker (Safe Network-First App Shell Cache)
 * Enables standalone PWA installation on Android, iOS, Chrome, Edge & Desktop
 * while NEVER caching dynamic /api/ responses or breaking OAuth redirects.
 */
const CACHE_NAME = 'skylent-app-shell-v37';
const PRECACHE_URLS = ['/', '/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
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
  // Never intercept API calls, OAuth callbacks, or cross-origin requests
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first strategy with fast fallback to cache for offline resilience
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
          response &&
          response.status === 200 &&
          (url.pathname.startsWith('/assets/') || url.pathname === '/favicon.svg')
        ) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});
