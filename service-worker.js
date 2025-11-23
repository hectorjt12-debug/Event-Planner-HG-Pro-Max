self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open("nexus-cache-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/index.tsx",
        "/App.tsx",
        "/types.ts"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((resp) => resp || fetch(e.request))
  );
});