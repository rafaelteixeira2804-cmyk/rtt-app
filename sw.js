// RunThisTown: funciona offline. Mude a versão a cada atualização do app.
const CACHE = "rtt-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return r; }).catch(() => caches.match("./index.html")));
    return;
  }
  // Leitor de prints (versões fixas no jsDelivr): guarda depois do primeiro uso.
  const cdn = req.url.includes("cdn.jsdelivr.net");
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    const keep = (r.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g") || cdn)) || (cdn && r.type === "opaque");
    if (keep) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  }).catch(() => hit)));
});
