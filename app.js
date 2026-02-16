/**
 * AI Knowledge Hub — App logic
 * Renders content from data.js and handles search
 */

(function () {
  const searchEl = document.getElementById("search");
  const themeBtn = document.getElementById("theme-btn");
  const toolsGrid = document.getElementById("tools-grid");
  const knowledgeGrid = document.getElementById("knowledge-grid");
  const podcastsGrid = document.getElementById("podcasts-grid");

  // Theme
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeBtn.setAttribute("aria-pressed", savedTheme === "dark");

  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    themeBtn.setAttribute("aria-pressed", next === "dark");
    localStorage.setItem("theme", next);
  });

  // Build card HTML
  function buildCard(item, type) {
    const url = item.url || "#";
    const tags = (item.tags || []).map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`).join("");

    return `
      <a href="${escapeHtml(url)}" class="card" data-title="${escapeAttr(item.title)}" data-desc="${escapeAttr(item.description)}" data-tags="${escapeAttr((item.tags || []).join(" "))}" target="_blank" rel="noopener">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-desc">${escapeHtml(item.description)}</p>
        ${tags ? `<div class="card-tags">${tags}</div>` : ""}
      </a>
    `;
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  // Render grids
  function render() {
    const { tools, knowledge, podcasts } = siteData;

    toolsGrid.innerHTML = tools.length
      ? tools.map((t) => buildCard(t, "tool")).join("")
      : '<p class="section-empty">No tools added yet. Edit data.js to add your AI tools.</p>';

    knowledgeGrid.innerHTML = knowledge.length
      ? knowledge.map((k) => buildCard(k, "knowledge")).join("")
      : '<p class="section-empty">No knowledge items yet. Edit data.js to add articles and guides.</p>';

    podcastsGrid.innerHTML = podcasts.length
      ? podcasts.map((p) => buildCard(p, "podcast")).join("")
      : '<p class="section-empty">No podcasts yet. Edit data.js to add your favorite shows.</p>';
  }

  render();

  // Search
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
