// Service worker del laboratorio GREED: il gestionale e il bilanciatore si aprono anche senza internet.
// Pagine: prima la rete (così gli aggiornamenti arrivano subito), se manca internet la copia salvata.
// Librerie e caratteri (Firebase, Google Fonts): copia salvata, aggiornata in sottofondo.
const CACHE = 'greed-laboratorio-v1';
const PAGINE = ['./', './index.html', './bilanciatore.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PAGINE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // I dati di Firebase (database, login) li gestisce Firebase stesso, anche offline: non li tocco
  if (/firestore\.googleapis\.com|identitytoolkit|securetoken|googleapis\.com\/identitytoolkit|firebaseinstallations/.test(url.host + url.pathname)) return;
  const pagina = req.mode === 'navigate' || (url.origin === location.origin && /\.html?$|\/$/.test(url.pathname));
  if (pagina) {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (/gstatic\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(url.host)) {
    e.respondWith(caches.match(req).then(salvata => {
      const rete = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; }).catch(() => salvata);
      return salvata || rete;
    }));
  }
});
