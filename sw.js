/* Mode hors ligne de SIMMO : on essaie d'abord le réseau (pour recevoir les mises à jour),
 * et on retombe sur la copie gardée si l'iPhone n'a pas de connexion. */
const CACHE = "simmo-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); return res; })
      .catch(() => caches.match(r).then((hit) => hit || caches.match("./index.html")))
  );
});
