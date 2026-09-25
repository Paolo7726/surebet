// Cache per uso offline. Cambia VERSIONE quando aggiorni index.html.
const VERSIONE = 'surebet-v2';
const FILE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSIONE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      // salva anche i font Google la prima volta che si caricano
      if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) {
        const copia = res.clone();
        caches.open(VERSIONE).then(c => c.put(e.request, copia));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
