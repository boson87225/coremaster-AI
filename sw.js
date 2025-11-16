const CACHE_NAME = 'coremaster-fitness-cache-v2';
const URLS_TO_CACHE = [
  './'
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch: stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If we got a valid response, update the cache
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // Fetch failed, maybe offline. If we have a cached response, we used it. If not, this will fail.
            console.warn('Fetch failed; user is likely offline.', err);
        });

        // Return the cached response immediately if available, and fetch in background.
        return response || fetchPromise;
      });
    })
  );
});