// Bumped from amt-v51 -> amt-v52: PM Service Agreement mileage is from
// AMT's Palm Bay, FL base only.
// v51: new built-in read-only reference template
// (AMT PM Service Agreement Template v2) in Guides, category Templates.
// v50: new built-in guide (Ellis & Watts LTL-4 heat
// exchanger) and larger Manuals-tab cache/rate-limit notes.
// v49: folder lists survive GitHub's unauthenticated rate limit in the page, and
// the multi-MB GE library JSON stays in IndexedDB only. Cache Storage keeps the
// app shell and every other same-origin GET.
const CACHE = 'amt-v52';
const SHELL = ['./','./index.html','./access-config.js'];
const LIBRARY_KB_FILES = [
  '/kb/ge-loose-kb.json',
  '/kb/ge-signa-kb.json',
  '/kb/ge-error-tool-kb.json'
];

function isLibraryKbUrl(url){
  let path = '';
  try { path = new URL(url, self.location.origin).pathname; }
  catch(e){ return false; }
  return LIBRARY_KB_FILES.some(function(file){ return path === file || path.endsWith(file); });
}

function purgeLibraryKbFromCache(cache){
  return cache.keys().then(function(keys){
    return Promise.all(keys.filter(function(req){
      return isLibraryKbUrl(req.url);
    }).map(function(req){ return cache.delete(req); }));
  });
}

function purgeLibraryKbCaches(){
  return caches.keys().then(function(names){
    return Promise.all(names.map(function(name){
      return caches.open(name).then(purgeLibraryKbFromCache);
    }));
  });
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    purgeLibraryKbCaches().then(function(){
      return caches.keys();
    }).then(function(keys){
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', e => {
  // Only cache same-origin GET requests for navigation/HTML
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;
  // The GE service library is about 27 MB. The app keeps its own copy in
  // IndexedDB for offline search, so it must not also land in Cache Storage.
  if(isLibraryKbUrl(url)) return;

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
