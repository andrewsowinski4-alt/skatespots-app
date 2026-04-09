const CACHE_NAME = 'spotfinder-v1'
const STATIC_ASSETS = [
  '/',
  '/auth/login',
  '/auth/sign-up',
  '/submit',
  '/profile',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests - always go to network
  if (event.request.url.includes('/api/')) return

  // Skip mapbox requests
  if (event.request.url.includes('mapbox')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // If no cache, return offline page for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})

// Background sync for spot submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-spots') {
    event.waitUntil(syncPendingSpots())
  }
})

async function syncPendingSpots() {
  // Get pending spots from IndexedDB and sync them
  // This will be called when the user comes back online
  console.log('Syncing pending spots...')
}
