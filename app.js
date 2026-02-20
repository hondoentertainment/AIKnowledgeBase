/**
 * AI Knowledge Hub — App logic
 * Letterboxd-inspired poster cards, star ratings, expandable search, dark-first theme
 */

(function () {
  const pageCategory = document.body.dataset.category; // "tools" | "knowledge" | ... or undefined (hub)
  const isHub = !pageCategory;

  const searchToggle = document.getElementById("search-toggle");
  const searchBar = document.getElementById("search-bar");
  const searchEl = document.getElementById("search");
  const featuredRow = document.getElementById("featured-row");
  const mainEl = document.getElementById("main-content");
  const toolsGrid = document.getElementById("tools-grid");
  const knowledgeGrid = document.getElementById("knowledge-grid");
  const podcastsGrid = document.getElementById("podcasts-grid");
  const trainingGrid = document.getElementById("training-grid");
  const youtubeGrid = document.getElementById("youtube-grid");
  const dailyWatchGrid = document.getElementById("daily-watch-grid");
  const bleedingEdgeGrid = document.getElementById("bleeding-edge-grid");
  const toolsCount = document.getElementById("tools-count");
  const knowledgeCount = document.getElementById("knowledge-count");
  const podcastsCount = document.getElementById("podcasts-count");
  const youtubeCount = document.getElementById("youtube-count");
  const trainingCount = document.getElementById("training-count");
  const dailyWatchCount = document.getElementById("daily-watch-count");
  const bleedingEdgeCount = document.getElementById("bleeding-edge-count");
  const navTabs = document.querySelectorAll(".nav-tab");

  /* ========== Topbar scroll shadow ========== */
  const topbar = document.querySelector(".topbar");
  if (topbar) {
    const observer = new IntersectionObserver(
      ([e]) => topbar.classList.toggle("topbar-scrolled", !e.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    const hero = document.querySelector(".hero");
    if (hero) observer.observe(hero);
  }

  /* ========== Mobile nav toggle ========== */
  const navToggle = document.getElementById("nav-toggle");
  const navTabsEl = document.querySelector(".nav-tabs");
  const navBackdrop = document.getElementById("nav-backdrop");
  let scrollPosition = 0;

  function closeMobileNav() {
    if (!navTabsEl || !navToggle) return;
    navTabsEl.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    if (navBackdrop) {
      navBackdrop.classList.remove("visible");
      setTimeout(() => { navBackdrop.style.display = ""; }, 300);
    }
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
  }

  function openMobileNav() {
    if (!navTabsEl || !navToggle) return;
    scrollPosition = window.scrollY;
    document.body.style.top = `-${scrollPosition}px`;
    document.body.classList.add('nav-open');
    navTabsEl.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    if (navBackdrop) {
      navBackdrop.style.display = "block";
      requestAnimationFrame(() => navBackdrop.classList.add("visible"));
    }
    haptic();
  }

  if (navToggle && navTabsEl) {
    let touchStartX = 0;
    let touchEndX = 0;

    navToggle.addEventListener("click", () => {
      const isOpen = navTabsEl.classList.contains("open");
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Swipe gesture to close menu
    navTabsEl.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    navTabsEl.addEventListener("touchmove", (e) => {
      touchEndX = e.touches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (diff > 0 && diff < 150) {
        navTabsEl.style.transform = `translateX(-${diff}px)`;
        if (navBackdrop) navBackdrop.style.opacity = Math.max(0, 1 - diff / 150);
      }
    }, { passive: true });

    navTabsEl.addEventListener("touchend", () => {
      const diff = touchStartX - touchEndX;
      const threshold = 60;

      navTabsEl.style.transform = '';
      if (navBackdrop) navBackdrop.style.opacity = '';

      if (diff > threshold) {
        closeMobileNav();
        haptic();
      }
    });

    // Close on nav link click
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        haptic();
        closeMobileNav();
      });
    });

    // Close on backdrop click
    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeMobileNav);
    }

    // ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navTabsEl.classList.contains("open")) {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }

  /* ========== Bottom nav ========== */
  const bottomSearchBtn = document.getElementById("bottom-search-btn");
  const bottomMoreBtn = document.getElementById("bottom-more-btn");

  if (bottomSearchBtn && searchBar && searchEl) {
    bottomSearchBtn.addEventListener("click", () => {
      haptic();
      searchBar.classList.add("open");
      searchEl.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (bottomMoreBtn) {
    bottomMoreBtn.addEventListener("click", () => {
      haptic();
      if (navTabsEl && !navTabsEl.classList.contains("open")) {
        openMobileNav();
      } else {
        closeMobileNav();
      }
    });
  }

  // Haptic feedback on bottom nav items
  document.querySelectorAll(".bottom-nav-item").forEach((item) => {
    item.addEventListener("click", () => haptic());
  });

  /* ========== Search toggle ========== */
  if (searchToggle && searchBar && searchEl) searchToggle.addEventListener("click", () => {
    searchBar.classList.toggle("open");
    if (searchBar.classList.contains("open")) {
      searchEl.focus();
    } else {
      searchEl.value = "";
      filterCards("");
      searchToggle.focus();
    }
  });

  if (searchBar && searchEl) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchEl) {
        e.preventDefault();
        searchBar.classList.add("open");
        searchEl.focus();
      }
      if (e.key === "Escape" && searchBar.classList.contains("open")) {
        searchBar.classList.remove("open");
        searchEl.value = "";
        filterCards("");
        if (searchToggle) searchToggle.focus();
      }
    });
  }

  /* ========== Active nav tab on scroll (category pages only; single section so initial active is fine) ========== */

  /* ========== Haptic feedback (mobile polish) ========== */
  function haptic() {
    if (navigator.vibrate) navigator.vibrate(5);
  }

  /* ========== Helpers ========== */
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  function gradientCSS(colorPair) {
    if (colorPair && colorPair.length === 2) {
      return `linear-gradient(135deg, ${colorPair[0]} 0%, ${colorPair[1]} 100%)`;
    }
    return "linear-gradient(135deg, #30363d 0%, #21262d 100%)";
  }

  function deriveTrustSignals(item) {
    const trustSignals = [];
    const tags = (item.tags || []).map((tag) => String(tag).toLowerCase());
    const title = String(item.title || "").toLowerCase();
    const desc = String(item.description || "").toLowerCase();
    const url = String(item.url || "");
    let host = "";
    try {
      host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    } catch (_) {
      host = "";
    }

    const officialHosts = [
      "openai.com", "anthropic.com", "google.com", "deepmind.com", "microsoft.com",
      "aws.amazon.com", "huggingface.co", "github.com", "meta.com", "stability.ai"
    ];
    const hasOfficialHost = officialHosts.some((h) => host === h || host.endsWith("." + h));
    const hasDocsSignal = title.includes("documentation") || title.includes("docs")
      || desc.includes("documentation") || tags.some((t) => t.includes("documentation") || t.includes("guide"));
    const hasSourceSignal = tags.some((t) => t.includes("open source"))
      || desc.includes("open-source") || desc.includes("open source");
    const hasEvidenceSignal = desc.includes("cited") || desc.includes("sourced")
      || desc.includes("research") || tags.some((t) => t.includes("research"));
    const hasSecureSignal = url.startsWith("https://");

    if (hasOfficialHost) trustSignals.push({ cls: "trust-badge-official", label: "Official", title: "Official source domain" });
    if (hasSourceSignal) trustSignals.push({ cls: "trust-badge-oss", label: "Open source", title: "Open-source project or ecosystem" });
    if (hasDocsSignal) trustSignals.push({ cls: "trust-badge-docs", label: "Docs", title: "Documentation or learning guide" });
    if (hasEvidenceSignal) trustSignals.push({ cls: "trust-badge-evidence", label: "Research", title: "Research-backed or cited content" });
    if (hasSecureSignal) trustSignals.push({ cls: "trust-badge-secure", label: "HTTPS", title: "Secure connection available" });

    return trustSignals.slice(0, 2);
  }

  /* ========== Star rating helpers ========== */
  const STAR_SVG = '<svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>';
  function starHalfSvg(gradId) {
    return '<svg class="star-icon" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="' + gradId + '"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="url(#' + gradId + ')" stroke="currentColor" stroke-width="0.5"/></svg>';
  }
  let _starGradCounter = 0;
  function ratingGradId() {
    return "halfStar-" + (++_starGradCounter);
  }

  function getRating(title) {
    if (window.ProfileStore) return window.ProfileStore.getRating(title);
    const v = localStorage.getItem("rating:" + title);
    return v ? parseFloat(v) : 0;
  }

  function setRating(title, value) {
    if (window.ProfileStore) window.ProfileStore.setRating(title, value);
    else {
      if (value === 0) localStorage.removeItem("rating:" + title);
      else localStorage.setItem("rating:" + title, String(value));
    }
  }

  function buildStarsHTML(title) {
    const saved = getRating(title);
    const gradId = ratingGradId();
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = saved >= i;
      const isHalf = !isFull && saved >= i - 0.5;
      let cls = "star";
      if (isFull) cls += " filled";
      else if (isHalf) cls += " half-filled";

      stars.push(
        `<span class="${cls}" data-star="${i}" tabindex="0" role="button" aria-label="Rate ${i} of 5 stars">` +
          `<span class="star-half star-left" data-val="${i - 0.5}"></span>` +
          `<span class="star-half star-right" data-val="${i}"></span>` +
          (isHalf ? starHalfSvg(gradId) : STAR_SVG) +
        `</span>`
      );
    }
    const label = saved ? saved.toFixed(1).replace(/\.0$/, "") : "";
    const ariaLabel = saved ? `Rate ${escapeAttr(title)} — currently ${saved} of 5 stars` : `Rate ${escapeAttr(title)}`;
    return (
      `<div class="card-rating" data-title="${escapeAttr(title)}" data-rating="${saved}" data-grad-id="${escapeAttr(gradId)}" role="group" aria-label="${ariaLabel}">` +
        stars.join("") +
        `<span class="rating-value" aria-hidden="true">${label}</span>` +
      `</div>`
    );
  }

  function initStarInteractions() {
    const liveRegion = document.getElementById("rating-announcer");
    function announce(msg) {
      if (liveRegion) { liveRegion.textContent = msg; setTimeout(() => { liveRegion.textContent = ""; }, 500); }
    }
    document.querySelectorAll(".card-rating").forEach((container) => {
      const title = container.dataset.title;
      const starEls = container.querySelectorAll(".star");
      const label = container.querySelector(".rating-value");

      function updateDisplay(rating) {
        const gradId = container.dataset.gradId || "halfStar-fallback";
        starEls.forEach((el) => {
          const idx = parseInt(el.dataset.star, 10);
          el.classList.remove("filled", "half-filled", "preview", "preview-half");
          if (rating >= idx) {
            el.classList.add("filled");
            el.innerHTML =
              `<span class="star-half star-left" data-val="${idx - 0.5}"></span>` +
              `<span class="star-half star-right" data-val="${idx}"></span>` +
              STAR_SVG;
          } else if (rating >= idx - 0.5) {
            el.classList.add("half-filled");
            el.innerHTML =
              `<span class="star-half star-left" data-val="${idx - 0.5}"></span>` +
              `<span class="star-half star-right" data-val="${idx}"></span>` +
              starHalfSvg(gradId);
          } else {
            el.innerHTML =
              `<span class="star-half star-left" data-val="${idx - 0.5}"></span>` +
              `<span class="star-half star-right" data-val="${idx}"></span>` +
              STAR_SVG;
          }
        });
        label.textContent = rating ? String(rating).replace(/\.0$/, "") : "";
        container.dataset.rating = rating;
        const titleAttr = container.dataset.title || "";
        container.setAttribute("aria-label", rating ? `Rate ${titleAttr} — currently ${rating} of 5 stars` : `Rate ${titleAttr}`);
      }

      function previewStars(hoverVal) {
        container.classList.add("hovering");
        if (label) {
          label.textContent = String(hoverVal).replace(/\.0$/, "");
          label.classList.add("previewing");
        }
        starEls.forEach((el) => {
          const idx = parseInt(el.dataset.star, 10);
          el.classList.remove("preview", "preview-half");
          if (hoverVal >= idx) {
            el.classList.add("preview");
          } else if (hoverVal >= idx - 0.5) {
            el.classList.add("preview-half");
          }
        });
      }

      function clearPreview() {
        container.classList.remove("hovering");
        if (label) {
          const current = parseFloat(container.dataset.rating || "0");
          label.textContent = current ? String(current).replace(/\.0$/, "") : "";
          label.classList.remove("previewing");
        }
        starEls.forEach((el) => el.classList.remove("preview", "preview-half"));
      }

      starEls.forEach((starEl) => {
        starEl.querySelectorAll(".star-half").forEach((half) => {
          half.addEventListener("mouseenter", (e) => {
            previewStars(parseFloat(half.dataset.val));
          });

          half.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            haptic();
            const val = parseFloat(half.dataset.val);
            const current = getRating(title);
            const newVal = current === val ? 0 : val;
            setRating(title, newVal);
            clearPreview();
            updateDisplay(newVal);
            container.classList.add("just-rated");
            setTimeout(() => container.classList.remove("just-rated"), 450);
            announce(newVal ? "Rated " + newVal + " of 5" : "Rating cleared");
          });
        });

        starEl.addEventListener("keydown", (e) => {
          if (!["ArrowLeft", "ArrowRight", "Enter", " "].includes(e.key)) return;
          e.preventDefault();
          haptic();
          const current = getRating(title);
          const starArr = Array.from(starEls);
          const idx = starArr.indexOf(starEl);

          if (e.key === "ArrowRight") {
            const next = Math.min(5, current + 0.5);
            setRating(title, next);
            updateDisplay(next);
            if (idx < starArr.length - 1) starArr[idx + 1].focus();
            announce("Rated " + next + " of 5");
          } else if (e.key === "ArrowLeft") {
            const next = Math.max(0, current - 0.5);
            setRating(title, next);
            updateDisplay(next);
            if (idx > 0) starArr[idx - 1].focus();
            announce(next ? "Rated " + next + " of 5" : "Rating cleared");
          } else if (e.key === "Enter" || e.key === " ") {
            const starIdx = parseInt(starEl.dataset.star, 10);
            const val = current === starIdx ? 0 : starIdx;
            setRating(title, val);
            updateDisplay(val);
            container.classList.add("just-rated");
            setTimeout(() => container.classList.remove("just-rated"), 450);
            announce(val ? "Rated " + val + " of 5" : "Rating cleared");
          }
        });
      });

      container.addEventListener("mouseleave", clearPreview);
    });
  }

  /* ========== Stack helpers ========== */
  function getStack() {
    return window.ProfileStore ? window.ProfileStore.getStack() : [];
  }
  function isInStack(title) { return getStack().includes(title); }
  function addToStack(title) {
    const s = getStack();
    if (!s.includes(title)) {
      s.push(title);
      if (window.ProfileStore) window.ProfileStore.setStack(s);
      else localStorage.setItem("myStack", JSON.stringify(s));
    }
  }
  function removeFromStack(title) {
    const s = getStack().filter((t) => t !== title);
    if (window.ProfileStore) window.ProfileStore.setStack(s);
    else localStorage.setItem("myStack", JSON.stringify(s));
  }
  function toggleStack(title) {
    if (isInStack(title)) removeFromStack(title);
    else addToStack(title);
  }

  /* ========== Direct-use (I use this) helpers ========== */
  function getDirectUse() {
    return window.ProfileStore ? window.ProfileStore.getDirectUse() : [];
  }
  function isDirectUse(title) { return getDirectUse().includes(title); }
  function addDirectUse(title) {
    const d = getDirectUse();
    if (!d.includes(title)) {
      d.push(title);
      if (window.ProfileStore) window.ProfileStore.setDirectUse(d);
      else localStorage.setItem("directUse", JSON.stringify(d));
    }
  }
  function removeDirectUse(title) {
    const d = getDirectUse().filter((t) => t !== title);
    if (window.ProfileStore) window.ProfileStore.setDirectUse(d);
    else localStorage.setItem("directUse", JSON.stringify(d));
  }
  function toggleDirectUse(title) {
    if (isDirectUse(title)) removeDirectUse(title);
    else addDirectUse(title);
  }

  /* ========== Want to Try (flag) helpers ========== */
  function getWantToTry() {
    return window.ProfileStore ? window.ProfileStore.getWantToTry() : [];
  }
  function isWantToTry(title) { return getWantToTry().includes(title); }
  function addWantToTry(title) {
    const w = getWantToTry();
    if (!w.includes(title)) {
      w.push(title);
      if (window.ProfileStore) window.ProfileStore.setWantToTry(w);
      else localStorage.setItem("wantToTry", JSON.stringify(w));
    }
  }
  function removeWantToTry(title) {
    const w = getWantToTry().filter((t) => t !== title);
    if (window.ProfileStore) window.ProfileStore.setWantToTry(w);
    else localStorage.setItem("wantToTry", JSON.stringify(w));
  }
  function toggleWantToTry(title) {
    if (isWantToTry(title)) removeWantToTry(title);
    else addWantToTry(title);
  }

  /* ========== Level helpers ========== */
  function levelLabel(lvl) {
    if (lvl <= 2) return "Beginner";
    if (lvl <= 4) return "Intermediate";
    if (lvl <= 6) return "Advanced";
    if (lvl <= 8) return "Expert";
    return "World-Class";
  }

  function levelClass(lvl) {
    if (lvl <= 2) return "level-beginner";
    if (lvl <= 4) return "level-intermediate";
    if (lvl <= 6) return "level-advanced";
    if (lvl <= 8) return "level-expert";
    return "level-worldclass";
  }

  /* ========== Share helpers ========== */
  const SHARE_PAGE_MAP = { tools: "tools.html", knowledge: "knowledge.html", podcasts: "podcasts.html", youtube: "youtube.html", training: "training.html", "daily-watch": "daily-watch.html", "bleeding-edge": "bleeding-edge.html" };

  function getShareUrl(page, category, title) {
    const base = page === "niche" ? "niche.html" : (SHARE_PAGE_MAP[page] || "index.html");
    const params = new URLSearchParams({ share: category, id: title });
    const url = new URL(base, window.location.href);
    url.search = params.toString();
    return url.toString();
  }

  function shareItem(page, category, title, description, shareBtn) {
    const url = getShareUrl(page, category, title);
    const shareData = { url, title, text: description || title };

    const tryNative = navigator.share && navigator.canShare && navigator.canShare(shareData);
    if (tryNative) {
      navigator.share(shareData).then(() => showShareFeedback(shareBtn, true)).catch(() => copyAndFeedback(url, shareBtn));
    } else {
      copyAndFeedback(url, shareBtn);
    }
  }

  function copyAndFeedback(url, btn) {
    navigator.clipboard.writeText(url).then(() => showShareFeedback(btn, true)).catch(() => showShareFeedback(btn, false));
  }

  function showShareFeedback(btn, ok) {
    if (ok) haptic();
    const label = btn.getAttribute("aria-label") || "Share";
    const prev = btn.textContent;
    btn.textContent = ok ? "Link copied!" : "Share";
    btn.setAttribute("aria-label", ok ? "Link copied to clipboard" : label);
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = prev || "Share";
      btn.setAttribute("aria-label", label);
      btn.disabled = false;
    }, 2000);
  }

  function initShareButtons() {
    document.querySelectorAll(".share-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { sharePage, shareCategory, shareTitle, shareDesc } = btn.dataset;
        if (sharePage && shareCategory && shareTitle) {
          shareItem(sharePage, shareCategory, shareTitle, shareDesc || "", btn);
        }
      });
    });
  }

  function scrollToSharedCard() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("share");
    const id = params.get("id");
    if (!category || !id) return;
    if (isHub && SHARE_PAGE_MAP[category]) {
      window.location.replace(SHARE_PAGE_MAP[category] + window.location.search);
      return;
    }
    const decodedId = decodeURIComponent(id);
    const section = document.getElementById(category);
    if (!section) return;
    const cards = section.querySelectorAll(".card");
    const card = [...cards].find((c) => (c.dataset.title || "") === decodedId);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("card-shared-highlight");
    setTimeout(() => card.classList.remove("card-shared-highlight"), 2500);
    history.replaceState({}, "", window.location.pathname + (window.location.hash || ""));
  }

  /* ========== Build poster card ========== */
  function buildCard(item, category) {
    const url = item.url || "#";
    const icon = item.icon || "";
    const grad = gradientCSS(item.color);
    const tags = (item.tags || [])
      .map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`)
      .join("");

    const lvl = item.level || 0;
    const levelBadge = lvl
      ? `<span class="level-badge ${levelClass(lvl)}" title="${levelLabel(lvl)} (${lvl}/10)">${lvl}</span>`
      : "";

    const freq = item.freq || "";
    const freqBadge = freq
      ? `<span class="freq-badge" title="Output: ${escapeAttr(freq)}">${escapeHtml(freq)}</span>`
      : "";
    const inStack = isInStack(item.title);
    const stackBtn = `<button type="button" class="stack-btn ${inStack ? "in-stack" : ""}" data-stack-title="${escapeAttr(item.title)}" aria-label="${inStack ? "Remove from My Stack" : "Add to My Stack"}">${inStack ? "✓ In Stack" : "+ Add to Stack"}</button>`;

    const using = isDirectUse(item.title);
    const directUseBadge = using
      ? `<span class="direct-use-badge" title="I use this tool directly">✓ Using</span>`
      : "";
    const directUseBtn = `<button type="button" class="direct-use-btn ${using ? "using" : ""}" data-direct-use-title="${escapeAttr(item.title)}" aria-label="${using ? "Unmark as using" : "Mark as using directly"}">${using ? "✓ Using" : "I Use This"}</button>`;

    const flagged = isWantToTry(item.title);
    const wantToTryBadge = flagged
      ? `<span class="want-to-try-badge" title="Flagged to try">🔖</span>`
      : "";
    const wantToTryBtn = `<button type="button" class="want-to-try-btn ${flagged ? "flagged" : ""}" data-want-to-try-title="${escapeAttr(item.title)}" aria-label="${flagged ? "Remove from want to try" : "Flag to try"}">${flagged ? "🔖 Flagged" : "Want to Try"}</button>`;

    const cat = category || "tools";
    const shareBtn = `<button type="button" class="share-btn" data-share-page="${escapeAttr(pageCategory || cat)}" data-share-category="${escapeAttr(cat)}" data-share-title="${escapeAttr(item.title)}" data-share-desc="${escapeAttr(item.description || "")}" aria-label="Share ${escapeAttr(item.title)}">Share</button>`;
    const visitUrl = url && url !== "#" ? url : null;
    const visitBtn = visitUrl
      ? `<a href="${escapeHtml(visitUrl)}" class="visit-btn" target="_blank" rel="noopener" aria-label="Visit ${escapeAttr(item.title)}">Visit</a>`
      : "";
    const trustSignals = deriveTrustSignals(item);
    const trustSignalsHtml = trustSignals.length
      ? `<div class="card-trust-signals" aria-label="Trust signals">${trustSignals
          .map((signal) => `<span class="trust-badge ${signal.cls}" title="${escapeAttr(signal.title)}">${escapeHtml(signal.label)}</span>`)
          .join("")}</div>`
      : "";

    return `
      <div class="card"
         data-title="${escapeAttr(item.title)}"
         data-desc="${escapeAttr(item.description)}"
         data-tags="${escapeAttr((item.tags || []).join(" "))}">
        <a href="${escapeHtml(url)}" class="card-link" target="_blank" rel="noopener">
          <div class="card-cover" style="background:${grad}">
            ${freqBadge}
            ${levelBadge}
            ${directUseBadge}
            ${wantToTryBadge}
            <span class="card-cover-icon">${icon}</span>
          </div>
        </a>
        <div class="card-body">
          <a href="${escapeHtml(url)}" class="card-title" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>
          <p class="card-desc">${escapeHtml(item.description)}</p>
          ${trustSignalsHtml}
          ${buildStarsHTML(item.title)}
          <div class="card-actions">
            ${visitBtn}
            ${wantToTryBtn}
            ${directUseBtn}
            ${stackBtn}
            ${shareBtn}
          </div>
          ${tags ? `<div class="card-tags">${tags}</div>` : ""}
        </div>
      </div>`;
  }

  /* ========== Build featured card ========== */
  function buildFeaturedCard(item) {
    const url = item.url || "#";
    const icon = item.icon || "";
    const grad = gradientCSS(item.color);

    return `
      <a href="${escapeHtml(url)}" class="featured-card" target="_blank" rel="noopener">
        <div class="featured-card-bg" style="background:${grad}"></div>
        <div class="featured-card-content">
          <span class="featured-card-icon">${icon}</span>
          <h3 class="featured-card-title">${escapeHtml(item.title)}</h3>
          <p class="featured-card-desc">${escapeHtml(item.description)}</p>
        </div>
      </a>`;
  }

  /* ========== Custom tools (from Admin) ========== */
  function getCustomTools() {
    try {
      const j = localStorage.getItem("customTools");
      return j ? JSON.parse(j) : { tools: [], knowledge: [], podcasts: [], youtube: [], training: [], dailyWatch: [], bleedingEdge: [] };
    } catch (_) {
      return { tools: [], knowledge: [], podcasts: [], youtube: [], training: [], dailyWatch: [], bleedingEdge: [] };
    }
  }

  /* ========== Category config ========== */
  const CATEGORY_CONFIG = [
    { id: "tools", dataKey: "tools", gridId: "tools-grid", countId: "tools-count", hubCountId: "hub-tools-count", emptyHtml: '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">📚</span><p>No tools in this category yet.</p><a href="admin.html" class="section-empty-cta">Add a tool in Admin</a></div>' },
    { id: "knowledge", dataKey: "knowledge", gridId: "knowledge-grid", countId: "knowledge-count", hubCountId: "hub-knowledge-count", emptyHtml: '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">📖</span><p>No knowledge items yet.</p><a href="admin.html" class="section-empty-cta">Add in Admin</a></div>' },
    { id: "podcasts", dataKey: "podcasts", gridId: "podcasts-grid", countId: "podcasts-count", hubCountId: "hub-podcasts-count", emptyHtml: '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">🎙️</span><p>No podcasts yet.</p><a href="admin.html" class="section-empty-cta">Add in Admin</a></div>' },
    { id: "youtube", dataKey: "youtube", gridId: "youtube-grid", countId: "youtube-count", hubCountId: "hub-youtube-count", emptyHtml: '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">▶️</span><p>No YouTube channels yet.</p><a href="admin.html" class="section-empty-cta">Add in Admin</a></div>' },
    { id: "training", dataKey: "training", gridId: "training-grid", countId: "training-count", hubCountId: "hub-training-count", emptyHtml: '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">🎓</span><p>No training links yet.</p><a href="admin.html" class="section-empty-cta">Add in Admin</a></div>' },
    { id: "daily-watch", dataKey: "dailyWatch", gridId: "daily-watch-grid", countId: "daily-watch-count", hubCountId: "hub-daily-watch-count", emptyHtml: '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">📰</span><p>No daily watch sites yet.</p><a href="admin.html" class="section-empty-cta">Add in Admin</a></div>' },
    { id: "bleeding-edge", dataKey: "bleedingEdge", gridId: "bleeding-edge-grid", countId: "bleeding-edge-count", hubCountId: "hub-bleeding-edge-count", emptyHtml: '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">⚡</span><p>No bleeding edge resources yet.</p><a href="admin.html" class="section-empty-cta">Add in Admin</a></div>' },
  ];

  /* ========== Render ========== */
  function render() {
    try {
      if (typeof siteData !== "object" || !siteData) {
        console.error("AI Knowledge Hub: siteData not loaded");
        if (mainEl) {
          mainEl.classList.remove("main-loading");
          mainEl.innerHTML = '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">⚠️</span><p>Unable to load content. Please refresh the page.</p></div>';
        }
        return;
      }
    } catch (err) {
      console.error("AI Knowledge Hub: render error", err);
      if (mainEl) {
        mainEl.classList.remove("main-loading");
        mainEl.innerHTML = '<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">⚠️</span><p>Something went wrong. Please refresh the page.</p></div>';
      }
      return;
    }

    const custom = getCustomTools();
    const data = {
      tools: [...(siteData.tools || []), ...(custom.tools || [])],
      knowledge: [...(siteData.knowledge || []), ...(custom.knowledge || [])],
      podcasts: [...(siteData.podcasts || []), ...(custom.podcasts || [])],
      youtube: [...(siteData.youtube || []), ...(custom.youtube || [])],
      training: [...(siteData.training || []), ...(custom.training || [])],
      dailyWatch: [...(siteData.dailyWatch || []), ...(custom.dailyWatch || [])],
      bleedingEdge: [...(siteData.bleedingEdge || []), ...(custom.bleedingEdge || [])],
    };

    const tools = data.tools;
    const knowledge = data.knowledge;
    const podcasts = data.podcasts;
    const youtube = data.youtube || [];
    const training = data.training || [];
    const dailyWatch = data.dailyWatch || [];
    const bleedingEdge = data.bleedingEdge || [];

    if (isHub) {
      const heroTools = document.getElementById("hero-tools-count");
      const heroKnowledge = document.getElementById("hero-knowledge-count");
      const heroPodcasts = document.getElementById("hero-podcasts-count");
      if (heroTools) heroTools.textContent = tools.length;
      if (heroKnowledge) heroKnowledge.textContent = knowledge.length;
      if (heroPodcasts) heroPodcasts.textContent = podcasts.length;

      const heroAnnouncer = document.getElementById("hero-stats-announcer");
      if (heroAnnouncer) {
        heroAnnouncer.textContent = `Catalog loaded: ${tools.length} tools, ${knowledge.length} knowledge, ${podcasts.length} podcasts`;
        setTimeout(() => { heroAnnouncer.textContent = ""; }, 800);
      }

      CATEGORY_CONFIG.forEach((cfg) => {
        const hubEl = document.getElementById(cfg.hubCountId);
        if (hubEl) hubEl.textContent = (data[cfg.dataKey] || []).length;
      });

      const directUse = getDirectUse();
      const allItems = [
        ...tools.map((t) => ({ ...t, cat: "tools" })),
        ...knowledge.map((k) => ({ ...k, cat: "knowledge" })),
        ...podcasts.map((p) => ({ ...p, cat: "podcasts" })),
        ...youtube.map((y) => ({ ...y, cat: "youtube" })),
        ...training.map((t) => ({ ...t, cat: "training" })),
        ...dailyWatch.map((d) => ({ ...d, cat: "dailyWatch" })),
        ...bleedingEdge.map((b) => ({ ...b, cat: "bleedingEdge" })),
      ];
      const withScore = allItems.map((item) => {
        const using = directUse.includes(item.title) ? 2 : 0;
        const rating = getRating(item.title);
        return { item, score: using + (rating || 0) };
      });
      const featured = [...withScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map(({ item }) => item);

      if (featuredRow) {
        featuredRow.removeAttribute("aria-busy");
        const loadingEl = document.getElementById("featured-loading");
        if (loadingEl) loadingEl.remove();
        if (featured.length > 0) {
          featuredRow.innerHTML = featured.map((item) => buildFeaturedCard(item)).join("");
          featuredRow.setAttribute("aria-label", `Top picks: ${featured.length} items`);
        } else {
          featuredRow.innerHTML = '<p class="featured-empty">No top picks yet. Add items and rate them to see recommendations.</p>';
          featuredRow.setAttribute("aria-label", "No top picks yet");
        }
      }
    } else {
      const cfg = CATEGORY_CONFIG.find((c) => c.id === pageCategory);
      if (cfg) {
        const grid = document.getElementById(cfg.gridId);
        const countEl = document.getElementById(cfg.countId);
        const items = data[cfg.dataKey] || [];
        if (countEl) countEl.textContent = items.length;
        if (grid) grid.innerHTML = items.length ? items.map((i) => buildCard(i, cfg.id)).join("") : cfg.emptyHtml;
      }
    }

    const main = document.getElementById("main-content");
    if (main) {
      main.classList.remove("main-loading");
      main.removeAttribute("aria-busy");
    }

    initStarInteractions();
    initStackButtons();
    initDirectUseButtons();
    initWantToTryButtons();
    initShareButtons();
    scrollToSharedCard();
  }

  function initDirectUseButtons() {
    document.querySelectorAll(".direct-use-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        haptic();
        const title = btn.dataset.directUseTitle;
        toggleDirectUse(title);
        btn.classList.toggle("using", isDirectUse(title));
        btn.textContent = isDirectUse(title) ? "✓ Using" : "I Use This";
        btn.setAttribute("aria-label", isDirectUse(title) ? "Unmark as using" : "Mark as using directly");
        const card = btn.closest(".card");
        const cover = card?.querySelector(".card-cover");
        if (cover) {
          const badge = cover.querySelector(".direct-use-badge");
          if (isDirectUse(title)) {
            if (!badge) {
              const newBadge = document.createElement("span");
              newBadge.className = "direct-use-badge";
              newBadge.title = "I use this tool directly";
              newBadge.textContent = "✓ Using";
              cover.appendChild(newBadge);
            }
          } else if (badge) {
            badge.remove();
          }
        }
      });
    });
  }

  function initWantToTryButtons() {
    document.querySelectorAll(".want-to-try-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        haptic();
        const title = btn.dataset.wantToTryTitle;
        toggleWantToTry(title);
        btn.classList.toggle("flagged", isWantToTry(title));
        btn.textContent = isWantToTry(title) ? "🔖 Flagged" : "Want to Try";
        btn.setAttribute("aria-label", isWantToTry(title) ? "Remove from want to try" : "Flag to try");
        const card = btn.closest(".card");
        const cover = card?.querySelector(".card-cover");
        if (cover) {
          const badge = cover.querySelector(".want-to-try-badge");
          if (isWantToTry(title)) {
            if (!badge) {
              const newBadge = document.createElement("span");
              newBadge.className = "want-to-try-badge";
              newBadge.title = "Flagged to try";
              newBadge.textContent = "🔖";
              cover.appendChild(newBadge);
            }
          } else if (badge) {
            badge.remove();
          }
        }
      });
    });
  }

  function initStackButtons() {
    document.querySelectorAll(".stack-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        haptic();
        const title = btn.dataset.stackTitle;
        toggleStack(title);
        btn.classList.toggle("in-stack", isInStack(title));
        btn.textContent = isInStack(title) ? "✓ In Stack" : "+ Add to Stack";
        btn.setAttribute("aria-label", isInStack(title) ? "Remove from My Stack" : "Add to My Stack");
      });
    });
  }

  render();

  window.addEventListener("profile-changed", () => render());

  /* ========== Search / filter ========== */
  const searchResultsEl = document.getElementById("search-results");
  const totalCards = () => document.querySelectorAll(".card").length;

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function filterCards(query) {
    const q = (query || "").trim();
    const matchFn = window.SearchUtils && window.SearchUtils.matchCard
      ? (card) => window.SearchUtils.matchCard(q, card)
      : (card) => {
          const ql = q.toLowerCase();
          const title = (card.dataset.title || "").toLowerCase();
          const desc = (card.dataset.desc || "").toLowerCase();
          const tags = (card.dataset.tags || "").toLowerCase();
          return !ql || title.includes(ql) || desc.includes(ql) || tags.includes(ql);
        };
    let visible = 0;
    document.querySelectorAll(".card").forEach((card) => {
      const match = !q || matchFn(card);
      card.classList.toggle("hidden", !match);
      if (match) visible++;
    });
    const noResultsEl = document.getElementById("search-no-results");
    if (noResultsEl) noResultsEl.remove();
    if (q) {
      if (searchResultsEl) {
        searchResultsEl.textContent = visible === 0 ? "No results — try different keywords" : visible + " of " + totalCards();
      }
      if (visible === 0 && mainEl) {
        const placeholder = document.createElement("div");
        placeholder.id = "search-no-results";
        placeholder.className = "section-empty";
        placeholder.setAttribute("role", "status");
        placeholder.innerHTML = '<span class="section-empty-icon" aria-hidden="true">🔍</span><p>No matches for "<strong></strong>". Try different keywords or clear search.</p>';
        placeholder.querySelector("strong").textContent = query.trim();
        const firstGrid = mainEl.querySelector(".card-grid");
        if (firstGrid) firstGrid.appendChild(placeholder);
      }
    } else {
      if (searchResultsEl) searchResultsEl.textContent = "";
    }
  }

  const debouncedFilter = debounce((v) => filterCards(v), 80);
  const searchForm = document.getElementById("search-form");
  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      debouncedFilter(e.target.value);
      updateSearchSuggestions(e.target.value);
    });
    searchEl.addEventListener("search", (e) => filterCards(e.target.value));
  }
  if (searchForm && searchEl) {
    searchForm.addEventListener("submit", (e) => {
      const q = (searchEl.value || "").trim();
      if (q && window.SearchUtils) window.SearchUtils.addRecentSearch(q);
      if (pageCategory) {
        e.preventDefault();
        filterCards(q);
      }
    });
  }

  /* ========== Search suggestions (recent + popular) ========== */
  let searchSuggestionsEl = null;
  function ensureSuggestionsDropdown() {
    if (searchSuggestionsEl) return;
    const inner = searchBar && searchBar.querySelector(".search-bar-inner");
    if (!inner) return;
    searchSuggestionsEl = document.createElement("div");
    searchSuggestionsEl.id = "search-suggestions";
    searchSuggestionsEl.className = "search-suggestions";
    searchSuggestionsEl.setAttribute("role", "listbox");
    searchSuggestionsEl.setAttribute("aria-label", "Recent and popular searches");
    searchSuggestionsEl.hidden = true;
    inner.appendChild(searchSuggestionsEl);
  }
  function renderSuggestions(recent, popular) {
    if (!searchSuggestionsEl) return;
    const parts = [];
    if (recent && recent.length > 0) {
      parts.push('<div class="search-suggestions-section"><span class="search-suggestions-label">Recent</span>');
      recent.slice(0, 5).forEach((q) => {
        parts.push(`<button type="button" class="search-suggestion" role="option" data-query="${escapeAttr(q)}">${escapeHtml(q)}</button>`);
      });
      parts.push("</div>");
    }
    const pop = popular || (window.SearchUtils && window.SearchUtils.getPopularQueries ? window.SearchUtils.getPopularQueries() : []);
    if (pop && pop.length > 0) {
      parts.push('<div class="search-suggestions-section"><span class="search-suggestions-label">Popular</span>');
      pop.slice(0, 5).forEach((q) => {
        parts.push(`<button type="button" class="search-suggestion" role="option" data-query="${escapeAttr(q)}">${escapeHtml(q)}</button>`);
      });
      parts.push("</div>");
    }
    searchSuggestionsEl.innerHTML = parts.join("");
    searchSuggestionsEl.querySelectorAll(".search-suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const query = btn.dataset.query || "";
        if (searchEl) searchEl.value = query;
        filterCards(query);
        if (query && window.SearchUtils) window.SearchUtils.addRecentSearch(query);
        if (query && isHub) window.location.href = "search.html?q=" + encodeURIComponent(query);
        hideSuggestions();
      });
    });
  }
  function updateSearchSuggestions(inputValue) {
    if (!searchBar || !searchEl) return;
    const q = (inputValue || "").trim();
    if (q.length > 0) {
      hideSuggestions();
      return;
    }
    ensureSuggestionsDropdown();
    const recent = window.SearchUtils && window.SearchUtils.getRecentSearches ? window.SearchUtils.getRecentSearches() : [];
    const popular = window.SearchUtils && window.SearchUtils.getPopularQueries ? window.SearchUtils.getPopularQueries() : [];
    renderSuggestions(recent, popular);
    if (recent.length > 0 || (popular && popular.length > 0)) {
      searchSuggestionsEl.hidden = false;
    } else {
      searchSuggestionsEl.hidden = true;
    }
  }
  function hideSuggestions() {
    if (searchSuggestionsEl) searchSuggestionsEl.hidden = true;
  }
  if (searchBar && searchEl) {
    searchEl.addEventListener("focus", () => updateSearchSuggestions(searchEl.value));
    searchBar.addEventListener("focusout", (e) => {
      if (!searchBar.contains(e.relatedTarget)) setTimeout(hideSuggestions, 150);
    });
  }

  /* ========== Back to top ========== */
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    const scrollThreshold = 400;
    const onScroll = () => {
      backToTop.classList.toggle("hidden", window.scrollY < scrollThreshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    onScroll();
  }
})();
