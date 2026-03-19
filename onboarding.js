/**
 * AI Knowledge Hub — Onboarding Tour
 * Guided walkthrough for first-time users with spotlight highlights
 * Production-ready with mobile support, touch gestures, and smooth transitions
 */
(function () {
  const STORAGE_KEY = "onboarding_completed";
  const DISMISS_KEY = "onboarding_dismissed";
  const MOBILE_BP = 768;
  const TOUR_STEPS = [
    {
      target: ".hero",
      title: "Welcome to AI Knowledge Hub!",
      text: "This is your command center for AI tools, knowledge, and resources. Tap Next to see what you can do.",
      position: "bottom",
    },
    {
      target: ".category-hub-grid",
      title: "Browse by Category",
      text: "Start here — pick any of the 8 categories like Tools, Podcasts, or Bleeding Edge to dive in.",
      position: "top",
    },
    {
      target: "#search-toggle, .search-bar",
      title: "Find Anything Instantly",
      text: "Press / or tap the search icon to search across every resource. Try it after the tour!",
      position: "bottom",
    },
    {
      target: ".topbar-actions",
      title: "Personalize Your Experience",
      text: "Switch to dark mode, change your profile, or tap the menu. Press ? on desktop to see all shortcuts.",
      position: "bottom",
    },
    {
      target: ".features-strip",
      title: "Rate, Save & Track",
      text: "Give tools a rating, save favorites to your Stack, and flag items you want to try later.",
      position: "bottom",
    },
    {
      target: null,
      title: "You're Ready to Go!",
      text: "Explore the full collection of AI tools and start building your personalized stack.",
      position: "center",
      cta: { label: "Browse AI Tools", href: "tools.html" },
    },
  ];

  let currentStep = 0;
  let overlay = null;
  let isActive = false;
  let resizeHandler = null;
  let touchState = null;

  /* ---- Helpers ---- */

  function isMobile() {
    return window.innerWidth < MOBILE_BP;
  }

  function shouldShow() {
    return !localStorage.getItem(STORAGE_KEY) && !localStorage.getItem(DISMISS_KEY);
  }

  /* ---- Styles (injected once) ---- */

  function injectStyles() {
    if (document.getElementById("tour-styles")) return;
    const style = document.createElement("style");
    style.id = "tour-styles";
    style.textContent = `
      /* Overlay & backdrop */
      .tour-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .tour-overlay.tour-active {
        opacity: 1;
      }
      .tour-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        pointer-events: auto;
      }

      /* Spotlight */
      .tour-spotlight {
        position: absolute;
        border-radius: 8px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
        pointer-events: none;
        transition: top 0.4s ease, left 0.4s ease, width 0.4s ease, height 0.4s ease;
        z-index: 1;
      }

      /* Tooltip — desktop default */
      .tour-tooltip {
        position: absolute;
        background: var(--surface, #fff);
        color: var(--text, #1a1a2e);
        border-radius: 12px;
        padding: 20px 24px 16px;
        max-width: 380px;
        width: calc(100% - 32px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        pointer-events: auto;
        z-index: 2;
        transition: top 0.35s ease, left 0.35s ease, transform 0.35s ease, opacity 0.3s ease;
      }

      /* Tooltip — mobile bottom-sheet */
      @media (max-width: 767px) {
        .tour-tooltip {
          position: fixed !important;
          bottom: 0 !important;
          top: auto !important;
          left: 0 !important;
          right: 0 !important;
          max-width: 100%;
          width: 100%;
          border-radius: 16px 16px 0 0;
          padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
          transform: translateY(100%) !important;
          transition: transform 0.35s ease, opacity 0.3s ease;
        }
        .tour-active .tour-tooltip {
          transform: translateY(0) !important;
        }
      }

      /* Progress dots */
      .tour-progress {
        display: flex;
        gap: 6px;
        margin-bottom: 12px;
      }
      .tour-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: var(--border, #ccc);
        transition: background 0.25s;
      }
      .tour-dot.active { background: var(--accent, #646cff); transform: scale(1.25); }
      .tour-dot.done { background: var(--accent, #646cff); opacity: 0.5; }

      /* Typography */
      .tour-title {
        margin: 0 0 6px;
        font-size: 1.1rem;
        font-weight: 700;
      }
      .tour-text {
        margin: 0 0 16px;
        font-size: 0.95rem;
        line-height: 1.5;
        opacity: 0.85;
      }

      /* Actions */
      .tour-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }
      .tour-nav {
        display: flex;
        gap: 8px;
      }
      .tour-skip,
      .tour-prev,
      .tour-next {
        min-height: 48px;
        min-width: 48px;
        padding: 10px 18px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 600;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .tour-skip {
        background: transparent;
        color: var(--text-muted, #888);
      }
      .tour-skip:hover { text-decoration: underline; }
      .tour-prev {
        background: var(--surface-alt, #f0f0f0);
        color: var(--text, #333);
      }
      .tour-next {
        background: var(--accent, #646cff);
        color: #fff;
      }
      .tour-next:hover { opacity: 0.9; }
      .tour-prev:disabled { opacity: 0.4; cursor: default; }

      /* CTA link button */
      .tour-cta {
        display: inline-block;
        min-height: 48px;
        line-height: 48px;
        padding: 0 24px;
        background: var(--accent, #646cff);
        color: #fff;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        text-align: center;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .tour-cta:hover { opacity: 0.9; }

      /* Dismiss checkbox row */
      .tour-dismiss-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        font-size: 0.85rem;
        color: var(--text-muted, #888);
      }
      .tour-dismiss-row input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      /* Body scroll lock */
      body.tour-scroll-lock {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }

  /* ---- DOM creation ---- */

  function createOverlay() {
    injectStyles();

    overlay = document.createElement("div");
    overlay.className = "tour-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Onboarding tour");
    overlay.innerHTML = `
      <div class="tour-backdrop"></div>
      <div class="tour-spotlight"></div>
      <div class="tour-tooltip">
        <div class="tour-progress"></div>
        <h3 class="tour-title"></h3>
        <p class="tour-text"></p>
        <div class="tour-cta-container"></div>
        <div class="tour-actions">
          <button type="button" class="tour-skip">Skip tour</button>
          <div class="tour-nav">
            <button type="button" class="tour-prev" disabled>Back</button>
            <button type="button" class="tour-next">Next</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Lock body scroll
    document.body.classList.add("tour-scroll-lock");

    // Button listeners
    overlay.querySelector(".tour-skip").addEventListener("click", handleSkip);
    overlay.querySelector(".tour-prev").addEventListener("click", prev);
    overlay.querySelector(".tour-next").addEventListener("click", next);
    overlay.querySelector(".tour-backdrop").addEventListener("click", handleSkip);

    // Keyboard
    document.addEventListener("keydown", handleKey);

    // Resize handler
    resizeHandler = debounce(function () {
      if (isActive) showStep(currentStep);
    }, 150);
    window.addEventListener("resize", resizeHandler);

    // Touch swipe gestures on tooltip
    var tooltip = overlay.querySelector(".tour-tooltip");
    tooltip.addEventListener("touchstart", onTouchStart, { passive: true });
    tooltip.addEventListener("touchend", onTouchEnd, { passive: true });
  }

  /* ---- Touch / Swipe ---- */

  function onTouchStart(e) {
    if (!e.touches.length) return;
    touchState = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }

  function onTouchEnd(e) {
    if (!touchState || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - touchState.x;
    var dy = e.changedTouches[0].clientY - touchState.y;
    var dt = Date.now() - touchState.t;
    touchState = null;
    // Require horizontal swipe > 50px, mostly horizontal, within 400ms
    if (dt > 400 || Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) { next(); } else { prev(); }
  }

  /* ---- Utility ---- */

  function debounce(fn, ms) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  /* ---- Keyboard ---- */

  function handleKey(e) {
    if (!isActive) return;
    if (e.key === "Escape") { handleSkip(); e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key === "Enter") { next(); e.preventDefault(); }
    if (e.key === "ArrowLeft") { prev(); e.preventDefault(); }
  }

  /* ---- Show step ---- */

  function showStep(stepIndex) {
    var step = TOUR_STEPS[stepIndex];
    if (!step) return;

    var tooltip = overlay.querySelector(".tour-tooltip");
    var spotlight = overlay.querySelector(".tour-spotlight");
    var progress = overlay.querySelector(".tour-progress");
    var ctaContainer = overlay.querySelector(".tour-cta-container");

    overlay.querySelector(".tour-title").textContent = step.title;
    overlay.querySelector(".tour-text").textContent = step.text;
    overlay.querySelector(".tour-prev").disabled = stepIndex === 0;

    var isLast = stepIndex === TOUR_STEPS.length - 1;
    overlay.querySelector(".tour-next").textContent = isLast ? "Get Started" : "Next";

    // CTA button (last step)
    if (step.cta) {
      ctaContainer.innerHTML =
        '<a class="tour-cta" href="' + step.cta.href + '">' + step.cta.label + "</a>";
    } else {
      ctaContainer.innerHTML = "";
    }

    // Progress dots
    progress.innerHTML = TOUR_STEPS.map(function (_, i) {
      return '<span class="tour-dot' +
        (i === stepIndex ? " active" : i < stepIndex ? " done" : "") +
        '"></span>';
    }).join("");

    // Resolve target
    var target = step.target ? document.querySelector(step.target) : null;
    var mobile = isMobile();

    if (target) {
      var navOffset = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-height"), 10
      ) || 0;

      // Scroll target into view, accounting for sticky header on mobile
      var targetTop = target.getBoundingClientRect().top + window.scrollY;
      var scrollTo = targetTop - navOffset - 16;
      window.scrollTo({ top: Math.max(0, scrollTo), behavior: "smooth" });

      // Position spotlight after scroll settles
      requestAnimationFrame(function () {
        setTimeout(function () {
          var rect = target.getBoundingClientRect();
          var pad = 8;

          spotlight.style.display = "block";
          spotlight.style.top = (rect.top - pad + window.scrollY) + "px";
          spotlight.style.left = (rect.left - pad) + "px";
          spotlight.style.width = (rect.width + pad * 2) + "px";
          spotlight.style.height = (rect.height + pad * 2) + "px";

          // Tooltip positioning — desktop only (mobile uses fixed bottom-sheet via CSS)
          if (!mobile) {
            var tRect = tooltip.getBoundingClientRect();
            if (step.position === "bottom") {
              tooltip.style.top = (rect.bottom + pad + 12 + window.scrollY) + "px";
            } else {
              tooltip.style.top = (rect.top - tRect.height - pad - 12 + window.scrollY) + "px";
            }
            tooltip.style.left = Math.max(
              16,
              Math.min(
                rect.left + rect.width / 2 - tRect.width / 2,
                window.innerWidth - tRect.width - 16
              )
            ) + "px";
            tooltip.style.transform = "none";
          }
        }, 350);
      });
    } else {
      // Centered step (no target)
      spotlight.style.display = "none";
      if (!mobile) {
        tooltip.style.top = "50%";
        tooltip.style.left = "50%";
        tooltip.style.transform = "translate(-50%, -50%)";
      }
    }

    requestAnimationFrame(function () { overlay.classList.add("tour-active"); });
  }

  /* ---- Navigation ---- */

  function next() {
    if (currentStep < TOUR_STEPS.length - 1) {
      currentStep++;
      showStep(currentStep);
    } else {
      finish();
    }
  }

  function prev() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  /* ---- Skip with "Don't show again" ---- */

  function handleSkip() {
    // If checkbox exists and is checked, persist dismissal
    if (overlay) {
      var checkbox = overlay.querySelector("#tour-dismiss-check");
      if (checkbox && checkbox.checked) {
        localStorage.setItem(DISMISS_KEY, "true");
      }
    }
    finish();
  }

  /* ---- Finish / cleanup ---- */

  function finish() {
    isActive = false;
    localStorage.setItem(STORAGE_KEY, "true");

    // Unlock body scroll
    document.body.classList.remove("tour-scroll-lock");

    if (overlay) {
      overlay.classList.remove("tour-active");
      setTimeout(function () {
        if (overlay) { overlay.remove(); }
        overlay = null;
      }, 350);
    }

    document.removeEventListener("keydown", handleKey);
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
  }

  /* ---- Start ---- */

  function start(force) {
    if (isActive) return;
    if (!force && !shouldShow()) return;
    isActive = true;
    currentStep = 0;
    createOverlay();

    // Inject "Don't show again" checkbox next to Skip button
    var skipBtn = overlay.querySelector(".tour-skip");
    var dismissRow = document.createElement("div");
    dismissRow.className = "tour-dismiss-row";
    dismissRow.innerHTML =
      '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;">' +
      '<input type="checkbox" id="tour-dismiss-check" />' +
      "Don't show again</label>";
    skipBtn.parentNode.insertBefore(dismissRow, skipBtn.nextSibling);

    setTimeout(function () { showStep(0); }, 500);
  }

  /* ---- Auto-start for first-time visitors on home page ---- */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/")) {
        setTimeout(function () { start(); }, 1200);
      }
    });
  } else {
    if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/")) {
      setTimeout(function () { start(); }, 1200);
    }
  }

  window.OnboardingTour = { start: start };
})();
