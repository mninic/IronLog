/* IronLog — service worker
   Serve a due cose: rende l'app installabile come PWA e permette di
   notificare il fine recupero via registration.showNotification(), che e'
   l'unico modo che funziona nella PWA installata su Android.
   Nessuna gestione di cache: l'app vive su Supabase e su CDN, cacherebbe
   solo vecchie versioni. */

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

// Toccare la notifica porta la finestra in primo piano
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});

/* Entry point per eventuali push dal server (oggi non usato, ma se in futuro
   arriva un push reale la notifica viene comunque mostrata). */
self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'IronLog', {
      body: data.body || '',
      tag: data.tag || 'ironlog-push',
      icon: 'icon-192.png',
      badge: 'icon-192.png'
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data === 'skip-waiting') self.skipWaiting();
});
