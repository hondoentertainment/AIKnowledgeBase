/**
 * SW-Update — Service Worker update detection & user prompt
 * Listens for new service worker versions and prompts the user to refresh.
 * Integrates with the existing toast system (window.showToast).
 *
 * Usage: The script self-initialises. Call window.SWUpdate.check() to
 *        manually trigger an update check at any time.
 */
(function () {
  "use strict";

  let waitingWorker = null;
  let updateBanner = null;

  /**
   * Show a persistent banner/toast prompting the user to refresh.
   */
  function showUpdatePrompt() {
    // Prefer the app's built-in toast system
    if (typeof window.showToast === "function") {
      window.showToast("New version available! Click to refresh.", {
        duration: 0, // persistent
        action: applyUpdate,
        actionLabel: "Refresh",
      });
      return;
    }

    // Fallback: create a simple banner
    if (updateBanner) return; // already showing

    updateBanner = document.createElement("div");
    updateBanner.setAttribute("role", "alert");
    updateBanner.style.cssText =
      "position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);" +
      "background:#6366f1;color:#fff;padding:.75rem 1.25rem;border-radius:.5rem;" +
      "font:600 .9rem/1.4 system-ui,sans-serif;cursor:pointer;z-index:99999;" +
      "box-shadow:0 4px 12px rgba(0,0,0,.25);text-align:center;max-width:90vw;";
    updateBanner.textContent = "New version available! Click to refresh.";
    updateBanner.addEventListener("click", applyUpdate);
    document.body.appendChild(updateBanner);
  }

  /**
   * Tell the waiting service worker to skip waiting, then reload.
   */
  function applyUpdate() {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    // Remove the banner if we created one
    if (updateBanner && updateBanner.parentNode) {
      updateBanner.parentNode.removeChild(updateBanner);
      updateBanner = null;
    }
  }

  /**
   * Watch a service worker registration for updates.
   */
  function trackRegistration(reg) {
    if (!reg) return;

    // A new worker is already waiting
    if (reg.waiting) {
      waitingWorker = reg.waiting;
      showUpdatePrompt();
      return;
    }

    // A new worker is installing right now
    if (reg.installing) {
      trackInstalling(reg.installing);
    }

    // Future updates
    reg.addEventListener("updatefound", function () {
      if (reg.installing) {
        trackInstalling(reg.installing);
      }
    });
  }

  function trackInstalling(worker) {
    worker.addEventListener("statechange", function () {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        // New version installed while a previous one controls the page
        waitingWorker = worker;
        showUpdatePrompt();
      }
    });
  }

  /**
   * Reload all controlled clients once the new worker activates.
   */
  function listenForControllerChange() {
    if (!navigator.serviceWorker) return;
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  /**
   * Manually trigger an update check.
   * Returns a promise that resolves to the registration.
   */
  function check() {
    if (!("serviceWorker" in navigator)) {
      return Promise.resolve(null);
    }
    return navigator.serviceWorker.getRegistration().then(function (reg) {
      if (reg) {
        reg.update();
        trackRegistration(reg);
      }
      return reg || null;
    });
  }

  /* ── Initialise ── */
  function init() {
    if (!("serviceWorker" in navigator)) return;

    listenForControllerChange();

    // If the SW is already registered, track it immediately
    navigator.serviceWorker.ready.then(trackRegistration);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ── Public API ── */
  window.SWUpdate = { check: check };
})();
