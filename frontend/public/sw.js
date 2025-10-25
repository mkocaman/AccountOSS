/**
 * Service Worker - TEMPORARILY DISABLED FOR DEBUGGING
 * Uncomment after cache issues are resolved
 */

// ENTIRE FILE COMMENTED OUT TO PREVENT CACHING ISSUES
console.log('SW: Disabled for debugging');

/*
const CACHE_NAME = 'accountos-v1';
const RUNTIME_CACHE = 'accountos-runtime-v1';

// Cache edilecek static dosyalar
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icon.svg',
  '/favicon.svg'
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static files');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Eski cache'leri temizle
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          });
          });
        );
      })
      .then(() => {
        console.log('SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Network isteklerini yakala ve cache'le
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API istekleri için network-first stratejisi
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Başarılı API yanıtını cache'le
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Network hatası durumunda cache'den döndür
          return caches.match(request);
        })
    );
    return;
  }

  // Static dosyalar için cache-first stratejisi
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Geçerli yanıtı cache'le
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Offline durumunda offline sayfasını göster
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Background sync işlemleri burada yapılacak
      console.log('SW: Background sync completed')
    );
  }
});

// Push notification
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Yeni bildirim',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Görüntüle',
        icon: '/icon.svg'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AccountOS', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
*/