/**
 * AI Knowledge Hub — Animations & Micro-interactions
 * Smooth entrance animations, scroll reveals, and interaction feedback
 */
(function () {
  // Intersection Observer for scroll-reveal animations
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    // Observe cards
    document.querySelectorAll(".card, .category-hub-card, .featured-card").forEach((el, i) => {
      el.style.setProperty("--reveal-delay", (i % 8) * 60 + "ms");
      el.classList.add("reveal-on-scroll");
      observer.observe(el);
    });
  }

  // Card hover tilt effect (subtle)
  function initCardTilt() {
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-2px)`;
    });
    document.addEventListener("mouseleave", (e) => {
      const card = e.target.closest(".card");
      if (card) card.style.transform = "";
    }, true);
  }

  // Button ripple effect
  function initRipple() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button, .hero-cta-btn, .stack-btn, .direct-use-btn, .want-to-try-btn");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      ripple.style.left = (e.clientX - rect.left) + "px";
      ripple.style.top = (e.clientY - rect.top) + "px";
      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  // Smooth page load animation
  function initPageLoad() {
    document.body.classList.add("page-entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("page-entered");
        document.body.classList.remove("page-entering");
      });
    });
  }

  // Counter animation for stats
  function animateCounters() {
    document.querySelectorAll("[data-animate-count]").forEach(el => {
      const target = parseInt(el.textContent, 10);
      if (isNaN(target) || target === 0) return;
      let current = 0;
      const step = Math.max(1, Math.floor(target / 30));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 30);
    });
  }

  // Init all on DOM ready
  function init() {
    initPageLoad();
    initRipple();
    // Delay heavier animations
    setTimeout(() => {
      initScrollReveal();
      initCardTilt();
    }, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Re-observe after dynamic content loads
  const origMutationObserver = new MutationObserver((mutations) => {
    let hasNewCards = false;
    mutations.forEach(m => {
      m.addedNodes.forEach(n => {
        if (n.nodeType === 1 && (n.classList?.contains("card") || n.querySelector?.(".card"))) {
          hasNewCards = true;
        }
      });
    });
    if (hasNewCards) setTimeout(initScrollReveal, 100);
  });
  origMutationObserver.observe(document.body, { childList: true, subtree: true });

  window.Animations = { animateCounters };
})();
