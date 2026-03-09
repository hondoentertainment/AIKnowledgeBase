/**
 * AI Knowledge Hub — PWA install prompt
 * Shows a dismissible banner after a meaningful interaction:
 *   - User rates an item (star-click), OR
 *   - 30 seconds of active browsing elapsed
 * The banner is suppressed if:
 *   - The app is already running in standalone/installed mode
 *   - The user dismissed the prompt within the last 14 days
 *   - The browser hasn't fired beforeinstallprompt (not eligible)
 */
(function () {
  const DISMISS_KEY = "pwaInstallDismissed";
  const DISMISS_DAYS = 14;
  const IDLE_DELAY_MS = 30000; // 30 seconds

  /* ---- helpers ---- */

  function wasDismissed() {
    try {
      const ts = localStorage.getItem(DISMISS_KEY);
      if (!ts) return false;
      return Date.now() - parseInt(ts, 10) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch (_) {
      return false;
    }
  }

  function setDismissed() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (_) { /* storage full – silently ignore */ }
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://")
    );
  }

  /* ---- state ---- */

  let deferredPrompt = null;
  let bannerShown = false;
  let idleTimer = null;

  /* ---- capture the install event early ---- */

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // If the page is already loaded and timers set, start the idle timer now
    scheduleIdlePrompt();
  });

  /* ---- banner show / hide ---- */

  function showInstallBanner() {
    if (bannerShown || isStandalone() || wasDismissed() || !deferredPrompt) return;
    const banner = document.getElementById("pwa-install-banner");
    if (!banner) return;
    bannerShown = true;
    banner.classList.add("visible");
    banner.setAttribute("aria-hidden", "false");
    clearTimeout(idleTimer);
  }

  function hideInstallBanner() {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
      banner.classList.remove("visible");
      banner.setAttribute("aria-hidden", "true");
    }
  }

  /* ---- trigger conditions ---- */

  /** Schedule showing the banner after IDLE_DELAY_MS of page time */
  function scheduleIdlePrompt() {
    if (bannerShown || isStandalone() || wasDismissed() || !deferredPrompt) return;
    if (idleTimer) return; // already scheduled
    idleTimer = setTimeout(showInstallBanner, IDLE_DELAY_MS);
  }

  /** Trigger immediately when user performs a meaningful action (e.g. rating) */
  function onMeaningfulInteraction() {
    showInstallBanner();
  }

  /* ---- public API ---- */

  window.PWAInstall = {
    showBanner: showInstallBanner,
    hideBanner: hideInstallBanner,

    async install() {
      if (!deferredPrompt) return false;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      hideInstallBanner();
      return outcome === "accepted";
    },

    get canInstall() {
      return !!deferredPrompt;
    },
  };

  /* ---- wiring ---- */

  document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById("pwa-install-banner");
    if (!banner) return;

    /* Install button */
    const installBtn = banner.querySelector("[data-pwa-install]");
    if (installBtn) {
      installBtn.addEventListener("click", () => {
        window.PWAInstall.install();
      });
    }

    /* Dismiss button */
    const dismissBtn = banner.querySelector("[data-pwa-dismiss]");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        setDismissed();
        hideInstallBanner();
      });
    }

    /* Keyboard: Escape dismisses the banner */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && bannerShown) {
        setDismissed();
        hideInstallBanner();
      }
    });

    /* --- meaningful-interaction triggers --- */

    /* 1. Star rating clicks anywhere on the page */
    document.addEventListener("click", (e) => {
      const star = e.target.closest("[data-rating], .star-btn, .star-input, .rating-star");
      if (star) onMeaningfulInteraction();
    });

    /* 2. "Want to try" / "Add to stack" button clicks */
    document.addEventListener("click", (e) => {
      const action = e.target.closest("[data-want-to-try], [data-add-stack], .want-to-try-btn, .stack-btn");
      if (action) onMeaningfulInteraction();
    });

    /* 3. Idle timer — show after 30 s regardless */
    scheduleIdlePrompt();
  });

  /* If the app gets installed while banner is showing, hide it */
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    hideInstallBanner();
  });
})();
