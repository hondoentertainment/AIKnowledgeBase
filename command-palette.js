/**
 * AI Knowledge Hub — Command Palette (Cmd+K / Ctrl+K)
 * Instant access to navigation, search, actions, and keyboard shortcuts
 */
(function () {
  const PAGES = [
    { title: "Home", desc: "Main dashboard", url: "index.html", icon: "🏠", type: "page" },
    { title: "AI Tools", desc: "Browse all AI tools", url: "tools.html", icon: "🔧", type: "page" },
    { title: "Knowledge", desc: "Articles & guides", url: "knowledge.html", icon: "📖", type: "page" },
    { title: "Podcasts", desc: "AI podcasts", url: "podcasts.html", icon: "🎙️", type: "page" },
    { title: "YouTube", desc: "Video channels", url: "youtube.html", icon: "▶️", type: "page" },
    { title: "Training", desc: "Courses & training", url: "training.html", icon: "🎓", type: "page" },
    { title: "Daily Watch", desc: "Daily AI updates", url: "daily-watch.html", icon: "📰", type: "page" },
    { title: "Bleeding Edge", desc: "Cutting-edge AI", url: "bleeding-edge.html", icon: "⚡", type: "page" },
    { title: "Niche AI", desc: "19 specialized categories", url: "niche.html", icon: "🎯", type: "page" },
    { title: "Search", desc: "Search everything", url: "search.html", icon: "🔍", type: "page" },
    { title: "My Stack", desc: "Your saved tools", url: "stack.html", icon: "📚", type: "page" },
    { title: "Want to Try", desc: "Flagged items", url: "want-to-try.html", icon: "🔖", type: "page" },
    { title: "Profiles", desc: "Manage profiles", url: "profiles.html", icon: "👤", type: "page" },
    { title: "Dashboard", desc: "Personal analytics", url: "dashboard.html", icon: "📊", type: "page" },
    { title: "About", desc: "About this app", url: "about.html", icon: "ℹ️", type: "page" },
    { title: "Admin", desc: "Manage custom tools", url: "admin.html", icon: "⚙️", type: "page" },
  ];

  const ACTIONS = [
    { title: "Toggle Dark Mode", desc: "Switch theme", icon: "🌙", type: "action", action: () => { const btn = document.getElementById("theme-btn"); if (btn) btn.click(); } },
    { title: "Show Keyboard Shortcuts", desc: "View all shortcuts", icon: "⌨️", type: "action", action: () => { if (window.KeyboardShortcuts) window.KeyboardShortcuts.showHelp(); } },
    { title: "Start Tour", desc: "Guided walkthrough", icon: "🎓", type: "action", action: () => { if (window.OnboardingTour) window.OnboardingTour.start(true); } },
  ];

  let overlay = null;
  let input = null;
  let resultsList = null;
  let selectedIndex = 0;
  let currentResults = [];
  let isOpen = false;

  function getAllItems() {
    const items = [...PAGES, ...ACTIONS];
    if (window.siteData) {
      const categories = ["tools", "knowledge", "podcasts", "youtube", "training", "daily-watch", "bleeding-edge"];
      const pageMap = { tools: "tools.html", knowledge: "knowledge.html", podcasts: "podcasts.html", youtube: "youtube.html", training: "training.html", "daily-watch": "daily-watch.html", "bleeding-edge": "bleeding-edge.html" };
      categories.forEach(cat => {
        (window.siteData[cat] || []).forEach(item => {
          items.push({
            title: item.title,
            desc: item.description,
            icon: item.icon || "📄",
            type: "item",
            url: item.url || pageMap[cat],
            category: cat,
          });
        });
      });
    }
    return items;
  }

  function fuzzyMatch(query, text) {
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    if (t.includes(q)) return true;
    let qi = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) qi++;
    }
    return qi === q.length;
  }

  function search(query) {
    if (!query.trim()) {
      return [...PAGES.slice(0, 6), ...ACTIONS];
    }
    const q = query.toLowerCase().trim();
    const all = getAllItems();
    const scored = all
      .map(item => {
        const titleLower = item.title.toLowerCase();
        const descLower = (item.desc || "").toLowerCase();
        let score = 0;
        if (titleLower === q) score = 100;
        else if (titleLower.startsWith(q)) score = 80;
        else if (titleLower.includes(q)) score = 60;
        else if (descLower.includes(q)) score = 40;
        else if (fuzzyMatch(q, item.title)) score = 20;
        else if (fuzzyMatch(q, item.desc || "")) score = 10;
        else return null;
        if (item.type === "page") score += 5;
        if (item.type === "action") score += 3;
        return { ...item, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    return scored;
  }

  function highlightMatch(text, query) {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  }

  function renderResults(query) {
    currentResults = search(query);
    selectedIndex = 0;
    const typeLabels = { page: "Page", action: "Action", item: "Tool" };
    resultsList.innerHTML = currentResults.map((item, i) =>
      `<li class="cp-result${i === 0 ? " cp-result-selected" : ""}" data-index="${i}" role="option" aria-selected="${i === 0}">
        <span class="cp-result-icon">${item.icon}</span>
        <div class="cp-result-text">
          <span class="cp-result-title">${highlightMatch(item.title, query)}</span>
          <span class="cp-result-desc">${item.desc || ""}</span>
        </div>
        <span class="cp-result-type">${typeLabels[item.type] || ""}</span>
      </li>`
    ).join("");
  }

  function updateSelection() {
    resultsList.querySelectorAll(".cp-result").forEach((el, i) => {
      el.classList.toggle("cp-result-selected", i === selectedIndex);
      el.setAttribute("aria-selected", i === selectedIndex);
      if (i === selectedIndex) el.scrollIntoView({ block: "nearest" });
    });
  }

  function executeResult(item) {
    close();
    if (item.type === "action" && item.action) {
      item.action();
    } else if (item.url) {
      window.location.href = item.url;
    }
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    if (!overlay) createDOM();
    overlay.classList.add("cp-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    input.value = "";
    renderResults("");
    requestAnimationFrame(() => input.focus());
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    if (overlay) {
      overlay.classList.remove("cp-open");
      overlay.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
  }

  function createDOM() {
    overlay = document.createElement("div");
    overlay.className = "cp-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Command palette");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="cp-backdrop"></div>
      <div class="cp-container">
        <div class="cp-header">
          <svg class="cp-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="cp-input" placeholder="Search pages, tools, actions..." aria-label="Command palette search" autocomplete="off">
          <kbd class="cp-esc">esc</kbd>
        </div>
        <ul class="cp-results" role="listbox" aria-label="Results"></ul>
        <div class="cp-footer">
          <span class="cp-hint"><kbd>↑↓</kbd> navigate</span>
          <span class="cp-hint"><kbd>↵</kbd> select</span>
          <span class="cp-hint"><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    input = overlay.querySelector(".cp-input");
    resultsList = overlay.querySelector(".cp-results");

    overlay.querySelector(".cp-backdrop").addEventListener("click", close);

    input.addEventListener("input", () => renderResults(input.value));

    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
        updateSelection();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentResults[selectedIndex]) executeResult(currentResults[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    });

    resultsList.addEventListener("click", (e) => {
      const li = e.target.closest(".cp-result");
      if (li) {
        const idx = parseInt(li.dataset.index, 10);
        if (currentResults[idx]) executeResult(currentResults[idx]);
      }
    });

    resultsList.addEventListener("mousemove", (e) => {
      const li = e.target.closest(".cp-result");
      if (li) {
        selectedIndex = parseInt(li.dataset.index, 10);
        updateSelection();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (isOpen) close(); else open();
    }
    if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      close();
    }
  });

  window.CommandPalette = { open, close };
})();
