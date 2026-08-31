// Service worker mínimo: solo cachea el "app shell" para que el navegador
// considere la app instalable y para que abra rápido en visitas repetidas.
// Las novedades siempre se piden frescas a Supabase (no se cachean acá),
// así el cliente nunca ve un feed viejo por culpa del caché.
const CACHE_NAME = 'novedades-allana-v1';
const APP_SHELL = [
  './comunicaciones.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nunca cacheamos llamadas a Supabase: siempre red, siempre datos frescos.
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
