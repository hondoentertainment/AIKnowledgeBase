/**
 * AI Knowledge Hub — Advanced Filters
 * Multi-faceted filtering for category pages: tags, level, status
 */
(function () {
  function init() {
    const pageCategory = document.body.dataset.category;
    if (!pageCategory || !window.siteData) return;

    const section = document.querySelector(".section-header");
    if (!section) return;

    const items = window.siteData[pageCategory] || [];
    if (items.length === 0) return;

    // Collect all unique tags
    const allTags = new Set();
    items.forEach(item => (item.tags || []).forEach(t => allTags.add(t)));
    const sortedTags = Array.from(allTags).sort();

    // Create filter bar
    const filterBar = document.createElement("div");
    filterBar.className = "af-bar";
    filterBar.setAttribute("role", "toolbar");
    filterBar.setAttribute("aria-label", "Filters");

    filterBar.innerHTML = `
      <button type="button" class="af-toggle" aria-expanded="false" aria-controls="af-panel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filters
        <span class="af-count" style="display:none">0</span>
      </button>
      <div class="af-active-filters" id="af-active"></div>
      <button type="button" class="af-clear" style="display:none">Clear all</button>
      <button type="button" class="af-save-preset" title="Save current filters as a preset">💾 Save Preset</button>
      <div class="af-preset-dropdown-wrap" style="position:relative;display:inline-block">
        <button type="button" class="af-load-preset">📂 Load Preset ▾</button>
        <div class="af-preset-menu" style="display:none"></div>
      </div>
    `;

    const panel = document.createElement("div");
    panel.className = "af-panel";
    panel.id = "af-panel";
    panel.style.display = "none";

    panel.innerHTML = `
      <div class="af-section">
        <h4 class="af-section-title">Level</h4>
        <div class="af-chips" data-filter="level">
          <button type="button" class="af-chip" data-value="beginner">Beginner (1-2)</button>
          <button type="button" class="af-chip" data-value="intermediate">Intermediate (3-4)</button>
          <button type="button" class="af-chip" data-value="advanced">Advanced (5-6)</button>
          <button type="button" class="af-chip" data-value="expert">Expert (7-8)</button>
          <button type="button" class="af-chip" data-value="worldclass">World-Class (9-10)</button>
        </div>
      </div>
      <div class="af-section">
        <h4 class="af-section-title">Status</h4>
        <div class="af-chips" data-filter="status">
          <button type="button" class="af-chip" data-value="rated">Rated</button>
          <button type="button" class="af-chip" data-value="in-stack">In My Stack</button>
          <button type="button" class="af-chip" data-value="using">Using</button>
          <button type="button" class="af-chip" data-value="want-to-try">Want to Try</button>
          <button type="button" class="af-chip" data-value="unrated">Not Rated</button>
        </div>
      </div>
      <div class="af-section">
        <h4 class="af-section-title">Tags</h4>
        <div class="af-chips af-chips-scrollable" data-filter="tags">
          ${sortedTags.map(t => `<button type="button" class="af-chip" data-value="${t}">${t}</button>`).join("")}
        </div>
      </div>
    `;

    const presetChipsBar = document.createElement("div");
    presetChipsBar.className = "af-preset-chips";

    section.after(filterBar);
    filterBar.after(presetChipsBar);
    presetChipsBar.after(panel);

    // State
    const activeFilters = { level: [], status: [], tags: [] };

    const toggleBtn = filterBar.querySelector(".af-toggle");
    const clearBtn = filterBar.querySelector(".af-clear");
    const countBadge = filterBar.querySelector(".af-count");
    const activeEl = filterBar.querySelector("#af-active");

    toggleBtn.addEventListener("click", () => {
      const expanded = panel.style.display !== "none";
      panel.style.display = expanded ? "none" : "block";
      toggleBtn.setAttribute("aria-expanded", !expanded);
    });

    clearBtn.addEventListener("click", () => {
      activeFilters.level = [];
      activeFilters.status = [];
      activeFilters.tags = [];
      panel.querySelectorAll(".af-chip").forEach(c => c.classList.remove("active"));
      applyFilters();
    });

    // ── Filter Presets ──────────────────────────────────────
    const MAX_PRESETS = 10;
    const PRESET_KEY = "filterPresets";
    const savePresetBtn = filterBar.querySelector(".af-save-preset");
    const loadPresetBtn = filterBar.querySelector(".af-load-preset");
    const presetMenu = filterBar.querySelector(".af-preset-menu");

    function getPresets() {
      try { return JSON.parse(localStorage.getItem(PRESET_KEY) || "[]"); } catch (_) { return []; }
    }

    function savePresets(presets) {
      localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
    }

    function presetsForCategory() {
      return getPresets().filter(p => p.category === pageCategory);
    }

    function renderPresetChips() {
      const presets = presetsForCategory();
      presetChipsBar.innerHTML = presets.length === 0 ? "" : presets.map((p, i) =>
        `<span class="af-preset-chip" data-preset-idx="${i}">
          ${escapeHtml(p.name)}
          <button type="button" class="af-preset-chip-x" data-preset-name="${escapeHtml(p.name)}" aria-label="Delete preset ${escapeHtml(p.name)}">&times;</button>
        </span>`
      ).join("");

      presetChipsBar.querySelectorAll(".af-preset-chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
          if (e.target.classList.contains("af-preset-chip-x")) return;
          const name = chip.textContent.trim().replace(/\u00d7$/, "").trim();
          const preset = presetsForCategory().find(p => p.name === name);
          if (preset) loadPreset(preset);
        });
      });

      presetChipsBar.querySelectorAll(".af-preset-chip-x").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const name = btn.dataset.presetName;
          const allPresets = getPresets().filter(p => !(p.category === pageCategory && p.name === name));
          savePresets(allPresets);
          renderPresetChips();
          renderPresetMenu();
        });
      });
    }

    function renderPresetMenu() {
      const presets = presetsForCategory();
      if (presets.length === 0) {
        presetMenu.innerHTML = `<div class="af-preset-menu-empty">No saved presets</div>`;
      } else {
        presetMenu.innerHTML = presets.map(p =>
          `<button type="button" class="af-preset-menu-item" data-preset-name="${escapeHtml(p.name)}">${escapeHtml(p.name)}</button>`
        ).join("");
        presetMenu.querySelectorAll(".af-preset-menu-item").forEach(item => {
          item.addEventListener("click", () => {
            const preset = presetsForCategory().find(p => p.name === item.dataset.presetName);
            if (preset) loadPreset(preset);
            presetMenu.style.display = "none";
          });
        });
      }
    }

    function loadPreset(preset) {
      activeFilters.level = [...(preset.filters.level || [])];
      activeFilters.status = [...(preset.filters.status || [])];
      activeFilters.tags = [...(preset.filters.tags || [])];
      // Sync chip UI
      panel.querySelectorAll(".af-chip").forEach(c => {
        const group = c.closest("[data-filter]").dataset.filter;
        const val = c.dataset.value;
        c.classList.toggle("active", activeFilters[group].includes(val));
      });
      applyFilters();
    }

    function escapeHtml(s) {
      const d = document.createElement("div");
      d.textContent = s;
      return d.innerHTML;
    }

    savePresetBtn.addEventListener("click", () => {
      const totalActive = activeFilters.level.length + activeFilters.status.length + activeFilters.tags.length;
      if (totalActive === 0) {
        alert("Select at least one filter before saving a preset.");
        return;
      }
      const name = prompt("Preset name:");
      if (!name || !name.trim()) return;
      const allPresets = getPresets();
      const categoryPresets = allPresets.filter(p => p.category === pageCategory);
      // Replace if same name exists
      const existingIdx = allPresets.findIndex(p => p.category === pageCategory && p.name === name.trim());
      if (existingIdx >= 0) {
        allPresets[existingIdx].filters = { level: [...activeFilters.level], status: [...activeFilters.status], tags: [...activeFilters.tags] };
      } else {
        if (categoryPresets.length >= MAX_PRESETS) {
          alert("Maximum " + MAX_PRESETS + " presets reached. Delete one first.");
          return;
        }
        allPresets.push({
          name: name.trim(),
          category: pageCategory,
          filters: { level: [...activeFilters.level], status: [...activeFilters.status], tags: [...activeFilters.tags] }
        });
      }
      savePresets(allPresets);
      renderPresetChips();
      renderPresetMenu();
    });

    loadPresetBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const visible = presetMenu.style.display !== "none";
      presetMenu.style.display = visible ? "none" : "block";
      if (!visible) renderPresetMenu();
    });

    // Close preset menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".af-preset-dropdown-wrap")) {
        presetMenu.style.display = "none";
      }
    });

    renderPresetChips();

    panel.addEventListener("click", (e) => {
      const chip = e.target.closest(".af-chip");
      if (!chip) return;
      const group = chip.closest("[data-filter]").dataset.filter;
      const val = chip.dataset.value;
      chip.classList.toggle("active");
      if (activeFilters[group].includes(val)) {
        activeFilters[group] = activeFilters[group].filter(v => v !== val);
      } else {
        activeFilters[group].push(val);
      }
      applyFilters();
    });

    function getLevelRange(val) {
      const ranges = { beginner: [1, 2], intermediate: [3, 4], advanced: [5, 6], expert: [7, 8], worldclass: [9, 10] };
      return ranges[val] || [0, 10];
    }

    function applyFilters() {
      const totalActive = activeFilters.level.length + activeFilters.status.length + activeFilters.tags.length;
      countBadge.style.display = totalActive > 0 ? "inline-flex" : "none";
      countBadge.textContent = totalActive;
      clearBtn.style.display = totalActive > 0 ? "inline-flex" : "none";

      // Show active filter pills
      activeEl.innerHTML = [...activeFilters.level, ...activeFilters.status, ...activeFilters.tags].map(v =>
        `<span class="af-pill">${v}<button type="button" class="af-pill-x" data-remove="${v}" aria-label="Remove ${v} filter">&times;</button></span>`
      ).join("");

      activeEl.querySelectorAll(".af-pill-x").forEach(btn => {
        btn.addEventListener("click", () => {
          const val = btn.dataset.remove;
          ["level", "status", "tags"].forEach(g => {
            activeFilters[g] = activeFilters[g].filter(v => v !== val);
          });
          panel.querySelectorAll(`.af-chip[data-value="${val}"]`).forEach(c => c.classList.remove("active"));
          applyFilters();
        });
      });

      // Filter cards
      const grid = document.querySelector(".card-grid");
      if (!grid) return;
      const cards = grid.querySelectorAll(".card");

      const getRating = (title) => {
        if (window.ProfileStore && window.ProfileStore.getRating) return window.ProfileStore.getRating(title);
        const v = localStorage.getItem("rating:" + title);
        return v ? parseFloat(v) : 0;
      };
      const getStack = () => {
        if (window.ProfileStore) return window.ProfileStore.getStack() || [];
        try { return JSON.parse(localStorage.getItem("myStack") || "[]"); } catch (_) { return []; }
      };
      const getDirectUse = () => {
        if (window.ProfileStore) return window.ProfileStore.getDirectUse() || [];
        try { return JSON.parse(localStorage.getItem("directUse") || "[]"); } catch (_) { return []; }
      };
      const getWantToTry = () => {
        if (window.ProfileStore) return window.ProfileStore.getWantToTry() || [];
        try { return JSON.parse(localStorage.getItem("wantToTry") || "[]"); } catch (_) { return []; }
      };

      const stack = getStack();
      const directUse = getDirectUse();
      const wantToTry = getWantToTry();

      cards.forEach(card => {
        const title = card.dataset.title || "";
        const item = items.find(it => it.title === title);
        if (!item) { card.style.display = ""; return; }

        let show = true;

        // Level filter
        if (activeFilters.level.length > 0) {
          const lvl = item.level || 0;
          const matches = activeFilters.level.some(v => {
            const [min, max] = getLevelRange(v);
            return lvl >= min && lvl <= max;
          });
          if (!matches) show = false;
        }

        // Status filter
        if (show && activeFilters.status.length > 0) {
          const rating = getRating(title);
          const matches = activeFilters.status.some(v => {
            if (v === "rated") return rating > 0;
            if (v === "unrated") return rating === 0;
            if (v === "in-stack") return stack.includes(title);
            if (v === "using") return directUse.includes(title);
            if (v === "want-to-try") return wantToTry.includes(title);
            return true;
          });
          if (!matches) show = false;
        }

        // Tags filter
        if (show && activeFilters.tags.length > 0) {
          const itemTags = (item.tags || []).map(t => t);
          const matches = activeFilters.tags.some(v => itemTags.includes(v));
          if (!matches) show = false;
        }

        card.style.display = show ? "" : "none";
      });

      // Update count
      const visibleCount = grid.querySelectorAll(".card:not([style*='display: none'])").length;
      const countEl = document.querySelector(".section-count");
      if (countEl) {
        countEl.textContent = totalActive > 0 ? `(${visibleCount} of ${cards.length})` : `(${cards.length})`;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 500));
  } else {
    setTimeout(init, 500);
  }
})();
