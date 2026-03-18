/**
 * AI Knowledge Hub — Onboarding Tour
 * Guided walkthrough for first-time users with spotlight highlights
 */
(function () {
  const STORAGE_KEY = "onboarding_completed";
  const TOUR_STEPS = [
    {
      target: ".hero",
      title: "Welcome to AI Knowledge Hub!",
      text: "Your personal command center for AI tools, knowledge, and resources. Let's take a quick tour.",
      position: "bottom",
    },
    {
      target: ".category-hub-grid",
      title: "Browse by Category",
      text: "Explore 8 categories: Tools, Knowledge, Podcasts, YouTube, Training, Daily Watch, Bleeding Edge, and Niche AI.",
      position: "top",
    },
    {
      target: "#search-toggle, .search-bar",
      title: "Instant Search",
      text: "Press / anywhere to search across everything. Or use Cmd+K for the command palette to quickly navigate anywhere.",
      position: "bottom",
    },
    {
      target: ".topbar-actions",
      title: "Quick Actions",
      text: "Toggle dark mode, switch profiles, and access the menu. Press ? to see all keyboard shortcuts.",
      position: "bottom",
    },
    {
      target: ".features-strip",
      title: "Rate, Save & Track",
      text: "Rate tools with half-stars, save favorites to your Stack, mark what you use, and flag items to try later.",
      position: "bottom",
    },
    {
      target: null,
      title: "You're All Set!",
      text: "Start exploring! Press Cmd+K for the command palette, / for search, or ? for keyboard shortcuts. Happy discovering!",
      position: "center",
    },
  ];

  let currentStep = 0;
  let overlay = null;
  let isActive = false;

  function shouldShow() {
    return !localStorage.getItem(STORAGE_KEY);
  }

  function createOverlay() {
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

    overlay.querySelector(".tour-skip").addEventListener("click", finish);
    overlay.querySelector(".tour-prev").addEventListener("click", prev);
    overlay.querySelector(".tour-next").addEventListener("click", next);
    overlay.querySelector(".tour-backdrop").addEventListener("click", finish);

    document.addEventListener("keydown", handleKey);
  }

  function handleKey(e) {
    if (!isActive) return;
    if (e.key === "Escape") { finish(); e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key === "Enter") { next(); e.preventDefault(); }
    if (e.key === "ArrowLeft") { prev(); e.preventDefault(); }
  }

  function showStep(stepIndex) {
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    const tooltip = overlay.querySelector(".tour-tooltip");
    const spotlight = overlay.querySelector(".tour-spotlight");
    const progress = overlay.querySelector(".tour-progress");

    overlay.querySelector(".tour-title").textContent = step.title;
    overlay.querySelector(".tour-text").textContent = step.text;
    overlay.querySelector(".tour-prev").disabled = stepIndex === 0;

    const isLast = stepIndex === TOUR_STEPS.length - 1;
    overlay.querySelector(".tour-next").textContent = isLast ? "Get Started" : "Next";

    // Progress dots
    progress.innerHTML = TOUR_STEPS.map((_, i) =>
      `<span class="tour-dot${i === stepIndex ? " active" : i < stepIndex ? " done" : ""}"></span>`
    ).join("");

    // Position spotlight and tooltip
    const target = step.target ? document.querySelector(step.target) : null;
    if (target) {
      const rect = target.getBoundingClientRect();
      const pad = 8;
      spotlight.style.display = "block";
      spotlight.style.top = (rect.top - pad + window.scrollY) + "px";
      spotlight.style.left = (rect.left - pad) + "px";
      spotlight.style.width = (rect.width + pad * 2) + "px";
      spotlight.style.height = (rect.height + pad * 2) + "px";

      // Scroll target into view
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      // Position tooltip
      setTimeout(() => {
        const tRect = tooltip.getBoundingClientRect();
        if (step.position === "bottom") {
          tooltip.style.top = (rect.bottom + pad + 12 + window.scrollY) + "px";
          tooltip.style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - tRect.width / 2, window.innerWidth - tRect.width - 16)) + "px";
        } else {
          tooltip.style.top = (rect.top - tRect.height - pad - 12 + window.scrollY) + "px";
          tooltip.style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - tRect.width / 2, window.innerWidth - tRect.width - 16)) + "px";
        }
        tooltip.style.transform = "none";
      }, 100);
    } else {
      spotlight.style.display = "none";
      tooltip.style.top = "50%";
      tooltip.style.left = "50%";
      tooltip.style.transform = "translate(-50%, -50%)";
    }

    requestAnimationFrame(() => overlay.classList.add("tour-active"));
  }

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

  function finish() {
    isActive = false;
    localStorage.setItem(STORAGE_KEY, "true");
    if (overlay) {
      overlay.classList.remove("tour-active");
      setTimeout(() => overlay.remove(), 300);
      overlay = null;
    }
    document.removeEventListener("keydown", handleKey);
  }

  function start(force) {
    if (isActive) return;
    if (!force && !shouldShow()) return;
    isActive = true;
    currentStep = 0;
    createOverlay();
    setTimeout(() => showStep(0), 500);
  }

  // Auto-start for first-time visitors on the home page
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/")) {
        setTimeout(() => start(), 1200);
      }
    });
  } else {
    if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/")) {
      setTimeout(() => start(), 1200);
    }
  }

  window.OnboardingTour = { start };
})();
