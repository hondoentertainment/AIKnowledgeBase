/**
 * AI Knowledge Hub — Offline detection
 * Shows "You're offline" banner when navigator.onLine is false
 */
(function () {
  const BANNER_ID = "offline-banner";
  const OFFLINE_MSG = "You're offline. Some features may be unavailable until you reconnect.";

  function ensureBanner() {
    let el = document.getElementById(BANNER_ID);
    if (el) return el;
    el = document.createElement("div");
    el.id = BANNER_ID;
    el.className = "offline-banner";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", "Connection status");
    el.innerHTML = '<span class="offline-banner-icon" aria-hidden="true">📡</span> ' + OFFLINE_MSG;
    document.body.insertBefore(el, document.body.firstChild);
    return el;
  }

  function update() {
    const banner = ensureBanner();
    const offline = !navigator.onLine;
    banner.classList.toggle("visible", offline);
    banner.setAttribute("aria-hidden", offline ? "false" : "true");
  }

  window.addEventListener("offline", update);
  window.addEventListener("online", update);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update);
  } else {
    update();
  }
})();
