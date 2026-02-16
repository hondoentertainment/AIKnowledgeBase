/**
 * AI Knowledge Hub — App logic
 * Letterboxd-inspired poster cards, expandable search, dark-first theme
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
  const toolsCount = document.getElementById("tools-count");
  const knowledgeCount = document.getElementById("knowledge-count");
  const podcastsCount = document.getElementById("podcasts-count");
  const navTabs = document.querySelectorAll(".nav-tab");

  /* ---------- Theme ---------- */
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeBtn.setAttribute("aria-pressed", savedTheme === "dark");

  themeBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    themeBtn.setAttribute("aria-pressed", next === "dark");
    localStorage.setItem("theme", next);
  });

  /* ---------- Search toggle ---------- */
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

  /* ---------- Active nav tab on scroll ---------- */
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

  /* ---------- Helpers ---------- */
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

  /* ---------- Build poster card ---------- */
  function buildCard(item) {
    const url = item.url || "#";
    const icon = item.icon || "";
    const grad = gradientCSS(item.color);
    const tags = (item.tags || [])
      .map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`)
      .join("");

    return `
      <a href="${escapeHtml(url)}"
         class="card"
         data-title="${escapeAttr(item.title)}"
         data-desc="${escapeAttr(item.description)}"
         data-tags="${escapeAttr((item.tags || []).join(" "))}"
         target="_blank" rel="noopener">
        <div class="card-cover" style="background:${grad}">
          <span class="card-cover-icon">${icon}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <p class="card-desc">${escapeHtml(item.description)}</p>
          ${tags ? `<div class="card-tags">${tags}</div>` : ""}
        </div>
      </a>`;
  }

  /* ---------- Build featured card ---------- */
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

  /* ---------- Render ---------- */
  function render() {
    const { tools, knowledge, podcasts } = siteData;

    toolsCount.textContent = tools.length;
    knowledgeCount.textContent = knowledge.length;
    podcastsCount.textContent = podcasts.length;

    toolsGrid.innerHTML = tools.length
      ? tools.map((t) => buildCard(t)).join("")
      : '<p class="section-empty">No tools added yet. Edit data.js to add your AI tools.</p>';

    knowledgeGrid.innerHTML = knowledge.length
      ? knowledge.map((k) => buildCard(k)).join("")
      : '<p class="section-empty">No knowledge items yet.</p>';

    podcastsGrid.innerHTML = podcasts.length
      ? podcasts.map((p) => buildCard(p)).join("")
      : '<p class="section-empty">No podcasts yet.</p>';

    /* Featured row: pick first item from each category */
    const featured = [
      tools[0],
      knowledge[0],
      podcasts[0],
      tools[1],
    ].filter(Boolean);

    featuredRow.innerHTML = featured
      .map((item) => buildFeaturedCard(item))
      .join("");
  }

  render();

  /* ---------- Search / filter ---------- */
  function filterCards(query) {
    const q = (query || "").toLowerCase().trim();
    document.querySelectorAll(".card").forEach((card) => {
      const title = (card.dataset.title || "").toLowerCase();
      const desc = (card.dataset.desc || "").toLowerCase();
      const tags = (card.dataset.tags || "").toLowerCase();
      const match = !q || title.includes(q) || desc.includes(q) || tags.includes(q);
      card.classList.toggle("hidden", !match);
    });
  }

  searchEl.addEventListener("input", (e) => filterCards(e.target.value));
  searchEl.addEventListener("search", (e) => filterCards(e.target.value));
})();
