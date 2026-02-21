/**
 * AI Knowledge Hub — Mobile UX enhancements
 * Input scroll-into-view, pull-to-refresh, haptic patterns
 */
(function () {
  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
  const isTouch = () => window.matchMedia("(pointer: coarse)").matches;

  /* --- Input focus: scroll into view on mobile (keyboard) --- */
  function initInputScroll() {
    if (!isMobile()) return;
    document.addEventListener(
      "focus",
      (e) => {
        const el = e.target;
        if (el && (el.matches("input, select, textarea") || el.isContentEditable)) {
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
        }
      },
      true
    );
  }

  /* --- Pull-to-refresh on list/feed pages --- */
  function initPullToRefresh() {
    if (!isMobile() || !isTouch()) return;
    const main = document.querySelector("main.main");
    if (!main) return;

    let startY = 0;
    let pulled = 0;
    let indicator = null;

    function getIndicator() {
      if (indicator) return indicator;
      indicator = document.createElement("div");
      indicator.className = "pull-to-refresh-indicator";
      indicator.setAttribute("aria-hidden", "true");
      indicator.innerHTML = '<span class="pull-to-refresh-text">Pull to refresh</span>';
      document.body.appendChild(indicator);
      return indicator;
    }

    function showIndicator(progress) {
      const ind = getIndicator();
      ind.classList.toggle("at-threshold", progress >= 1);
      ind.style.opacity = Math.min(1, progress * 2);
      ind.style.transform = `translateY(${Math.min(80, pulled)}px)`;
    }

    function hideIndicator() {
      if (indicator) {
        indicator.style.opacity = "0";
        indicator.style.transform = "translateY(-40px)";
        indicator.classList.remove("at-threshold");
      }
      pulled = 0;
    }

    const THRESHOLD = 80;
    let didHaptic = false;

    document.addEventListener(
      "touchstart",
      (e) => {
        if (window.scrollY <= 5) {
          startY = e.touches[0].clientY;
          pulled = 0;
          didHaptic = false;
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (startY <= 0 || window.scrollY > 5) return;
        const y = e.touches[0].clientY;
        pulled = Math.min(120, Math.max(0, (y - startY) * 0.5));
        if (pulled >= THRESHOLD && !didHaptic) {
          didHaptic = true;
          if (navigator.vibrate) navigator.vibrate(10);
        }
        showIndicator(pulled / THRESHOLD);
      },
      { passive: true }
    );

    document.addEventListener("touchend", () => {
      if (startY <= 0) return;
      if (pulled >= THRESHOLD) {
        hideIndicator();
        window.location.reload();
      } else {
        hideIndicator();
      }
      startY = 0;
    });
  }

  /* --- Haptic patterns (nav=short, success=double, error=long) --- */
  window.MobileUX = window.MobileUX || {};
  window.MobileUX.haptic = {
    nav: () => navigator.vibrate && navigator.vibrate(5),
    success: () => navigator.vibrate && navigator.vibrate([10, 50, 10]),
    error: () => navigator.vibrate && navigator.vibrate(100),
  };

  initInputScroll();
  initPullToRefresh();
})();
