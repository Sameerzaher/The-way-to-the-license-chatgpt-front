// Service Worker for PWA Offline Functionality
const CACHE_NAME = 'theory-app-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
  OFFLINE_URL
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/questions',
  '/subjects',
  '/topics',
  '/progress'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online, cache the response and return it
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cached version, serve offline page
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/questions') || url.pathname.startsWith('/progress')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online, cache API response
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
          // If offline, serve from cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('📱 Service Worker: Serving API from cache', request.url);
                return cachedResponse;
              }
              // Return offline response for API calls
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'אין חיבור לאינטרנט. מוצגים נתונים שמורים.',
                  offline: true
                }),
                {
                  status: 200,
                  statusText: 'OK',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
            });
        })
    );
    return;
  }

  // Handle static resources (CSS, JS, images)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
    );
    return;
  }

  // Default: try network first, then cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-answers') {
    event.waitUntil(syncOfflineAnswers());
  }
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncOfflineProgress());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'יש לך הודעה חדשה!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'פתח אפליקציה',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'סגור',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('מערכת לימוד תיאוריה', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline answers when back online
async function syncOfflineAnswers() {
  try {
    const offlineAnswers = await getOfflineData('offlineAnswers');
    if (offlineAnswers && offlineAnswers.length > 0) {
      console.log('🔄 Syncing offline answers:', offlineAnswers.length);
      
      for (const answer of offlineAnswers) {
        try {
          await fetch('/api/answers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(answer)
          });
        } catch (error) {
          console.error('Failed to sync answer:', error);
        }
      }
      
      // Clear synced answers
      await clearOfflineData('offlineAnswers');
      console.log('✅ Offline answers synced successfully');
    }
  } catch (error) {
    console.error('❌ Failed to sync offline answers:', error);
  }
}

// Sync offline progress when back online
async function syncOfflineProgress() {
  try {
    const offlineProgress = await getOfflineData('offlineProgress');
    if (offlineProgress) {
      console.log('🔄 Syncing offline progress');
      
      await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offlineProgress)
      });
      
      await clearOfflineData('offlineProgress');
      console.log('✅ Offline progress synced successfully');
    }
  } catch (error) {
    console.error('❌ Failed to sync offline progress:', error);
  }
}

// Helper functions for offline data management
async function getOfflineData(key) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(`/offline-data/${key}`);
  if (response) {
    return await response.json();
  }
  return null;
}

async function clearOfflineData(key) {
  const cache = await caches.open(CACHE_NAME);
  await cache.delete(`/offline-data/${key}`);
}

console.log('🚀 Service Worker: Loaded successfully');
