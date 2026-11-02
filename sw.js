// Questo file era finito qui per errore: si disattiva da solo e libera la pagina principale del Brain.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  self.registration.unregister()
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(finestre => finestre.forEach(f => f.navigate(f.url)))
));
