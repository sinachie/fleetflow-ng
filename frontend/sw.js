const CACHE_NAME = 'fleetflow-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/driver.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/driver.js',
  // Add other JS files here...
  'https://cdn.tailwindcss.com'
];

// Install Event - Cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event - Serve from cache if offline
self.addEventListener('fetch', (event) => {
  // Skip caching for API requests (always want fresh data)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});