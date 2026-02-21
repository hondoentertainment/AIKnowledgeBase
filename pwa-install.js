/**
 * AI Knowledge Hub — PWA install prompt
 * Shows a dismissible banner when beforeinstallprompt fires and criteria are met
 */
(function () {
  const DISMISS_KEY = "pwaInstallDismissed";
  const DISMISS_DAYS = 7;

  function wasDismissed() {
    try {
      const j = localStorage.getItem(DISMISS_KEY);
      if (!j) return false;
      const d = parseInt(j, 10);
      return Date.now() - d < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch (_) {
      return false;
    }
  }

  function setDismissed() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true
      || document.referrer.includes("android-app://");
  }

  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  function showInstallBanner() {
    if (isStandalone() || wasDismissed() || !deferredPrompt) return;
    const banner = document.getElementById("pwa-install-banner");
    if (!banner) return;
    banner.classList.add("visible");
    banner.setAttribute("aria-hidden", "false");
  }

  function hideInstallBanner() {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
      banner.classList.remove("visible");
      banner.setAttribute("aria-hidden", "true");
    }
  }

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

  document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById("pwa-install-banner");
    if (!banner) return;

    const installBtn = banner.querySelector("[data-pwa-install]");
    const dismissBtn = banner.querySelector("[data-pwa-dismiss]");

    if (installBtn) {
      installBtn.addEventListener("click", () => {
        window.PWAInstall.install();
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        setDismissed();
        hideInstallBanner();
      });
    }

    if (deferredPrompt && !wasDismissed() && !isStandalone()) {
      setTimeout(showInstallBanner, 3000);
    } else {
      window.addEventListener("beforeinstallprompt", () => {
        if (!wasDismissed() && !isStandalone()) setTimeout(showInstallBanner, 2000);
      });
    }
  });
})();
