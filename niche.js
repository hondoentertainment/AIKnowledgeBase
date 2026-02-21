/**
 * Niche AI — App logic for niche categories
 * Taxes, Home, Travel, Books, Media, Entertainment, Sports,
 * Health, Education, Finance, Legal, Pets, Food, Gardening,
 * Real Estate, Career, Automotive, Writing, Marketing
 */

(function () {
  const searchToggle = document.getElementById("search-toggle");
  const searchBar = document.getElementById("search-bar");
  const searchEl = document.getElementById("search");
  const featuredRow = document.getElementById("featured-row");
  const sections = document.querySelectorAll(".section");
  const navTabs = document.querySelectorAll(".nav-tab");

  const categoryIds = [
    "taxes", "home", "travel", "books", "media", "entertainment", "sports",
    "health", "education", "finance", "legal", "pets", "food", "gardening",
    "realEstate", "career", "automotive", "writing", "marketing"
  ];

  /* ========== Mobile nav toggle ========== */
  const navToggle = document.getElementById("nav-toggle");
  const navTabsEl = document.querySelector(".nav-tabs");
  if (navToggle && navTabsEl) {
    navToggle.addEventListener("click", () => {
      navTabsEl.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", navTabsEl.classList.contains("open"));
    });
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        navTabsEl.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ========== Search toggle ========== */
  searchToggle.addEventListener("click", () => {
    searchBar.classList.toggle("open");
    if (searchBar.classList.contains("open")) {
      searchEl.focus();
    } else {
      searchEl.value = "";
      filterCards("");
    }
  });

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
    }
  });

  /* ========== Active nav tab on scroll ========== */
  const observerOpts = { rootMargin: "-40% 0px -55% 0px" };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const isNicheSection = categoryIds.includes(id);
        const nicheTab = document.querySelector('.nav-tab[href="niche.html"]');
        navTabs.forEach((tab) => tab.classList.remove("active"));
        if (isNicheSection && nicheTab) {
          nicheTab.classList.add("active");
        }
        /* Update TOC active link */
        const tocLinks = document.querySelectorAll(".niche-toc-links a");
        tocLinks.forEach((a) => {
          const href = a.getAttribute("href");
          a.classList.toggle("active", href === "#" + id);
        });
      }
    });
  }, observerOpts);

  sections.forEach((s) => sectionObserver.observe(s));

  /* ========== TOC collapse toggle (mobile) ========== */
  const tocToggle = document.getElementById("niche-toc-toggle");
  const tocLinks = document.getElementById("niche-toc-links");
  if (tocToggle && tocLinks) {
    const collapsedKey = "nicheTocCollapsed";
    const isCollapsed = () => tocLinks.classList.contains("collapsed");
    function updateToggleLabel() {
      tocToggle.textContent = isCollapsed() ? "Show categories" : "Hide categories";
      tocToggle.setAttribute("aria-expanded", !isCollapsed());
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem(collapsedKey) === "1") {
      tocLinks.classList.add("collapsed");
      updateToggleLabel();
    }
    tocToggle.addEventListener("click", () => {
      tocLinks.classList.toggle("collapsed");
      localStorage.setItem(collapsedKey, isCollapsed() ? "1" : "0");
      updateToggleLabel();
    });
    updateToggleLabel();
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

  /* ========== Haptic feedback ========== */
  function haptic() {
    if (navigator.vibrate) navigator.vibrate(5);
  }

  /* ========== Star rating helpers ========== */
  const STAR_SVG = '<svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>';
  function starHalfSvg(gradId) {
    return '<svg class="star-icon" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="' + gradId + '"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="url(#' + gradId + ')" stroke="currentColor" stroke-width="0.5"/></svg>';
  }
  let _starGradCounter = 0;
  function ratingGradId() {
    return "halfStar-niche-" + (++_starGradCounter);
  }
  function getRating(title) {
    if (window.ProfileStore) return window.ProfileStore.getRating(title);
    const v = localStorage.getItem("rating:" + title);
    return v ? parseFloat(v) : 0;
  }
  function setRating(title, value) {
    if (window.ProfileStore) {
      window.ProfileStore.setRating(title, value);
      return;
    }
    if (value === 0) localStorage.removeItem("rating:" + title);
    else localStorage.setItem("rating:" + title, String(value));
  }
  function buildStarsHTML(title) {
    const saved = getRating(title);
    const gradId = ratingGradId();
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = saved >= i;
      const isHalf = !isFull && saved >= i - 0.5;
      const cls = "star" + (isFull ? " filled" : isHalf ? " half-filled" : "");
      stars.push(
        '<span class="' + cls + '" data-star="' + i + '" tabindex="0" role="button" aria-label="Rate ' + i + ' of 5 stars">' +
        '<span class="star-half star-left" data-val="' + (i - 0.5) + '"></span>' +
        '<span class="star-half star-right" data-val="' + i + '"></span>' +
        (isHalf ? starHalfSvg(gradId) : STAR_SVG) + '</span>'
      );
    }
    const label = saved ? String(saved).replace(/\.0$/, "") : "";
    const ariaLabel = saved ? "Rate " + escapeAttr(title) + " — currently " + saved + " of 5 stars" : "Rate " + escapeAttr(title);
    return '<div class="card-rating" data-title="' + escapeAttr(title) + '" data-rating="' + saved + '" data-grad-id="' + escapeAttr(gradId) + '" role="group" aria-label="' + ariaLabel + '">' +
      stars.join("") + '<span class="rating-value" aria-hidden="true">' + label + '</span></div>';
  }

  /* ========== Direct-use & Want to Try helpers ========== */
  function getDirectUse() {
    return window.ProfileStore ? window.ProfileStore.getDirectUse() : [];
  }
  function isDirectUse(title) { return getDirectUse().includes(title); }
  function toggleDirectUse(title) {
    const d = getDirectUse();
    if (d.includes(title)) {
      const next = d.filter((t) => t !== title);
      if (window.ProfileStore) window.ProfileStore.setDirectUse(next);
      else localStorage.setItem("directUse", JSON.stringify(next));
    } else {
      d.push(title);
      if (window.ProfileStore) window.ProfileStore.setDirectUse(d);
      else localStorage.setItem("directUse", JSON.stringify(d));
    }
  }
  function getWantToTry() {
    return window.ProfileStore ? window.ProfileStore.getWantToTry() : [];
  }
  function isWantToTry(title) { return getWantToTry().includes(title); }
  function toggleWantToTry(title) {
    const w = getWantToTry();
    if (w.includes(title)) {
      const next = w.filter((t) => t !== title);
      if (window.ProfileStore) window.ProfileStore.setWantToTry(next);
      else localStorage.setItem("wantToTry", JSON.stringify(next));
    } else {
      w.push(title);
      if (window.ProfileStore) window.ProfileStore.setWantToTry(w);
      else localStorage.setItem("wantToTry", JSON.stringify(w));
    }
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

  /* ========== Share helpers ========== */
  function getShareUrl(page, category, title) {
    const base = page === "niche" ? "niche.html" : "index.html";
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
    const label = btn.getAttribute("aria-label") || "Share";
    const prev = btn.textContent;
    btn.textContent = ok ? "Link copied!" : "Copy failed";
    btn.setAttribute("aria-label", ok ? "Link copied to clipboard" : "Copy failed");
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
    const decodedId = decodeURIComponent(id);
    const section = document.getElementById(category);
    if (!section) return;
    const cards = section.querySelectorAll(".card");
    const card = [...cards].find((c) => (c.dataset.title || "") === decodedId);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("card-shared-highlight");
    setTimeout(() => card.classList.remove("card-shared-highlight"), 2500);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute("content", decodedId + " | AI Knowledge Hub");
    if (ogDesc) ogDesc.setAttribute("content", (card.dataset.desc || decodedId) + " — shared from AI Knowledge Hub");
    history.replaceState({}, "", window.location.pathname + (window.location.hash || ""));
  }

  /* ========== Build card ========== */
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

    const using = isDirectUse(item.title);
    const directUseBadge = using ? `<span class="direct-use-badge" title="I use this tool directly">✓ Using</span>` : "";
    const directUseBtn = `<button type="button" class="direct-use-btn ${using ? "using" : ""}" data-direct-use-title="${escapeAttr(item.title)}" aria-label="${using ? "Unmark as using" : "Mark as using directly"}">${using ? "✓ Using" : "I Use This"}</button>`;

    const flagged = isWantToTry(item.title);
    const wantToTryBadge = flagged ? `<span class="want-to-try-badge" title="Flagged to try">🔖</span>` : "";
    const wantToTryBtn = `<button type="button" class="want-to-try-btn ${flagged ? "flagged" : ""}" data-want-to-try-title="${escapeAttr(item.title)}" aria-label="${flagged ? "Remove from want to try" : "Flag to try"}">${flagged ? "🔖 Flagged" : "Want to Try"}</button>`;

    const inStack = isInStack(item.title);
    const stackBtn = `<button type="button" class="stack-btn ${inStack ? "in-stack" : ""}" data-stack-title="${escapeAttr(item.title)}" aria-label="${inStack ? "Remove from My Stack" : "Add to My Stack"}">${inStack ? "✓ In Stack" : "+ Add to Stack"}</button>`;

    const cat = category || "taxes";
    const shareBtn = `<button type="button" class="share-btn" data-share-page="niche" data-share-category="${escapeAttr(cat)}" data-share-title="${escapeAttr(item.title)}" data-share-desc="${escapeAttr(item.description || "")}" aria-label="Share ${escapeAttr(item.title)}">Share</button>`;
    const visitUrl = url && url !== "#" ? url : null;
    const visitBtn = visitUrl
      ? `<a href="${escapeHtml(visitUrl)}" class="visit-btn" target="_blank" rel="noopener" aria-label="Visit ${escapeAttr(item.title)}">Visit</a>`
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

  /* ========== Render ========== */
  function render() {
    categoryIds.forEach((id) => {
      const items = nicheData[id] || [];
      const countEl = document.getElementById(`${id}-count`);
      const gridEl = document.getElementById(`${id}-grid`);

      if (countEl) countEl.textContent = items.length;
      if (gridEl) {
        gridEl.innerHTML = items.length
          ? items.map((item) => {
              const enriched = { ...item, category: "niche", nicheSection: id };
              return (window.CardBuilder?.buildCard)
                ? window.CardBuilder.buildCard(enriched, id)
                : buildCard(item, id);
            }).join("")
          : `<div class="section-empty"><span class="section-empty-icon" aria-hidden="true">📂</span><p>No tools in ${id} yet. Add via <a href="admin.html" class="section-empty-link">Admin</a> or edit niche-data.js.</p></div>`;
      }
    });

    /* Featured row: first item from a few categories */
    const featured = [
      nicheData.taxes?.[0],
      nicheData.travel?.[0],
      nicheData.entertainment?.[0],
      nicheData.health?.[0],
      nicheData.realEstate?.[0],
      nicheData.writing?.[0],
    ].filter(Boolean);

    featuredRow.innerHTML = featured.map((item) => buildFeaturedCard(item)).join("");

    if (window.CardBuilder?.initInteractions) window.CardBuilder.initInteractions();
    else {
      initStarInteractions();
      initDirectUseButtons();
      initWantToTryButtons();
      initStackButtons();
      initShareButtons();
    }
    scrollToSharedCard();
  }

  function initStarInteractions() {
    document.querySelectorAll(".card-rating").forEach((container) => {
      const title = container.dataset.title;
      const starEls = container.querySelectorAll(".star");
      const label = container.querySelector(".rating-value");
      const liveRegion = document.getElementById("rating-announcer");
      function announce(msg) {
        if (liveRegion) { liveRegion.textContent = msg; setTimeout(() => { liveRegion.textContent = ""; }, 500); }
      }
      function updateDisplay(rating) {
        const gradId = container.dataset.gradId || "halfStar-fallback";
        starEls.forEach((el) => {
          const idx = parseInt(el.dataset.star, 10);
          el.classList.remove("filled", "half-filled", "preview", "preview-half");
          if (rating >= idx) {
            el.classList.add("filled");
            el.innerHTML = '<span class="star-half star-left" data-val="' + (idx - 0.5) + '"></span><span class="star-half star-right" data-val="' + idx + '"></span>' + STAR_SVG;
          } else if (rating >= idx - 0.5) {
            el.classList.add("half-filled");
            el.innerHTML = '<span class="star-half star-left" data-val="' + (idx - 0.5) + '"></span><span class="star-half star-right" data-val="' + idx + '"></span>' + starHalfSvg(gradId);
          } else {
            el.innerHTML = '<span class="star-half star-left" data-val="' + (idx - 0.5) + '"></span><span class="star-half star-right" data-val="' + idx + '"></span>' + STAR_SVG;
          }
        });
        label.textContent = rating ? String(rating).replace(/\.0$/, "") : "";
        container.dataset.rating = rating;
        const titleAttr = container.dataset.title || "";
        container.setAttribute("aria-label", rating ? "Rate " + titleAttr + " — currently " + rating + " of 5 stars" : "Rate " + titleAttr);
      }
      function previewStars(hoverVal) {
        container.classList.add("hovering");
        starEls.forEach((el) => {
          const idx = parseInt(el.dataset.star, 10);
          el.classList.remove("preview", "preview-half");
          if (hoverVal >= idx) el.classList.add("preview");
          else if (hoverVal >= idx - 0.5) el.classList.add("preview-half");
        });
      }
      function clearPreview() {
        container.classList.remove("hovering");
        starEls.forEach((el) => el.classList.remove("preview", "preview-half"));
      }
      starEls.forEach((starEl) => {
        starEl.querySelectorAll(".star-half").forEach((half) => {
          half.addEventListener("mouseenter", () => previewStars(parseFloat(half.dataset.val)));
          half.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            haptic();
            window.MobileUX?.haptic?.success?.();
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

  function initDirectUseButtons() {
    document.querySelectorAll(".direct-use-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        haptic();
        const title = btn.dataset.directUseTitle;
        const wasUsing = isDirectUse(title);
        toggleDirectUse(title);
        if (isDirectUse(title) && !wasUsing) window.MobileUX?.haptic?.success?.();
        btn.classList.toggle("using", isDirectUse(title));
        btn.textContent = isDirectUse(title) ? "✓ Using" : "I Use This";
        btn.setAttribute("aria-label", isDirectUse(title) ? "Unmark as using" : "Mark as using directly");
        const card = btn.closest(".card");
        const cover = card?.querySelector(".card-cover");
        if (cover) {
          const badge = cover.querySelector(".direct-use-badge");
          if (isDirectUse(title)) {
            if (!badge) {
              const b = document.createElement("span");
              b.className = "direct-use-badge";
              b.title = "I use this tool directly";
              b.textContent = "✓ Using";
              cover.appendChild(b);
            }
          } else if (badge) badge.remove();
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
        const wasFlagged = isWantToTry(title);
        toggleWantToTry(title);
        if (isWantToTry(title) && !wasFlagged) window.MobileUX?.haptic?.success?.();
        btn.classList.toggle("flagged", isWantToTry(title));
        btn.textContent = isWantToTry(title) ? "🔖 Flagged" : "Want to Try";
        btn.setAttribute("aria-label", isWantToTry(title) ? "Remove from want to try" : "Flag to try");
        const card = btn.closest(".card");
        const cover = card?.querySelector(".card-cover");
        if (cover) {
          const badge = cover.querySelector(".want-to-try-badge");
          if (isWantToTry(title)) {
            if (!badge) {
              const b = document.createElement("span");
              b.className = "want-to-try-badge";
              b.title = "Flagged to try";
              b.textContent = "🔖";
              cover.appendChild(b);
            }
          } else if (badge) badge.remove();
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
        const wasInStack = isInStack(title);
        toggleStack(title);
        const nowInStack = isInStack(title);
        if (nowInStack && !wasInStack) window.MobileUX?.haptic?.success?.();
        btn.classList.toggle("in-stack", nowInStack);
        btn.textContent = nowInStack ? "✓ In Stack" : "+ Add to Stack";
        btn.setAttribute("aria-label", nowInStack ? "Remove from My Stack" : "Add to My Stack");
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
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  function filterCards(query) {
    const q = (query || "").toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll(".card").forEach((card) => {
      const title = (card.dataset.title || "").toLowerCase();
      const desc = (card.dataset.desc || "").toLowerCase();
      const tags = (card.dataset.tags || "").toLowerCase();
      const match = !q || title.includes(q) || desc.includes(q) || tags.includes(q);
      card.classList.toggle("hidden", !match);
      if (match) visible++;
    });
    const noResultsEl = document.getElementById("search-no-results");
    if (noResultsEl) noResultsEl.remove();
    if (searchResultsEl) {
      searchResultsEl.textContent = q ? (visible === 0 ? "No results — try different keywords" : visible + " of " + totalCards()) : "";
    }
  }

  const debouncedFilter = debounce((v) => filterCards(v), 80);
  searchEl.addEventListener("input", (e) => debouncedFilter(e.target.value));
  searchEl.addEventListener("search", (e) => filterCards(e.target.value));

  /* ========== Back to top ========== */
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    const onScroll = () => backToTop.classList.toggle("hidden", window.scrollY < 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    onScroll();
  }
})();
