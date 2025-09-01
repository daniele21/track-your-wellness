const CACHE_NAME = 'diario-ai-cache-v2';
// Cache the essential app shell files. Other assets will be cached on demand.
const APP_SHELL_URLS = [
    '/',
    'index.html',
    'index.css',
    'index.tsx',
];

// On install, cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// On fetch, use a cache-first, then network strategy
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    // Don't cache API calls to Firebase or Gemini
    const isApiCall = event.request.url.includes('firestore.googleapis.com') || 
                      event.request.url.includes('generativelanguage.googleapis.com');

    if (isApiCall) {
        // For API calls, go directly to the network
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            // If the resource is in the cache, return it
            if (cachedResponse) {
                return cachedResponse;
            }

            // If it's not in the cache, fetch it from the network
            return fetch(event.request).then(
                networkResponse => {
                    // Check if we received a valid response
                    if(!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }

                    // Clone the response because it's a stream
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME)
                    .then(cache => {
                        // Add the new resource to the cache
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }
            ).catch(error => {
                console.error('Fetching failed:', error);
                // Optionally, return a fallback offline page here if one exists
                // For example: return caches.match('/offline.html');
                throw error;
            });
        })
    );
});