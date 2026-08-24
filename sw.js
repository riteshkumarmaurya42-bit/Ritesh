// Service Worker - Ritesh Portfolio PWA
const CACHE = 'ritesh-v2';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/particles.js',
  './features/terminal.html',
  './features/tools.html',
  './features/games.html',
  './features/visuals.html'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      return caches.open(CACHE).then(c => { c.put(e.request, res.clone()); return res; });
    }))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
