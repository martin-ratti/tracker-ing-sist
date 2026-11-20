const CACHE_NAME = 'utn-tracker-isi-v2023-2';
const CORE_PRECACHE_URLS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/og-image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_PRECACHE_URLS);
      try {
        const res = await fetch('/sw-assets.json', { cache: 'no-store' });
        if (res.ok) {
          const assets = await res.json();
          if (Array.isArray(assets) && assets.length > 0) {
            await cache.addAll(assets);
          }
        }
      } catch {
        // Ignorar en entorno de desarrollo
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Navegación SPA: Network-first con fallback a /index.html en caché para modo avión en el aula
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          return cached || Response.error();
        })
    );
    return;
  }

  // Assets estáticos (JS, CSS, imágenes, SVGs): Cache-first con actualización en red
  if (
    url.pathname.startsWith('/assets/') ||
    /\.(js|css|png|svg|ico|webmanifest|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
