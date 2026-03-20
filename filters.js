/**
 * AI Knowledge Hub — Reusable Filter Module
 * Provides level, status, and tag filtering for category pages.
 * Persists active filters in sessionStorage and fires 'filters-changed' events.
 */
(function () {
  "use strict";

  var _category = "";
  var _containerId = "";
  var _allItems = [];
  var _collapsed = true; // collapsed on mobile by default

  var STORAGE_KEY_PREFIX = "filters:";

  /* ========== Helpers ========== */
  function storageKey() {
    return STORAGE_KEY_PREFIX + _category;
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(storageKey());
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return { level: "all", status: "all", tags: [] };
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(storageKey(), JSON.stringify(state));
    } catch (_) { /* ignore */ }
  }

  function fireChanged() {
    document.dispatchEvent(new CustomEvent("filters-changed", { detail: { category: _category } }));
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /* ========== Resolve data key from category id ========== */
  function dataKeyFor(cat) {
    var map = {
      tools: "tools",
      knowledge: "knowledge",
      podcasts: "podcasts",
      youtube: "youtube",
      training: "training",
      "daily-watch": "dailyWatch",
      "bleeding-edge": "bleedingEdge"
    };
    return map[cat] || cat;
  }

  /* ========== Extract items from siteData + custom ========== */
  function resolveItems() {
    if (typeof siteData === "undefined") return [];
    var key = dataKeyFor(_category);
    var base = siteData[key] || [];
    var custom = [];
    try {
      var c = localStorage.getItem("customTools");
      if (c) {
        var parsed = JSON.parse(c);
        custom = parsed[key] || [];
      }
    } catch (_) { /* ignore */ }
    return [].concat(base, custom);
  }

  /* ========== Extract top tags from items ========== */
  function extractTopTags(items, max) {
    var counts = {};
    items.forEach(function (item) {
      (item.tags || []).forEach(function (tag) {
        var t = String(tag).trim();
        if (!t) return;
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    var sorted = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a];
    });
    return sorted.slice(0, max || 15);
  }

  /* ========== Level label helpers (mirrors app.js) ========== */
  function itemLevelLabel(lvl) {
    if (lvl <= 2) return "Beginner";
    if (lvl <= 4) return "Intermediate";
    if (lvl <= 6) return "Advanced";
    return "Advanced"; // treat expert/world-class as advanced for filter purposes
  }

  /* ========== Status helpers ========== */
  function getStack() {
    return window.ProfileStore ? window.ProfileStore.getStack() : (function () {
      try { return JSON.parse(localStorage.getItem("myStack") || "[]"); } catch (_) { return []; }
    })();
  }

  function getDirectUse() {
    return window.ProfileStore ? window.ProfileStore.getDirectUse() : (function () {
      try { return JSON.parse(localStorage.getItem("directUse") || "[]"); } catch (_) { return []; }
    })();
  }

  function getWantToTry() {
    return window.ProfileStore ? window.ProfileStore.getWantToTry() : (function () {
      try { return JSON.parse(localStorage.getItem("wantToTry") || "[]"); } catch (_) { return []; }
    })();
  }

  function getRating(title) {
    if (window.ProfileStore) return window.ProfileStore.getRating(title);
    var v = localStorage.getItem("rating:" + title);
    return v ? parseFloat(v) : 0;
  }

  /* ========== Check if any filter is active ========== */
  function hasActiveFilters(state) {
    if (state.level !== "all") return true;
    if (state.status !== "all") return true;
    if (state.tags && state.tags.length > 0) return true;
    return false;
  }

  /* ========== Apply filters to items array ========== */
  function applyFilters(items, state) {
    if (!state) state = loadState();
    var stack = null;
    var directUse = null;
    var wantToTry = null;

    return items.filter(function (item) {
      // Level filter
      if (state.level !== "all") {
        var lvl = item.level || 0;
        var label = itemLevelLabel(lvl);
        if (label.toLowerCase() !== state.level.toLowerCase()) return false;
      }

      // Status filter
      if (state.status !== "all") {
        if (stack === null) { stack = getStack(); directUse = getDirectUse(); wantToTry = getWantToTry(); }
        var title = item.title || "";
        var s = state.status;
        if (s === "in-stack" && !stack.includes(title)) return false;
        if (s === "want-to-try" && !wantToTry.includes(title)) return false;
        if (s === "i-use-this" && !directUse.includes(title)) return false;
        if (s === "unrated" && getRating(title) > 0) return false;
      }

      // Tag filter (AND logic: item must have ALL selected tags)
      if (state.tags && state.tags.length > 0) {
        var itemTags = (item.tags || []).map(function (t) { return String(t).toLowerCase(); });
        for (var i = 0; i < state.tags.length; i++) {
          if (itemTags.indexOf(state.tags[i].toLowerCase()) === -1) return false;
        }
      }

      return true;
    });
  }

  /* ========== Update active filter indicator ========== */
  function updateIndicator() {
    var toggle = document.getElementById("filter-toggle-btn");
    if (!toggle) return;
    var state = loadState();
    var active = hasActiveFilters(state);
    toggle.classList.toggle("filter-active", active);
  }

  /* ========== Update result count ========== */
  function updateResultCount() {
    var el = document.getElementById("filter-result-count");
    if (!el) return;
    var items = resolveItems();
    var state = loadState();
    var filtered = applyFilters(items, state);
    if (hasActiveFilters(state)) {
      el.textContent = "Showing " + filtered.length + " of " + items.length + " items";
      el.style.display = "";
    } else {
      el.textContent = "";
      el.style.display = "none";
    }
  }

  /* ========== Render the filter bar ========== */
  function renderFilterBar() {
    var container = document.getElementById(_containerId);
    if (!container) return;

    var items = resolveItems();
    _allItems = items;
    var topTags = extractTopTags(items, 15);
    var state = loadState();
    var active = hasActiveFilters(state);

    var html = [];

    // Toggle button (visible on mobile)
    html.push('<button type="button" id="filter-toggle-btn" class="filter-toggle-btn' + (active ? ' filter-active' : '') + '" aria-expanded="' + (!_collapsed) + '" aria-controls="filter-bar-content">');
    html.push('<svg class="filter-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd"/></svg>');
    html.push(' Filters');
    if (active) html.push('<span class="filter-indicator" aria-label="Filters active"></span>');
    html.push('</button>');

    // Filter content
    html.push('<div id="filter-bar-content" class="filter-bar-content' + (_collapsed ? ' filter-collapsed' : '') + '">');

    // Level dropdown
    html.push('<div class="filter-group">');
    html.push('<label for="filter-level" class="filter-label">Level</label>');
    html.push('<select id="filter-level" class="filter-select">');
    html.push('<option value="all"' + (state.level === 'all' ? ' selected' : '') + '>All Levels</option>');
    html.push('<option value="beginner"' + (state.level === 'beginner' ? ' selected' : '') + '>Beginner</option>');
    html.push('<option value="intermediate"' + (state.level === 'intermediate' ? ' selected' : '') + '>Intermediate</option>');
    html.push('<option value="advanced"' + (state.level === 'advanced' ? ' selected' : '') + '>Advanced</option>');
    html.push('</select>');
    html.push('</div>');

    // Status dropdown
    html.push('<div class="filter-group">');
    html.push('<label for="filter-status" class="filter-label">Status</label>');
    html.push('<select id="filter-status" class="filter-select">');
    html.push('<option value="all"' + (state.status === 'all' ? ' selected' : '') + '>All Status</option>');
    html.push('<option value="in-stack"' + (state.status === 'in-stack' ? ' selected' : '') + '>In My Stack</option>');
    html.push('<option value="want-to-try"' + (state.status === 'want-to-try' ? ' selected' : '') + '>Want to Try</option>');
    html.push('<option value="i-use-this"' + (state.status === 'i-use-this' ? ' selected' : '') + '>I Use This</option>');
    html.push('<option value="unrated"' + (state.status === 'unrated' ? ' selected' : '') + '>Unrated</option>');
    html.push('</select>');
    html.push('</div>');

    // Tag pills
    if (topTags.length > 0) {
      html.push('<div class="filter-group filter-group-tags">');
      html.push('<span class="filter-label">Tags</span>');
      html.push('<div class="filter-tags">');
      topTags.forEach(function (tag) {
        var selected = state.tags && state.tags.indexOf(tag) !== -1;
        html.push('<button type="button" class="filter-tag' + (selected ? ' filter-tag-selected' : '') + '" data-tag="' + escapeHtml(tag) + '" aria-pressed="' + selected + '">' + escapeHtml(tag) + '</button>');
      });
      html.push('</div>');
      html.push('</div>');
    }

    // Clear all button
    html.push('<button type="button" id="filter-clear-all" class="filter-clear-btn"' + (active ? '' : ' style="display:none"') + '>Clear all</button>');

    html.push('</div>'); // end filter-bar-content

    // Result count
    html.push('<div id="filter-result-count" class="filter-result-count" aria-live="polite" style="display:none"></div>');

    container.innerHTML = html.join('');
    container.className = 'filter-bar';

    // Wire up events
    wireEvents();
    updateResultCount();
  }

  /* ========== Wire up events ========== */
  function wireEvents() {
    // Toggle button
    var toggleBtn = document.getElementById("filter-toggle-btn");
    var content = document.getElementById("filter-bar-content");
    if (toggleBtn && content) {
      toggleBtn.addEventListener("click", function () {
        _collapsed = !_collapsed;
        content.classList.toggle("filter-collapsed", _collapsed);
        toggleBtn.setAttribute("aria-expanded", String(!_collapsed));
      });
    }

    // Level select
    var levelEl = document.getElementById("filter-level");
    if (levelEl) {
      levelEl.addEventListener("change", function () {
        var state = loadState();
        state.level = levelEl.value;
        saveState(state);
        updateIndicator();
        updateResultCount();
        updateClearBtn();
        fireChanged();
      });
    }

    // Status select
    var statusEl = document.getElementById("filter-status");
    if (statusEl) {
      statusEl.addEventListener("change", function () {
        var state = loadState();
        state.status = statusEl.value;
        saveState(state);
        updateIndicator();
        updateResultCount();
        updateClearBtn();
        fireChanged();
      });
    }

    // Tag pills
    document.querySelectorAll("#" + _containerId + " .filter-tag").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tag = btn.dataset.tag;
        var state = loadState();
        if (!state.tags) state.tags = [];
        var idx = state.tags.indexOf(tag);
        if (idx !== -1) {
          state.tags.splice(idx, 1);
          btn.classList.remove("filter-tag-selected");
          btn.setAttribute("aria-pressed", "false");
        } else {
          state.tags.push(tag);
          btn.classList.add("filter-tag-selected");
          btn.setAttribute("aria-pressed", "true");
        }
        saveState(state);
        updateIndicator();
        updateResultCount();
        updateClearBtn();
        fireChanged();
      });
    });

    // Clear all
    var clearBtn = document.getElementById("filter-clear-all");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        clearAll();
      });
    }
  }

  function updateClearBtn() {
    var clearBtn = document.getElementById("filter-clear-all");
    if (!clearBtn) return;
    var state = loadState();
    clearBtn.style.display = hasActiveFilters(state) ? "" : "none";
  }

  /* ========== Public API ========== */
  function init(containerId, category) {
    _containerId = containerId;
    _category = category;
    _collapsed = true;
    renderFilterBar();
  }

  function getActiveFilters() {
    return loadState();
  }

  function clearAll() {
    var state = { level: "all", status: "all", tags: [] };
    saveState(state);

    // Reset UI
    var levelEl = document.getElementById("filter-level");
    if (levelEl) levelEl.value = "all";
    var statusEl = document.getElementById("filter-status");
    if (statusEl) statusEl.value = "all";
    document.querySelectorAll("#" + _containerId + " .filter-tag").forEach(function (btn) {
      btn.classList.remove("filter-tag-selected");
      btn.setAttribute("aria-pressed", "false");
    });

    updateIndicator();
    updateResultCount();
    updateClearBtn();
    fireChanged();
  }

  // Expose public API
  window.Filters = {
    init: init,
    getActiveFilters: getActiveFilters,
    clearAll: clearAll,
    applyFilters: applyFilters  // used by app.js
  };
})();
