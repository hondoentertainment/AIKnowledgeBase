/**
 * AI Knowledge Hub — App logic
 * Letterboxd-inspired poster cards, star ratings, expandable search, dark-first theme
 */

(function () {
  const searchToggle = document.getElementById("search-toggle");
  const searchBar = document.getElementById("search-bar");
  const searchEl = document.getElementById("search");
  const themeBtn = document.getElementById("theme-btn");
  const featuredRow = document.getElementById("featured-row");
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

  /* ========== Theme ========== */
  function getInitialTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  const savedTheme = getInitialTheme();
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeBtn.setAttribute("aria-pressed", savedTheme === "dark");

  themeBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    themeBtn.setAttribute("aria-pressed", next === "dark");
    localStorage.setItem("theme", next);
  });

  /* ========== Mobile nav toggle ========== */
  const navToggle = document.getElementById("nav-toggle");
  const navTabsEl = document.querySelector(".nav-tabs");
  if (navToggle && navTabsEl) {
    navToggle.addEventListener("click", () => {
      const open = navTabsEl.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open);
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
  const sections = document.querySelectorAll(".section");
  const observerOpts = { rootMargin: "-40% 0px -55% 0px" };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navTabs.forEach((tab) => tab.classList.remove("active"));
        const id = entry.target.id;
        const match = document.querySelector(`.nav-tab[data-section="${id}"]`);
        if (match) match.classList.add("active");
      }
    });
  }, observerOpts);

  sections.forEach((s) => sectionObserver.observe(s));

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

  /* ========== Star rating helpers ========== */
  const STAR_SVG = '<svg class="star-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>';
  const STAR_HALF_SVG = '<svg class="star-icon" viewBox="0 0 24 24"><defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="url(#halfGrad)" stroke="currentColor" stroke-width="0.5"/></svg>';

  function getRating(title) {
    const v = localStorage.getItem("rating:" + title);
    return v ? parseFloat(v) : 0;
  }

  function setRating(title, value) {
    if (value === 0) {
      localStorage.removeItem("rating:" + title);
    } else {
      localStorage.setItem("rating:" + title, String(value));
    }
  }

  function buildStarsHTML(title) {
    const saved = getRating(title);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = saved >= i;
      const isHalf = !isFull && saved >= i - 0.5;
      let cls = "star";
      if (isFull) cls += " filled";
      else if (isHalf) cls += " half-filled";

      stars.push(
        `<span class="${cls}" data-star="${i}" tabindex="0" role="button" aria-label="Rate ${i} of 5">` +
          `<span class="star-half star-left" data-val="${i - 0.5}"></span>` +
          `<span class="star-half star-right" data-val="${i}"></span>` +
          (isHalf ? STAR_HALF_SVG : STAR_SVG) +
        `</span>`
      );
    }
    const label = saved ? saved.toFixed(1).replace(/\.0$/, "") : "";
    return (
      `<div class="card-rating" data-title="${escapeAttr(title)}" data-rating="${saved}" role="group" aria-label="Rate ${escapeAttr(title)}">` +
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
              STAR_HALF_SVG;
          } else {
            el.innerHTML =
              `<span class="star-half star-left" data-val="${idx - 0.5}"></span>` +
              `<span class="star-half star-right" data-val="${idx}"></span>` +
              STAR_SVG;
          }
        });
        label.textContent = rating ? String(rating).replace(/\.0$/, "") : "";
        container.dataset.rating = rating;
      }

      function previewStars(hoverVal) {
        container.classList.add("hovering");
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
            const val = parseFloat(half.dataset.val);
            const current = getRating(title);
            const newVal = current === val ? 0 : val;
            setRating(title, newVal);
            clearPreview();
            updateDisplay(newVal);
            announce(newVal ? "Rated " + newVal + " of 5" : "Rating cleared");
          });
        });

        starEl.addEventListener("keydown", (e) => {
          if (!["ArrowLeft", "ArrowRight", "Enter", " "].includes(e.key)) return;
          e.preventDefault();
          const current = getRating(title);
          if (e.key === "ArrowRight") {
            const next = Math.min(5, current + 0.5);
            setRating(title, next);
            updateDisplay(next);
            announce("Rated " + next + " of 5");
          } else if (e.key === "ArrowLeft") {
            const next = Math.max(0, current - 0.5);
            setRating(title, next);
            updateDisplay(next);
            announce(next ? "Rated " + next + " of 5" : "Rating cleared");
          } else if (e.key === "Enter" || e.key === " ") {
            const idx = parseInt(starEl.dataset.star, 10);
            const val = current === idx ? 0 : idx;
            setRating(title, val);
            updateDisplay(val);
            announce(val ? "Rated " + val + " of 5" : "Rating cleared");
          }
        });
      });

      container.addEventListener("mouseleave", clearPreview);
    });
  }

  /* ========== Stack helpers ========== */
  function getStack() {
    try {
      const j = localStorage.getItem("myStack");
      return j ? JSON.parse(j) : [];
    } catch (_) { return []; }
  }
  function isInStack(title) { return getStack().includes(title); }
  function addToStack(title) {
    const s = getStack();
    if (!s.includes(title)) { s.push(title); localStorage.setItem("myStack", JSON.stringify(s)); }
  }
  function removeFromStack(title) {
    const s = getStack().filter((t) => t !== title);
    localStorage.setItem("myStack", JSON.stringify(s));
  }
  function toggleStack(title) {
    if (isInStack(title)) removeFromStack(title);
    else addToStack(title);
  }

  /* ========== Direct-use (I use this) helpers ========== */
  function getDirectUse() {
    try {
      const j = localStorage.getItem("directUse");
      return j ? JSON.parse(j) : [];
    } catch (_) { return []; }
  }
  function isDirectUse(title) { return getDirectUse().includes(title); }
  function addDirectUse(title) {
    const d = getDirectUse();
    if (!d.includes(title)) { d.push(title); localStorage.setItem("directUse", JSON.stringify(d)); }
  }
  function removeDirectUse(title) {
    const d = getDirectUse().filter((t) => t !== title);
    localStorage.setItem("directUse", JSON.stringify(d));
  }
  function toggleDirectUse(title) {
    if (isDirectUse(title)) removeDirectUse(title);
    else addDirectUse(title);
  }

  /* ========== Want to Try (flag) helpers ========== */
  function getWantToTry() {
    try {
      const j = localStorage.getItem("wantToTry");
      return j ? JSON.parse(j) : [];
    } catch (_) { return []; }
  }
  function isWantToTry(title) { return getWantToTry().includes(title); }
  function addWantToTry(title) {
    const w = getWantToTry();
    if (!w.includes(title)) { w.push(title); localStorage.setItem("wantToTry", JSON.stringify(w)); }
  }
  function removeWantToTry(title) {
    const w = getWantToTry().filter((t) => t !== title);
    localStorage.setItem("wantToTry", JSON.stringify(w));
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

  /* ========== Build poster card ========== */
  function buildCard(item) {
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
            ${wantToTryBtn}
            ${directUseBtn}
            ${stackBtn}
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

  /* ========== Render ========== */
  function render() {
    const { tools, knowledge, podcasts, youtube, training, dailyWatch, bleedingEdge } = siteData;

    toolsCount.textContent = tools.length;
    knowledgeCount.textContent = knowledge.length;
    podcastsCount.textContent = podcasts.length;
    youtubeCount.textContent = (youtube || []).length;
    trainingCount.textContent = (training || []).length;
    dailyWatchCount.textContent = (dailyWatch || []).length;
    bleedingEdgeCount.textContent = (bleedingEdge || []).length;

    const heroTools = document.getElementById("hero-tools-count");
    const heroKnowledge = document.getElementById("hero-knowledge-count");
    const heroPodcasts = document.getElementById("hero-podcasts-count");
    if (heroTools) heroTools.textContent = tools.length;
    if (heroKnowledge) heroKnowledge.textContent = knowledge.length;
    if (heroPodcasts) heroPodcasts.textContent = podcasts.length;

    toolsGrid.innerHTML = tools.length
      ? tools.map((t) => buildCard(t)).join("")
      : '<p class="section-empty">No tools added yet. Edit data.js to add your AI tools.</p>';

    knowledgeGrid.innerHTML = knowledge.length
      ? knowledge.map((k) => buildCard(k)).join("")
      : '<p class="section-empty">No knowledge items yet.</p>';

    podcastsGrid.innerHTML = podcasts.length
      ? podcasts.map((p) => buildCard(p)).join("")
      : '<p class="section-empty">No podcasts yet.</p>';

    youtubeGrid.innerHTML = (youtube || []).length
      ? youtube.map((y) => buildCard(y)).join("")
      : '<p class="section-empty">No YouTube channels yet. Edit data.js to add channels.</p>';

    trainingGrid.innerHTML = (training || []).length
      ? training.map((t) => buildCard(t)).join("")
      : '<p class="section-empty">No training links yet. Edit data.js to add courses and guides.</p>';

    dailyWatchGrid.innerHTML = (dailyWatch || []).length
      ? dailyWatch.map((d) => buildCard(d)).join("")
      : '<p class="section-empty">No daily watch sites yet.</p>';

    bleedingEdgeGrid.innerHTML = (bleedingEdge || []).length
      ? bleedingEdge.map((b) => buildCard(b)).join("")
      : '<p class="section-empty">No bleeding edge resources yet.</p>';

    /* Featured row: prioritize "Using" and high-rated items, then top picks per category */
    const directUse = getDirectUse();
    const allItems = [
      ...tools.map((t) => ({ ...t, cat: "tools" })),
      ...(youtube || []).map((y) => ({ ...y, cat: "youtube" })),
      ...(training || []).map((t) => ({ ...t, cat: "training" })),
      ...podcasts.map((p) => ({ ...p, cat: "podcasts" })),
      ...(bleedingEdge || []).map((b) => ({ ...b, cat: "bleedingEdge" })),
    ];
    const withScore = allItems.map((item) => {
      const using = directUse.includes(item.title) ? 2 : 0;
      const rating = getRating(item.title);
      return { item, score: using + (rating || 0) };
    });
    const byScore = [...withScore].sort((a, b) => b.score - a.score);
    const topByCat = {};
    byScore.forEach(({ item }) => {
      if (!topByCat[item.cat]) topByCat[item.cat] = item;
    });
    const featured = [
      topByCat.tools || tools[0],
      topByCat.bleedingEdge || (bleedingEdge ? bleedingEdge[0] : null),
      topByCat.youtube || (youtube ? youtube[0] : null),
      topByCat.training || (training ? training[0] : null),
      topByCat.podcasts || podcasts[0],
    ].filter(Boolean);

    featuredRow.innerHTML = featured.map((item) => buildFeaturedCard(item)).join("");

    initStarInteractions();
    initStackButtons();
    initDirectUseButtons();
    initWantToTryButtons();
  }

  function initDirectUseButtons() {
    document.querySelectorAll(".direct-use-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
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
        const title = btn.dataset.stackTitle;
        toggleStack(title);
        btn.classList.toggle("in-stack", isInStack(title));
        btn.textContent = isInStack(title) ? "✓ In Stack" : "+ Add to Stack";
        btn.setAttribute("aria-label", isInStack(title) ? "Remove from My Stack" : "Add to My Stack");
      });
    });
  }

  render();

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
    let noResultsEl = document.getElementById("search-no-results");
    if (q) {
      if (searchResultsEl) {
        searchResultsEl.textContent = visible + " of " + totalCards();
      }
      if (visible === 0 && !noResultsEl) {
        noResultsEl = document.createElement("p");
        noResultsEl.id = "search-no-results";
        noResultsEl.className = "search-no-results";
        noResultsEl.textContent = "No results for \"" + query + "\". Try different keywords.";
        const firstGrid = document.querySelector(".card-grid");
        if (firstGrid) firstGrid.appendChild(noResultsEl);
      } else if (visible > 0 && noResultsEl) {
        noResultsEl.remove();
      }
    } else {
      if (searchResultsEl) searchResultsEl.textContent = "";
      if (noResultsEl) noResultsEl.remove();
    }
  }

  const debouncedFilter = debounce((v) => filterCards(v), 80);
  searchEl.addEventListener("input", (e) => debouncedFilter(e.target.value));
  searchEl.addEventListener("search", (e) => filterCards(e.target.value));

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
