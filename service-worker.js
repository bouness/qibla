/**
 * Qibla PWA — service-worker.js
 * Strategy: Cache-first for static assets, network-first for API calls.
 */

'use strict';

const CACHE_NAME    = 'qibla-v1.3';
const RUNTIME_CACHE = 'qibla-runtime-v2';

/* Assets to pre-cache on install — local files only.
   External resources (fonts, icons CDN) are cached lazily on first fetch. */
const PRECACHE_ASSETS = [
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/* ── INSTALL ── pre-cache static assets ───────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE ── clean up old caches ─────────────────────── */
self.addEventListener('activate', event => {
  const validCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !validCaches.includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH ── routing strategy ───────────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and Chrome extensions
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Nominatim geocoding — Network-only (real-time), with fallback error
  if (url.hostname.includes('nominatim.openstreetmap.org')) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  // Google Fonts CSS — stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // CDN libraries (adhan) — cache-first
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // App shell (local files) — cache-first with network fallback
  event.respondWith(cacheFirst(event.request));
});

/* ── STRATEGIES ─────────────────────────────────────────── */

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise || offlineFallback(request);
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    // Return a proper JSON error so app.js can catch it gracefully
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function offlineFallback(request) {
  if (request.destination === 'document') {
    return caches.match('./index.html');
  }
  return new Response('Offline', { status: 503 });
}

/* ── PUSH NOTIFICATIONS (future use) ─────────────────────── */
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '🕌 Prayer Time', {
      body:  data.body  || 'It is time to pray.',
      icon:  './icons/icon-192.png',
      badge: './icons/icon-192.png',
    })
  );
});
