/**
 * Want to Try — Lists items flagged as "Want to Try"
 */

(function () {
  const CATEGORY_CONFIG = [
    { id: "tools", label: "Tools", page: "tools.html", key: "tools" },
    { id: "knowledge", label: "Knowledge", page: "knowledge.html", key: "knowledge" },
    { id: "podcasts", label: "Podcasts", page: "podcasts.html", key: "podcasts" },
    { id: "youtube", label: "YouTube", page: "youtube.html", key: "youtube" },
    { id: "training", label: "Training", page: "training.html", key: "training" },
    { id: "daily-watch", label: "Daily Watch", page: "daily-watch.html", key: "dailyWatch" },
    { id: "bleeding-edge", label: "Bleeding Edge", page: "bleeding-edge.html", key: "bleedingEdge" },
    { id: "niche", label: "Niche AI", page: "niche.html" },
  ];

  function getCustomTools() {
    try {
      const j = localStorage.getItem("customTools");
      return j ? JSON.parse(j) : {};
    } catch (_) { return {}; }
  }

  function getAllItems() {
    const custom = getCustomTools();
    const data = typeof siteData === "object" && siteData ? siteData : {};
    const niche = typeof nicheData === "object" && nicheData ? nicheData : {};
    const items = [];
    CATEGORY_CONFIG.forEach((cfg) => {
      if (cfg.id === "niche") {
        Object.keys(niche).filter((k) => Array.isArray(niche[k])).forEach((cat) => {
          (niche[cat] || []).forEach((item) =>
            items.push({ ...item, category: "niche", categoryLabel: "Niche AI", categoryPage: "niche.html", nicheSection: cat })
          );
        });
        return;
      }
      const baseItems = data[cfg.key] || [];
      const customItems = custom[cfg.key] || [];
      const all = [...baseItems, ...customItems];
      all.forEach((item) => items.push({ ...item, category: cfg.id, categoryLabel: cfg.label, categoryPage: cfg.page }));
    });
    return items;
  }

  function getWantToTry() {
    return window.ProfileStore ? window.ProfileStore.getWantToTry() : [];
  }

  function render() {
    const grid = document.getElementById("want-to-try-grid");
    const totalEl = document.getElementById("total-count");
    const emptyMsg = document.getElementById("want-empty-msg");
    const main = document.getElementById("main-content");
    if (!grid) return;

    const wantSet = new Set(getWantToTry());
    const allItems = getAllItems();
    const wantItems = allItems.filter((item) => wantSet.has(item.title));

    if (totalEl) totalEl.textContent = wantItems.length;
    if (emptyMsg) emptyMsg.style.display = wantItems.length === 0 ? "block" : "none";

    if (wantItems.length === 0) {
      grid.innerHTML = "";
    } else {
      const buildCard = window.CardBuilder?.buildCard;
      const html = wantItems.map((item) => {
        const cat = item.category || "tools";
        return buildCard ? buildCard(item, cat) : `<div class="card" data-title="${escapeAttr(item.title)}"><a href="${escapeHtml(item.url || "#")}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a></div>`;
      }).join("");
      grid.innerHTML = html;
      if (window.CardBuilder?.initInteractions) window.CardBuilder.initInteractions(grid);
    }

    if (main) {
      main.classList.remove("main-loading");
      main.removeAttribute("aria-busy");
    }
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function escapeAttr(s) {
    return escapeHtml(s || "").replace(/"/g, "&quot;");
  }

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
