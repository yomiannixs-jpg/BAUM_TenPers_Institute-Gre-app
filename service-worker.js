const CACHE = "baum-gre-pwa-v1";
const SHELL = [
  "/",
  "/index.html",
  "/auth-gate.css",
  "/auth-gate.js",
  "/pwa-register.js",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache = await caches.open(CACHE);
    for (const url of SHELL) {
      try {
        const response = await fetch(url, {cache:"reload"});
        if (response.ok) await cache.put(url, response.clone());
      } catch (_) {}
    }
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache Supabase/API/auth traffic.
  if (url.origin !== self.location.origin ||
      url.pathname.includes("/functions/") ||
      url.hostname.includes("supabase")) return;

  // HTML: network-first so app updates immediately.
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith((async()=>{
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch (_) {
        return (await caches.match(req)) || (await caches.match("/index.html"));
      }
    })());
    return;
  }

  // PDFs: network-only to avoid huge PWA caches.
  if (url.pathname.toLowerCase().endsWith(".pdf")) return;

  // Static local assets: stale-while-revalidate.
  event.respondWith((async()=>{
    const cached = await caches.match(req);
    const network = fetch(req).then(async res=>{
      if (res.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req,res.clone());
      }
      return res;
    }).catch(()=>null);
    return cached || await network || Response.error();
  })());
});
