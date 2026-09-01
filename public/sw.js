const CACHE = 'kaoyan-v4.6.1';
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {})));
    const res = await fetch('/').catch(() => null);
    if (res && res.ok) {
      const html = await res.text();
      const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((u) => u.startsWith('/') && !u.startsWith('//') && !u.includes('/sw.js'));
      await Promise.all(urls.map((u) => cache.add(u).catch(() => {})));
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      if (!fresh || !fresh.ok) return fresh;
      const cache = await caches.open(CACHE);
      await cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = (await caches.match(req)) || (await caches.match('/index.html'));
      if (cached) return cached;
      throw err;
    }
  })());
});
