/**
 * My Stack — Renders only items the user has added to their stack
 */

(function () {
  const themeBtn = document.getElementById("theme-btn");
  const totalCountEl = document.getElementById("total-count");
  const searchToggle = document.getElementById("search-toggle");
  const searchBar = document.getElementById("search-bar");
  const searchEl = document.getElementById("search");
  const searchResultsEl = document.getElementById("search-results");
  const grids = {
    tools: document.getElementById("stack-tools-grid"),
    knowledge: document.getElementById("stack-knowledge-grid"),
    podcasts: document.getElementById("stack-podcasts-grid"),
    youtube: document.getElementById("stack-youtube-grid"),
    training: document.getElementById("stack-training-grid"),
    dailyWatch: document.getElementById("stack-daily-watch-grid"),
    bleedingEdge: document.getElementById("stack-bleeding-edge-grid"),
    niche: document.getElementById("stack-niche-grid"),
  };

  /* ========== Haptic feedback ========== */
  function haptic() {
    if (navigator.vibrate) navigator.vibrate(5);
  }

  /* ========== Stack helpers ========== */
  function getStack() {
    return window.ProfileStore ? window.ProfileStore.getStack() : [];
  }
  function removeFromStack(title) {
    const s = getStack().filter((t) => t !== title);
    if (window.ProfileStore) window.ProfileStore.setStack(s);
    else localStorage.setItem("myStack", JSON.stringify(s));
  }

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

  /* ========== Search (if present) ========== */
  if (searchToggle && searchBar && searchEl) {
    searchToggle.addEventListener("click", () => {
      searchBar.classList.toggle("open");
      if (searchBar.classList.contains("open")) {
        searchEl.focus();
      } else {
        searchEl.value = "";
        filterCards("");
        searchToggle.focus();
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
        searchToggle.focus();
      }
    });
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

  /* ========== Share helpers ========== */
  const SHARE_PAGE_MAP = { tools: "tools.html", knowledge: "knowledge.html", podcasts: "podcasts.html", youtube: "youtube.html", training: "training.html", "daily-watch": "daily-watch.html", "bleeding-edge": "bleeding-edge.html" };
  function getShareUrl(page, category, title) {
    const base = page === "niche" ? "niche.html" : (SHARE_PAGE_MAP[category] || "tools.html");
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
    btn.textContent = ok ? "Copied!" : prev;
    btn.setAttribute("aria-label", ok ? "Link copied to clipboard" : label);
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = prev;
      btn.setAttribute("aria-label", label);
      btn.disabled = false;
    }, 2000);
  }

  function findNicheCategory(title) {
    if (typeof nicheData === "undefined") return "taxes";
    const cats = ["taxes", "home", "travel", "books", "media", "entertainment", "sports", "health", "education", "finance", "legal", "pets", "food", "gardening", "realEstate", "career", "automotive", "writing", "marketing"];
    for (const cat of cats) {
      const items = nicheData[cat] || [];
      if (items.some((i) => i.title === title)) return cat;
    }
    return "taxes";
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

  /* ========== Build stack card ========== */
  function buildStackCard(item, sharePage, shareCategory) {
    const url = item.url || "#";
    const icon = item.icon || "&#x1F4A1;";
    const grad = gradientCSS(item.color);
    const tags = (item.tags || [])
      .slice(0, 3)
      .map((t) => `<span class="stack-card-tag">${escapeHtml(t)}</span>`)
      .join("");
    const badges = [];
    if (item.freq) {
      badges.push(`<span class="stack-card-badge">${escapeHtml(item.freq)}</span>`);
    }
    if (item.level) {
      badges.push(`<span class="stack-card-badge">Lv ${item.level}</span>`);
    }
    const metaContent = tags + badges.join("");
    const badgesHtml = metaContent ? `<div class="stack-card-meta">${metaContent}</div>` : "";
    const removeBtn = `<button type="button" class="stack-remove-btn" data-remove-title="${escapeAttr(item.title)}" aria-label="Remove from My Stack">✕</button>`;
    const shareBtn = sharePage && shareCategory
      ? `<button type="button" class="share-btn stack-share-btn" data-share-page="${escapeAttr(sharePage)}" data-share-category="${escapeAttr(shareCategory)}" data-share-title="${escapeAttr(item.title)}" data-share-desc="${escapeAttr(item.description || "")}" aria-label="Share ${escapeAttr(item.title)}">Share</button>`
      : "";
    const visitUrl = url && url !== "#" ? url : null;
    const visitBtn = visitUrl
      ? `<a href="${escapeHtml(visitUrl)}" class="visit-btn stack-visit-btn" target="_blank" rel="noopener" aria-label="Visit ${escapeAttr(item.title)}">Visit</a>`
      : "";

    return `
      <div class="stack-card"
         data-title="${escapeAttr(item.title)}"
         data-desc="${escapeAttr(item.description)}"
         data-tags="${escapeAttr((item.tags || []).join(" "))}">
        <div class="stack-card-actions">
          ${visitBtn}
          ${shareBtn}
          ${removeBtn}
        </div>
        <a href="${escapeHtml(url)}" class="stack-card-link" target="_blank" rel="noopener">
          <div class="stack-card-icon" style="background:${grad}">${icon}</div>
          <div class="stack-card-body">
            <h3 class="stack-card-title">${escapeHtml(item.title)}</h3>
            <p class="stack-card-desc">${escapeHtml(item.description)}</p>
            ${badgesHtml}
          </div>
        </a>
      </div>`;
  }

  /* ========== Custom tools ========== */
  function getCustomTools() {
    try {
      const j = localStorage.getItem("customTools");
      return j ? JSON.parse(j) : {};
    } catch (_) { return {}; }
  }

  /* ========== Render ========== */
  function getAllItems() {
    const custom = getCustomTools();
    const tools = [...(siteData.tools || []), ...(custom.tools || [])];
    const knowledge = [...(siteData.knowledge || []), ...(custom.knowledge || [])];
    const podcasts = [...(siteData.podcasts || []), ...(custom.podcasts || [])];
    const youtube = [...(siteData.youtube || []), ...(custom.youtube || [])];
    const training = [...(siteData.training || []), ...(custom.training || [])];
    const dailyWatch = [...(siteData.dailyWatch || []), ...(custom.dailyWatch || [])];
    const bleedingEdge = [...(siteData.bleedingEdge || []), ...(custom.bleedingEdge || [])];
    const stackSet = new Set(getStack());
    const nicheCategories = ["taxes", "home", "travel", "books", "media", "entertainment", "sports", "health", "education", "finance", "legal", "pets", "food", "gardening", "realEstate", "career", "automotive", "writing", "marketing"];
    const nicheItems = (typeof nicheData !== "undefined" ? nicheCategories.flatMap((cat) => nicheData[cat] || []) : []);
    const byCategory = {
      tools: tools.filter((t) => stackSet.has(t.title)),
      knowledge: knowledge.filter((k) => stackSet.has(k.title)),
      podcasts: (podcasts || []).filter((p) => stackSet.has(p.title)),
      youtube: (youtube || []).filter((y) => stackSet.has(y.title)),
      training: (training || []).filter((t) => stackSet.has(t.title)),
      dailyWatch: (dailyWatch || []).filter((d) => stackSet.has(d.title)),
      bleedingEdge: (bleedingEdge || []).filter((b) => stackSet.has(b.title)),
      niche: nicheItems.filter((n) => stackSet.has(n.title)),
    };
    return byCategory;
  }

  function render(highlightFilter) {
    const byCat = getAllItems();
    const total = byCat.tools.length + byCat.knowledge.length + byCat.podcasts.length + byCat.youtube.length + byCat.training.length + (byCat.dailyWatch?.length || 0) + (byCat.bleedingEdge?.length || 0) + (byCat.niche?.length || 0);

    totalCountEl.textContent = total;

    grids.tools.innerHTML = byCat.tools.map((t) => buildStackCard(t, "index", "tools")).join("");
    grids.knowledge.innerHTML = byCat.knowledge.map((k) => buildStackCard(k, "index", "knowledge")).join("");
    grids.podcasts.innerHTML = byCat.podcasts.map((p) => buildStackCard(p, "index", "podcasts")).join("");
    grids.youtube.innerHTML = byCat.youtube.map((y) => buildStackCard(y, "index", "youtube")).join("");
    grids.training.innerHTML = byCat.training.map((t) => buildStackCard(t, "index", "training")).join("");
    if (grids.dailyWatch) grids.dailyWatch.innerHTML = (byCat.dailyWatch || []).map((d) => buildStackCard(d, "index", "daily-watch")).join("");
    if (grids.bleedingEdge) grids.bleedingEdge.innerHTML = (byCat.bleedingEdge || []).map((b) => buildStackCard(b, "index", "bleeding-edge")).join("");
    if (grids.niche) grids.niche.innerHTML = (byCat.niche || []).map((n) => buildStackCard(n, "niche", findNicheCategory(n.title))).join("");

    const emptyMsg = document.getElementById("stack-empty-msg");
    if (emptyMsg) {
      emptyMsg.style.display = total === 0 ? "block" : "none";
    }

    initRemoveButtons();
    initShareButtons();
    if (searchEl) filterCards(searchEl.value);
  }

  function initRemoveButtons() {
    document.querySelectorAll(".stack-remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        haptic();
        const title = btn.dataset.removeTitle;
        removeFromStack(title);
        render();
      });
    });
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  function filterCards(query) {
    const q = (query || "").toLowerCase().trim();
    const cards = document.querySelectorAll(".stack-card");
    let visible = 0;
    cards.forEach((card) => {
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
      searchResultsEl.textContent = q
        ? visible === 0 && cards.length > 0 ? "No results — try different keywords" : visible + " of " + cards.length
        : "";
    }
  }

  const debouncedFilter = debounce((v) => filterCards(v), 80);
  if (searchEl) searchEl.addEventListener("input", (e) => debouncedFilter(e.target.value));
  if (searchEl) searchEl.addEventListener("search", (e) => filterCards(e.target.value));

  /* Mobile nav toggle */
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

  /* Back to top */
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    const onScroll = () => backToTop.classList.toggle("hidden", window.scrollY < 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    onScroll();
  }

  render();
  window.addEventListener("profile-changed", () => render());
})();
