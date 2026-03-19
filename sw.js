/**
 * AI Knowledge Hub — Service Worker
 * Caches static assets for offline and faster repeat loads.
 * Runtime caching for Google Fonts, stale-while-revalidate for data files,
 * offline fallback page, and skip-waiting message channel.
 */
const CACHE_NAME = "ai-knowledge-hub-v16";
const FONT_CACHE = "ai-hub-fonts-v1";
const DATA_CACHE = "ai-hub-data-v1";
const FONT_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

const ASSETS = [
  /* HTML pages */
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
  "want-to-try.html",
  "dashboard.html",
  "offline.html",
  /* Stylesheets */
  "styles.css",
  "stack.css",
  "about.css",
  /* Manifest */
  "manifest.json",
  /* Core scripts */
  "header.js",
  "theme.js",
  "mobile-ux.js",
  "offline.js",
  "toast.js",
  "bottom-nav.js",
  "app.js",
  "analytics.js",
  "search-utils.js",
  "search-page.js",
  "stack.js",
  "want-to-try.js",
  "niche.js",
  "data.js",
  "niche-data.js",
  "auth.js",
  "profiles.js",
  "profile-switcher.js",
  "pwa-install.js",
  "card-builder.js",
  "extend-data.js",
  "extend-niche.js",
  "command-palette.js",
  "onboarding.js",
  "recommendations.js",
  "quick-preview.js",
  "keyboard-shortcuts.js",
  "advanced-filters.js",
  "animations.js",
  "comparison.js",
  "gamification.js",
  "sw-update.js",
  "notes.js",
  "activity-feed.js",
  "drag-sort.js",
  "shareable-lists.js",
];

/* ── Offline fallback HTML (used only if offline.html is not cached) ── */
const OFFLINE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — AI Knowledge Hub</title><style>body{margin:0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#faf8f5;color:#1a1816;text-align:center;padding:1rem}h1{font-size:1.25rem;margin-bottom:0.5rem}a{color:#c45c3e;font-weight:600}</style></head><body><div><h1>You're offline</h1><p>Check your connection and try again.</p><p><a href="index.html">Go to homepage</a></p></div></body></html>`;

/* ── Install ── */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // Do NOT call self.skipWaiting() here — wait for the client to signal via message
});

/* ── Activate: clean up old caches ── */
self.addEventListener("activate", (e) => {
  const keepCaches = new Set([CACHE_NAME, FONT_CACHE, DATA_CACHE]);
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => !keepCaches.has(k))
          .map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

/* ── Skip-waiting message channel ── */
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ── Helpers ── */

/**
 * Google Fonts: cache-first with 30-day expiry.
 * Matches fonts.googleapis.com (CSS) and fonts.gstatic.com (font files).
 */
function handleGoogleFonts(request) {
  return caches.open(FONT_CACHE).then((cache) => {
    return cache.match(request).then((cached) => {
      if (cached) {
        const dateHeader = cached.headers.get("sw-cached-at");
        if (dateHeader && Date.now() - Number(dateHeader) < FONT_MAX_AGE) {
          return cached;
        }
      }
      return fetch(request).then((response) => {
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set("sw-cached-at", String(Date.now()));
          const cloned = response.clone();
          cloned.blob().then((body) => {
            cache.put(request, new Response(body, {
              status: response.status,
              statusText: response.statusText,
              headers: headers,
            }));
          });
        }
        return response;
      }).catch(() => cached || new Response("", { status: 503 }));
    });
  });
}

/**
 * Stale-while-revalidate for data files (data.js, niche-data.js).
 * Returns cached version immediately, fetches fresh copy in background.
 */
function handleDataFiles(request) {
  return caches.open(DATA_CACHE).then((cache) => {
    return cache.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => cached || new Response("", { status: 503 }));

      return cached || fetchPromise;
    });
  });
}

/**
 * Returns an offline fallback for navigation requests.
 * Tries the cached offline.html first, then inline HTML.
 */
function offlineFallback() {
  return caches.match("offline.html")
    .then((page) => page || new Response(OFFLINE_HTML, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }));
}

/* ── Fetch handler ── */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.startsWith("chrome-extension:") || e.request.url.includes("extension")) return;

  const url = new URL(e.request.url);

  // Google Fonts — cache-first with 30-day expiry
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(handleGoogleFonts(e.request));
    return;
  }

  // Data files — stale-while-revalidate
  if (url.pathname.endsWith("/data.js") || url.pathname.endsWith("/niche-data.js")) {
    e.respondWith(handleDataFiles(e.request));
    return;
  }

  // Default: cache-first for static assets, network for everything else
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
        // Navigation requests get the offline fallback page
        if (e.request.mode === "navigate" || e.request.destination === "document") {
          return offlineFallback();
        }
        return new Response("", { status: 503 });
      });
    })
  );
});
