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
  const toolsCount = document.getElementById("tools-count");
  const knowledgeCount = document.getElementById("knowledge-count");
  const podcastsCount = document.getElementById("podcasts-count");
  const youtubeCount = document.getElementById("youtube-count");
  const trainingCount = document.getElementById("training-count");
  const navTabs = document.querySelectorAll(".nav-tab");

  /* ========== Theme ========== */
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
        `<span class="${cls}" data-star="${i}">` +
          `<span class="star-half star-left" data-val="${i - 0.5}"></span>` +
          `<span class="star-half star-right" data-val="${i}"></span>` +
          (isHalf ? STAR_HALF_SVG : STAR_SVG) +
        `</span>`
      );
    }
    const label = saved ? saved.toFixed(1).replace(/\.0$/, "") : "";
    return (
      `<div class="card-rating" data-title="${escapeAttr(title)}" data-rating="${saved}">` +
        stars.join("") +
        `<span class="rating-value">${label}</span>` +
      `</div>`
    );
  }

  function initStarInteractions() {
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
          });
        });
      });

      container.addEventListener("mouseleave", clearPreview);
    });
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

    return `
      <a href="${escapeHtml(url)}"
         class="card"
         data-title="${escapeAttr(item.title)}"
         data-desc="${escapeAttr(item.description)}"
         data-tags="${escapeAttr((item.tags || []).join(" "))}"
         target="_blank" rel="noopener">
        <div class="card-cover" style="background:${grad}">
          ${freqBadge}
          ${levelBadge}
          <span class="card-cover-icon">${icon}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <p class="card-desc">${escapeHtml(item.description)}</p>
          ${buildStarsHTML(item.title)}
          ${tags ? `<div class="card-tags">${tags}</div>` : ""}
        </div>
      </a>`;
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
    const { tools, knowledge, podcasts, youtube, training } = siteData;

    toolsCount.textContent = tools.length;
    knowledgeCount.textContent = knowledge.length;
    podcastsCount.textContent = podcasts.length;
    youtubeCount.textContent = (youtube || []).length;
    trainingCount.textContent = (training || []).length;

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

    /* Featured row: pick highlights across categories */
    const featured = [
      tools[0],
      youtube ? youtube[0] : null,
      training ? training[0] : null,
      podcasts[0],
    ].filter(Boolean);

    featuredRow.innerHTML = featured.map((item) => buildFeaturedCard(item)).join("");

    initStarInteractions();
  }

  render();

  /* ========== Search / filter ========== */
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
