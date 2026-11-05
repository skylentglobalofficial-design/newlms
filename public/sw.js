const CACHE_NAME = 'skylent-app-shell-v48';
const PRECACHE_URLS = [
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache HTML navigation or Vite hashed JS/CSS chunks so deployments never cause a white screen
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/health') ||
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html') ||
    url.pathname.startsWith('/assets/')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic' &&
          PRECACHE_URLS.includes(url.pathname)
        ) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => undefined);
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
