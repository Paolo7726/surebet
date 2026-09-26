// Cache per uso offline. Cambia VERSIONE quando aggiorni index.html.
const VERSIONE = 'surebet-v6';
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
  const url = new URL(e.request.url);
  // dati delle surebet: sempre dalla rete, la copia salvata solo se sei offline
  if (url.pathname.endsWith('/dati.json')) {
    e.respondWith(fetch(e.request).then(res => {
      const copia = res.clone();
      caches.open(VERSIONE).then(c => c.put('./dati.json', copia));
      return res;
    }).catch(() => caches.match('./dati.json')));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && (url.origin === self.location.origin || url.hostname.includes('fonts.g'))) {
        const copia = res.clone();
        caches.open(VERSIONE).then(c => c.put(e.request, copia));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
