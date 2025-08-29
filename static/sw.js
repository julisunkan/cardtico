// Business Card Generator PWA - Service Worker
const CACHE_NAME = 'business-card-generator-v1.0.1';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/create',
  '/preview',
  '/batch',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/js/card-preview.js',
  '/static/js/batch-processor.js',
  '/static/manifest.json',
  // External CDN assets
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Dynamic content patterns to cache
const DYNAMIC_PATTERNS = [
  /\/generate_card\/.+/,
  /\/batch_upload/,
  /\/static\//,
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|otf)$/
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/generate_card\/.+/,
  /\/batch_upload/,
  /\.(?:php|asp|cgi|json|xml)$/
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map(cacheName => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const { url, method } = request;
  
  // Skip non-GET requests for caching
  if (method !== 'GET') {
    return;
  }
  
  // Skip external requests that aren't in our CDN list
  if (!url.startsWith(self.location.origin) && !isCDNResource(url)) {
    return;
  }
  
  // Handle different request types
  if (isNetworkFirstRequest(url)) {
    event.respondWith(networkFirst(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isDynamicContent(url)) {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// Network-first strategy (for API calls and dynamic content)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage();
    }
    
    throw error;
  }
}

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Cache miss and network failed', error);
    
    // Return fallback for images
    if (request.destination === 'image') {
      return await getFallbackImage();
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy (for pages)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('Service Worker: Network failed during revalidate', error);
      return cachedResponse;
    });
  
  return cachedResponse || await fetchPromise;
}

// Utility functions
function isNetworkFirstRequest(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url));
}

function isStaticAsset(url) {
  return url.includes('/static/') || 
         /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf)$/.test(url);
}

function isDynamicContent(url) {
  return DYNAMIC_PATTERNS.some(pattern => pattern.test(url));
}

function isCDNResource(url) {
  const cdnDomains = [
    'cdn.jsdelivr.net',
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];
  
  return cdnDomains.some(domain => url.includes(domain));
}

// Get offline page
async function getOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Business Card Generator</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #1e3a8a, #3b82f6);
                color: white;
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .offline-container {
                max-width: 400px;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .offline-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                opacity: 0.8;
            }
            .offline-title {
                font-size: 2rem;
                font-weight: 600;
                margin-bottom: 1rem;
            }
            .offline-message {
                font-size: 1.1rem;
                margin-bottom: 2rem;
                opacity: 0.9;
                line-height: 1.6;
            }
            .retry-btn {
                background: #60a5fa;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .retry-btn:hover {
                background: #3b82f6;
                transform: translateY(-2px);
            }
            .features-list {
                text-align: left;
                margin: 1.5rem 0;
            }
            .features-list li {
                margin: 0.5rem 0;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1 class="offline-title">You're Offline</h1>
            <p class="offline-message">
                No internet connection detected. Some features may not be available, but you can still:
            </p>
            <ul class="features-list">
                <li>Browse previously visited pages</li>
                <li>View cached business card templates</li>
                <li>Access the creation form</li>
                <li>Preview saved designs</li>
            </ul>
            <button class="retry-btn" onclick="window.location.reload()">
                Try Again
            </button>
        </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Get fallback image
async function getFallbackImage() {
  const fallbackSVG = `
    <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#1e3a8a"/>
      <rect x="50" y="100" width="300" height="100" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)"/>
      <circle cx="200" cy="150" r="20" fill="rgba(255,255,255,0.3)"/>
      <text x="200" y="170" fill="rgba(255,255,255,0.7)" font-family="Arial" font-size="14" text-anchor="middle">Image unavailable</text>
      <text x="200" y="190" fill="rgba(255,255,255,0.5)" font-family="Arial" font-size="12" text-anchor="middle">Please check your connection</text>
    </svg>
  `;
  
  return new Response(fallbackSVG, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// Message handling for manual cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.addAll(event.data.payload))
    );
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        })
    );
  }
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-card-generation') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Retrieve pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          body: request.body,
          headers: request.headers
        });
        
        if (response.ok) {
          // Remove from pending requests
          await removePendingRequest(request.id);
          
          // Notify user of successful sync
          await showNotification('Card Generated', {
            body: 'Your business card has been generated successfully!',
            icon: '/static/manifest.json',
            tag: 'card-generation-success'
          });
        }
      } catch (error) {
        console.log('Background sync failed for request:', request.id, error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Notification handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const { action, tag } = event.notification;
  
  if (tag === 'card-generation-success') {
    // Open the app to the preview page
    event.waitUntil(
      clients.openWindow('/preview')
    );
  }
});

// Push notification handling (for future enhancement)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/static/manifest.json',
    badge: '/static/manifest.json',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/static/manifest.json'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/static/manifest.json'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Business Card Generator', options)
  );
});

// Utility functions for IndexedDB operations
async function getPendingRequests() {
  // Implementation would use IndexedDB to store/retrieve pending requests
  // For now, return empty array
  return [];
}

async function removePendingRequest(id) {
  // Implementation would remove request from IndexedDB
  console.log('Removing pending request:', id);
}

async function showNotification(title, options) {
  if (self.registration && 'showNotification' in self.registration) {
    return self.registration.showNotification(title, options);
  }
}

// Performance monitoring
self.addEventListener('fetch', event => {
  const startTime = performance.now();
  
  event.respondWith(
    handleRequest(event.request).then(response => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow requests for monitoring
      if (duration > 5000) {
        console.warn('Slow request detected:', event.request.url, `${duration}ms`);
      }
      
      return response;
    })
  );
});

async function handleRequest(request) {
  // Delegate to appropriate strategy based on request type
  const { url } = request;
  
  if (isNetworkFirstRequest(url)) {
    return networkFirst(request);
  } else if (isStaticAsset(url)) {
    return cacheFirst(request);
  } else {
    return staleWhileRevalidate(request);
  }
}

console.log('Service Worker: Script loaded successfully');
