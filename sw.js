// Bumped from amt-v33 -> amt-v34: Grok backup search UI; keep v33 knowledge-search cache bust.
const CACHE = 'amt-v34';
const SHELL = ['./','./index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only cache same-origin GET requests for navigation/HTML
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;

  // Network-first: this app deploys often (bug fixes, new features), so on every load we
  // want the freshest deployed copy if the network is available at all. The cache is now
  // purely an offline fallback (e.g. a tech stuck in a shielded MRI room with no signal),
  // not a way to speed up normal loads at the cost of showing stale content. The previous
  // stale-while-revalidate strategy always served the OLD cached page immediately and only
  // updated the cache in the background for the *next* visit -- meaning a fix could require
  // two reloads before it actually appeared, and "clear cache" on mobile browsers doesn't
  // always clear Service Worker Cache Storage, so it looked like changes weren't landing.
  e.respondWith(
    fetch(e.request).then(res => {
      if(res && res.status === 200 && res.type !== 'opaque') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match('./index.html')))
  );
});
