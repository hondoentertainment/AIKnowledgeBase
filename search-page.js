/**
 * Search results page: cross-category search with fuzzy/multi-term matching
 */

(function () {
  const CATEGORY_CONFIG = [
    { id: "tools", label: "Tools", page: "tools.html" },
    { id: "knowledge", label: "Knowledge", page: "knowledge.html" },
    { id: "podcasts", label: "Podcasts", page: "podcasts.html" },
    { id: "youtube", label: "YouTube", page: "youtube.html" },
    { id: "training", label: "Training", page: "training.html" },
    { id: "daily-watch", label: "Daily Watch", page: "daily-watch.html" },
    { id: "bleeding-edge", label: "Bleeding Edge", page: "bleeding-edge.html" },
    { id: "niche", label: "Niche AI", page: "niche.html" },
  ];

  const DATA_KEY_MAP = {
    tools: "tools",
    knowledge: "knowledge",
    podcasts: "podcasts",
    youtube: "youtube",
    training: "training",
    "daily-watch": "dailyWatch",
    "bleeding-edge": "bleedingEdge",
    niche: "niche",
  };

  function getCustomTools() {
    try {
      const j = localStorage.getItem("customTools");
      return j ? JSON.parse(j) : {};
    } catch (_) {
      return {};
    }
  }

  function getAllItems() {
    const custom = getCustomTools();
    const data = typeof siteData === "object" && siteData ? siteData : {};
    const niche = typeof nicheData === "object" && nicheData ? nicheData : {};
    const items = [];
    CATEGORY_CONFIG.forEach((cfg) => {
      const key = DATA_KEY_MAP[cfg.id] || cfg.id;
      let baseItems = [];
      if (cfg.id === "niche") {
        Object.keys(niche).filter((k) => Array.isArray(niche[k])).forEach((cat) => {
          (niche[cat] || []).forEach((item) =>
            items.push({ ...item, category: "niche", categoryLabel: "Niche AI", categoryPage: "niche.html", nicheSection: cat })
          );
        });
        return;
      }
      baseItems = data[key] || [];
      const customItems = custom[key] || [];
      const all = [...baseItems, ...customItems];
      all.forEach((item) => items.push({ ...item, category: cfg.id, categoryLabel: cfg.label, categoryPage: cfg.page }));
    });
    return items;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML.replace(/"/g, "&quot;");
  }

  function buildResultCard(item) {
    const cat = item.category || "tools";
    return window.CardBuilder.buildCard(item, cat);
  }

  function renderResults(query) {
    const container = document.getElementById("search-results-container");
    const emptyEl = document.getElementById("search-empty");
    const groupedEl = document.getElementById("search-grouped");
    if (!container || !groupedEl) return;

    const q = (query || "").trim();
    const items = getAllItems();

    if (!q) {
      groupedEl.innerHTML = "";
      if (emptyEl) emptyEl.textContent = "Enter a search term above.";
      return;
    }

    const matched = items.filter((item) => window.SearchUtils && window.SearchUtils.matchItem(q, item));

    if (matched.length === 0) {
      groupedEl.innerHTML = "";
      if (emptyEl) emptyEl.textContent = `No results for "${escapeHtml(q)}". Try different keywords like "chat gpt" or "coding".`;
      return;
    }

    const byCategory = {};
    matched.forEach((item) => {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    });

    const cfg = CATEGORY_CONFIG.filter((c) => byCategory[c.id]);
    let html = "";
    cfg.forEach((c) => {
      const list = byCategory[c.id];
      html += `<section class="search-results-section" aria-label="${escapeHtml(c.label)} results">
        <h3 class="search-results-section-title">${escapeHtml(c.label)} <span class="search-results-section-count">(${list.length})</span></h3>
        <div class="card-grid">${list.map((item) => buildResultCard(item)).join("")}</div>
      </section>`;
    });
    groupedEl.innerHTML = html;
    if (emptyEl) emptyEl.textContent = "";
    if (window.CardBuilder && typeof window.CardBuilder.initInteractions === "function") {
      window.CardBuilder.initInteractions(groupedEl);
    }
  }

  function init() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const searchEl = document.getElementById("search");
    const searchResultsEl = document.getElementById("search-results");
    const searchBar = document.getElementById("search-bar");
    const liveRegion = document.getElementById("search-results");
    const groupedEl = document.getElementById("search-grouped");
    const emptyEl = document.getElementById("search-empty");

    if (searchEl) {
      searchEl.value = q;
      searchEl.setAttribute("aria-label", "Search tools, knowledge, podcasts, and more");
    }

    function runSearch() {
      const val = searchEl ? searchEl.value.trim() : q;
      renderResults(val);
      const url = new URL(window.location.href);
      if (val) {
        url.searchParams.set("q", val);
      } else {
        url.searchParams.delete("q");
      }
      history.replaceState({}, "", url.toString());
      const count = document.querySelectorAll("#search-grouped .card").length;
      if (searchResultsEl) searchResultsEl.textContent = count ? `${count} results` : "";
      if (liveRegion) liveRegion.setAttribute("aria-live", "polite");
      window.Analytics?.track?.("search_performed", {
        queryLength: val.length,
        hasQuery: !!val,
        resultCount: count,
      });
    }

    if (q && groupedEl) {
      groupedEl.innerHTML = '<div class="search-results-loading" aria-busy="true" aria-label="Searching"><div class="card-grid">' +
        '<div class="card-skeleton"></div><div class="card-skeleton"></div><div class="card-skeleton"></div>' +
        '<div class="card-skeleton"></div><div class="card-skeleton"></div><div class="card-skeleton"></div>' +
        '</div></div>';
      if (emptyEl) emptyEl.textContent = "";
    }

    runSearch();

    if (searchEl) {
      let debounceTimer;
      searchEl.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        const val = searchEl.value.trim();
        if (val && groupedEl) {
          groupedEl.innerHTML = '<div class="search-results-loading" aria-busy="true" aria-label="Searching"><div class="card-grid">' +
            '<div class="card-skeleton"></div><div class="card-skeleton"></div><div class="card-skeleton"></div>' +
            '<div class="card-skeleton"></div><div class="card-skeleton"></div><div class="card-skeleton"></div>' +
            '</div></div>';
          if (emptyEl) emptyEl.textContent = "";
        }
        debounceTimer = setTimeout(runSearch, 80);
        updateSuggestions();
      });
      searchEl.addEventListener("search", runSearch);
      searchEl.addEventListener("focus", updateSuggestions);
      searchEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const val = searchEl.value.trim();
          if (val && window.SearchUtils) window.SearchUtils.addRecentSearch(val);
          if (val) window.Analytics?.track?.("search_enter_pressed", { queryLength: val.length });
        }
        if (suggestionsEl && !suggestionsEl.hidden) {
          const options = suggestionsEl.querySelectorAll(".search-suggestion");
          if (options.length === 0) return;
          const current = document.activeElement;
          let idx = Array.prototype.indexOf.call(options, current);
          if (idx < 0) idx = -1;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = idx < options.length - 1 ? idx + 1 : 0;
            options[next].focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = idx <= 0 ? options.length - 1 : idx - 1;
            options[prev].focus();
          } else if (e.key === "Enter" && idx >= 0) {
            e.preventDefault();
            window.location.href = "search.html?q=" + encodeURIComponent((options[idx].dataset.query || options[idx].getAttribute("data-query") || "").trim());
          }
        }
      });
    }

    let suggestionsEl = null;
    function ensureSuggestions() {
      if (suggestionsEl) return;
      const inner = searchBar && searchBar.querySelector(".search-bar-inner");
      if (!inner) return;
      suggestionsEl = document.createElement("div");
      suggestionsEl.id = "search-suggestions";
      suggestionsEl.className = "search-suggestions";
      suggestionsEl.setAttribute("role", "listbox");
      suggestionsEl.setAttribute("aria-label", "Recent and popular searches");
      suggestionsEl.hidden = true;
      inner.appendChild(suggestionsEl);
    }
    function updateSuggestions() {
      const val = (searchEl && searchEl.value || "").trim();
      if (val.length > 0) {
        if (suggestionsEl) suggestionsEl.hidden = true;
        return;
      }
      ensureSuggestions();
      const recent = (window.SearchUtils && window.SearchUtils.getRecentSearches && window.SearchUtils.getRecentSearches()) || [];
      const popular = (window.SearchUtils && window.SearchUtils.getPopularQueries && window.SearchUtils.getPopularQueries()) || [];
      if (recent.length === 0 && (!popular || popular.length === 0)) {
        if (suggestionsEl) suggestionsEl.hidden = true;
        return;
      }
      let html = "";
      if (recent.length > 0) {
        html += '<div class="search-suggestions-section"><span class="search-suggestions-label">Recent</span>';
        recent.slice(0, 5).forEach((q) => {
          html += `<a href="search.html?q=${encodeURIComponent(q)}" class="search-suggestion" role="option" data-query="${escapeAttr(q)}">${escapeHtml(q)}</a>`;
        });
        html += "</div>";
      }
      if (popular && popular.length > 0) {
        html += '<div class="search-suggestions-section"><span class="search-suggestions-label">Popular</span>';
        popular.slice(0, 5).forEach((q) => {
          html += `<a href="search.html?q=${encodeURIComponent(q)}" class="search-suggestion" role="option" data-query="${escapeAttr(q)}">${escapeHtml(q)}</a>`;
        });
        html += "</div>";
      }
      suggestionsEl.innerHTML = html;
      suggestionsEl.hidden = false;
    }
    if (searchBar) {
      searchBar.addEventListener("focusout", (e) => {
        if (!searchBar.contains(e.relatedTarget) && suggestionsEl) {
          setTimeout(() => { if (suggestionsEl) suggestionsEl.hidden = true; }, 150);
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
