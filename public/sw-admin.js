// Service Worker - escopo /admin apenas
const CACHE_NAME = 'admin-corrida-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (!event.request.url.includes('/admin')) return
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone()
        if (res.ok && event.request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return res
      })
      .catch(() => caches.match(event.request).then((r) => r || caches.match('/admin')))
  )
})
