/**
 * AI Knowledge Hub — Comparison Mode
 * Side-by-side tool evaluation
 */
(function () {
  let compareList = [];
  let bar = null;
  let modal = null;
  const MAX_COMPARE = 4;

  function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function levelLabel(lvl) { if (lvl <= 2) return "Beginner"; if (lvl <= 4) return "Intermediate"; if (lvl <= 6) return "Advanced"; if (lvl <= 8) return "Expert"; return "World-Class"; }
  function gradientCSS(cp) { return cp && cp.length === 2 ? `linear-gradient(135deg, ${cp[0]} 0%, ${cp[1]} 100%)` : "linear-gradient(135deg, #30363d 0%, #21262d 100%)"; }

  function findItem(title) {
    if (!window.siteData) return null;
    const cats = ["tools", "knowledge", "podcasts", "youtube", "training", "daily-watch", "bleeding-edge"];
    for (const cat of cats) {
      const found = (window.siteData[cat] || []).find(it => it.title === title);
      if (found) return { ...found, _cat: cat };
    }
    return null;
  }

  function getRating(title) {
    if (window.ProfileStore && window.ProfileStore.getRating) return window.ProfileStore.getRating(title);
    const v = localStorage.getItem("rating:" + title);
    return v ? parseFloat(v) : 0;
  }

  function createBar() {
    bar = document.createElement("div");
    bar.className = "cmp-bar";
    bar.setAttribute("aria-label", "Compare tools");
    bar.innerHTML = `
      <div class="cmp-bar-inner">
        <span class="cmp-bar-label">Compare (<span class="cmp-bar-count">0</span>/${MAX_COMPARE})</span>
        <div class="cmp-bar-items"></div>
        <button type="button" class="cmp-bar-go" disabled>Compare Now</button>
        <button type="button" class="cmp-bar-clear">Clear</button>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector(".cmp-bar-go").addEventListener("click", showComparison);
    bar.querySelector(".cmp-bar-clear").addEventListener("click", () => { compareList = []; updateBar(); });
  }

  function updateBar() {
    if (!bar) createBar();
    const itemsEl = bar.querySelector(".cmp-bar-items");
    const countEl = bar.querySelector(".cmp-bar-count");
    const goBtn = bar.querySelector(".cmp-bar-go");

    countEl.textContent = compareList.length;
    goBtn.disabled = compareList.length < 2;
    bar.classList.toggle("cmp-bar-visible", compareList.length > 0);

    itemsEl.innerHTML = compareList.map(title => {
      const item = findItem(title);
      return `<span class="cmp-bar-chip">${item?.icon || "📄"} ${escapeHtml(title)}<button type="button" class="cmp-bar-chip-x" data-title="${escapeHtml(title)}" aria-label="Remove ${escapeHtml(title)}">&times;</button></span>`;
    }).join("");

    itemsEl.querySelectorAll(".cmp-bar-chip-x").forEach(btn => {
      btn.addEventListener("click", () => { remove(btn.dataset.title); });
    });

    // Update compare buttons on cards
    document.querySelectorAll(".cmp-add-btn").forEach(btn => {
      const inList = compareList.includes(btn.dataset.cmpTitle);
      btn.classList.toggle("cmp-active", inList);
      btn.textContent = inList ? "✓ Comparing" : "Compare";
      btn.setAttribute("aria-pressed", inList);
    });
  }

  function add(title) {
    if (compareList.includes(title) || compareList.length >= MAX_COMPARE) return;
    compareList.push(title);
    updateBar();
  }

  function remove(title) {
    compareList = compareList.filter(t => t !== title);
    updateBar();
  }

  function toggle(title) {
    if (compareList.includes(title)) remove(title);
    else add(title);
  }

  function showComparison() {
    if (compareList.length < 2) return;
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "cmp-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-label", "Tool comparison");
      document.body.appendChild(modal);
    }

    const items = compareList.map(t => findItem(t)).filter(Boolean);
    const allTags = new Set();
    items.forEach(it => (it.tags || []).forEach(t => allTags.add(t)));

    modal.innerHTML = `
      <div class="cmp-modal-backdrop"></div>
      <div class="cmp-modal-panel">
        <div class="cmp-modal-header">
          <h2>Compare Tools</h2>
          <button type="button" class="cmp-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="cmp-modal-body">
          <table class="cmp-table">
            <thead>
              <tr>
                <th></th>
                ${items.map(it => `<th><div class="cmp-th-inner"><span class="cmp-th-icon" style="background:${gradientCSS(it.color)}">${it.icon || "📄"}</span><span class="cmp-th-name">${escapeHtml(it.title)}</span></div></th>`).join("")}
              </tr>
            </thead>
            <tbody>
              <tr><td class="cmp-label">Category</td>${items.map(it => `<td>${escapeHtml(it._cat || "")}</td>`).join("")}</tr>
              <tr><td class="cmp-label">Level</td>${items.map(it => `<td>${it.level ? it.level + "/10 (" + levelLabel(it.level) + ")" : "N/A"}</td>`).join("")}</tr>
              <tr><td class="cmp-label">Your Rating</td>${items.map(it => { const r = getRating(it.title); return `<td>${r ? r + "/5 " + "★".repeat(Math.floor(r)) : "Not rated"}</td>`; }).join("")}</tr>
              <tr><td class="cmp-label">Tags</td>${items.map(it => `<td>${(it.tags || []).map(t => `<span class="cmp-tag">${escapeHtml(t)}</span>`).join(" ")}</td>`).join("")}</tr>
              <tr><td class="cmp-label">Description</td>${items.map(it => `<td class="cmp-desc">${escapeHtml(it.description || "")}</td>`).join("")}</tr>
              <tr><td class="cmp-label">Frequency</td>${items.map(it => `<td>${escapeHtml(it.freq || "N/A")}</td>`).join("")}</tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    modal.classList.add("cmp-modal-open");
    document.body.style.overflow = "hidden";

    modal.querySelector(".cmp-modal-backdrop").addEventListener("click", closeComparison);
    modal.querySelector(".cmp-modal-close").addEventListener("click", closeComparison);
  }

  function closeComparison() {
    if (modal) modal.classList.remove("cmp-modal-open");
    document.body.style.overflow = "";
  }

  // Inject compare buttons into cards after they render
  function injectCompareButtons() {
    document.querySelectorAll(".card").forEach(card => {
      if (card.querySelector(".cmp-add-btn")) return;
      const actions = card.querySelector(".card-actions");
      if (!actions) return;
      const title = card.dataset.title;
      if (!title) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cmp-add-btn";
      btn.dataset.cmpTitle = title;
      btn.textContent = compareList.includes(title) ? "✓ Comparing" : "Compare";
      btn.setAttribute("aria-pressed", compareList.includes(title));
      btn.setAttribute("aria-label", "Add " + title + " to comparison");
      btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggle(title); });
      actions.appendChild(btn);
    });
  }

  // Observe for new cards
  const obs = new MutationObserver(() => { setTimeout(injectCompareButtons, 200); });
  obs.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("cmp-modal-open")) {
      closeComparison();
      e.preventDefault();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(injectCompareButtons, 800));
  } else {
    setTimeout(injectCompareButtons, 800);
  }

  window.Comparison = { add, remove, toggle, show: showComparison };
})();
