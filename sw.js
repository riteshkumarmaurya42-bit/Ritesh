// Service Worker — Ritesh Portfolio PWA
// Strategy: cache-first for static assets, network-first for page navigations
// with an offline fallback. Bump CACHE version whenever assets change.
const CACHE = 'ritesh-v2.1.0';

const ASSETS = [
  './',
  './index.html',
  './404.html',
  './css/style.css',
  './js/main.js',
  './js/particles.js',
  './js/effects.js',
  './js/ai-widget.js',
  './features/terminal.html',
  './features/tools.html',
  './features/games.html',
  './features/visuals.html',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png',
  './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;

  // Only handle GET requests; let everything else hit the network.
  if (request.method !== 'GET') return;

  // Page navigations: network first (fresh HTML), fall back to cache, then to index.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Static assets: cache first, then network (and cache the result).
  e.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((res) => {
        // Only cache same-origin, successful, basic responses.
        if (!res.ok || new URL(request.url).origin !== self.location.origin) return res;
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      }).catch(() => cached)
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
