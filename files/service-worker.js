const cacheName = 'jcCache'
const filesToCache = [
  '/',
  '/files/print.css',
  '/files/style.css',
  '/index.html'
]

self.addEventListener('activate', e => self.clients.claim())
self.addEventListener('install', e => {
  console.log('install')
  e.waitUntil(
    caches.open(cacheName)
    .then(cache => cache.addAll(filesToCache))
  )
})
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
    .then(response => response ? response : fetch(e.request))
  )
})