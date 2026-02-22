/**
 * AI Knowledge Hub — Service Worker
 * Caches static assets for offline and faster repeat loads
 */
const CACHE_NAME = "ai-knowledge-hub-v9";
const ASSETS = [
  "index.html",
  "search.html",
  "tools.html",
  "knowledge.html",
  "podcasts.html",
  "youtube.html",
  "training.html",
  "daily-watch.html",
  "bleeding-edge.html",
  "stack.html",
  "profiles.html",
  "admin.html",
  "about.html",
  "login.html",
  "register.html",
  "forgot-password.html",
  "reset-password.html",
  "auth-setup.html",
  "niche.html",
  "styles.css",
  "stack.css",
  "about.css",
  "manifest.json",
  "header.js",
  "theme.js",
  "mobile-ux.js",
  "bottom-nav.js",
  "app.js",
  "search-utils.js",
  "search-page.js",
  "stack.js",
  "niche.js",
  "data.js",
  "niche-data.js",
  "auth.js",
  "profiles.js",
  "profile-switcher.js",
  "pwa-install.js",
  "card-builder.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

const OFFLINE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — AI Knowledge Hub</title><style>body{margin:0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#faf8f5;color:#1a1816;text-align:center;padding:1rem}h1{font-size:1.25rem;margin-bottom:0.5rem}a{color:#c45c3e;font-weight:600}</style></head><body><div><h1>You're offline</h1><p>Check your connection and try again.</p><p><a href="index.html">Go to homepage</a></p></div></body></html>`;

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.startsWith("chrome-extension:") || e.request.url.includes("extension")) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((r) => {
        const clone = r.clone();
        if (r.ok && (e.request.destination === "document" || e.request.destination === "style" || e.request.destination === "script")) {
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return r;
      }).catch(() => {
        if (e.request.destination === "document") {
          const base = new URL(e.request.url).origin;
          return caches.match(base + "/index.html")
            || caches.match("index.html")
            || caches.match("/")
            || new Response(OFFLINE_HTML, { status: 200, headers: { "Content-Type": "text/html" } });
        }
        return new Response("", { status: 503 });
      });
    })
  );
});
