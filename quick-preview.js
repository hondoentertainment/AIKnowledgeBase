/**
 * AI Knowledge Hub — Quick Preview Modal
 * Peek at item details without leaving the page
 */
(function () {
  let modal = null;
  let isOpen = false;

  function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function levelLabel(lvl) { if (lvl <= 2) return "Beginner"; if (lvl <= 4) return "Intermediate"; if (lvl <= 6) return "Advanced"; if (lvl <= 8) return "Expert"; return "World-Class"; }

  function gradientCSS(colorPair) {
    if (colorPair && colorPair.length === 2) return `linear-gradient(135deg, ${colorPair[0]} 0%, ${colorPair[1]} 100%)`;
    return "linear-gradient(135deg, #30363d 0%, #21262d 100%)";
  }

  function findItem(title) {
    if (!window.siteData) return null;
    const categories = ["tools", "knowledge", "podcasts", "youtube", "training", "daily-watch", "bleeding-edge"];
    for (const cat of categories) {
      const found = (window.siteData[cat] || []).find(it => it.title === title);
      if (found) return { ...found, category: cat };
    }
    if (window.nicheData) {
      for (const [section, items] of Object.entries(window.nicheData)) {
        const found = (items || []).find(it => it.title === title);
        if (found) return { ...found, category: "niche", nicheSection: section };
      }
    }
    return null;
  }

  function createModal() {
    modal = document.createElement("div");
    modal.className = "qp-overlay";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "Quick preview");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="qp-backdrop"></div>
      <div class="qp-panel">
        <button type="button" class="qp-close" aria-label="Close preview">&times;</button>
        <div class="qp-content"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".qp-backdrop").addEventListener("click", close);
    modal.querySelector(".qp-close").addEventListener("click", close);
  }

  function open(title) {
    const item = findItem(title);
    if (!item) return;
    if (!modal) createModal();

    const content = modal.querySelector(".qp-content");
    const tags = (item.tags || []).map(t => `<span class="qp-tag">${escapeHtml(t)}</span>`).join("");
    const lvl = item.level || 0;

    content.innerHTML = `
      <div class="qp-hero" style="background: ${gradientCSS(item.color)}">
        <span class="qp-icon">${item.icon || "📄"}</span>
        <h2 class="qp-title">${escapeHtml(item.title)}</h2>
        ${item.category ? `<span class="qp-category">${escapeHtml(item.category)}</span>` : ""}
      </div>
      <div class="qp-body">
        <p class="qp-desc">${escapeHtml(item.description || "")}</p>
        ${lvl ? `<div class="qp-meta"><span class="qp-level">Level: ${lvl}/10 (${levelLabel(lvl)})</span></div>` : ""}
        ${item.freq ? `<div class="qp-meta"><span class="qp-freq">Frequency: ${escapeHtml(item.freq)}</span></div>` : ""}
        ${tags ? `<div class="qp-tags">${tags}</div>` : ""}
        <div class="qp-actions">
          ${item.url && item.url !== "#" ? `<a href="${escapeHtml(item.url)}" class="qp-visit-btn" target="_blank" rel="noopener">Visit Site</a>` : ""}
          <button type="button" class="qp-stack-btn" data-title="${escapeHtml(item.title)}">+ Add to Stack</button>
        </div>
      </div>
    `;

    // Stack button
    const stackBtn = content.querySelector(".qp-stack-btn");
    if (stackBtn) {
      const inStack = window.CardBuilder && window.ProfileStore
        ? (window.ProfileStore.getStack() || []).includes(item.title)
        : JSON.parse(localStorage.getItem("myStack") || "[]").includes(item.title);
      if (inStack) { stackBtn.textContent = "✓ In Stack"; stackBtn.classList.add("in-stack"); }
      stackBtn.addEventListener("click", () => {
        const stack = window.ProfileStore
          ? (window.ProfileStore.getStack() || [])
          : JSON.parse(localStorage.getItem("myStack") || "[]");
        if (stack.includes(item.title)) {
          const filtered = stack.filter(t => t !== item.title);
          if (window.ProfileStore) window.ProfileStore.setStack(filtered);
          else localStorage.setItem("myStack", JSON.stringify(filtered));
          stackBtn.textContent = "+ Add to Stack";
          stackBtn.classList.remove("in-stack");
        } else {
          stack.push(item.title);
          if (window.ProfileStore) window.ProfileStore.setStack(stack);
          else localStorage.setItem("myStack", JSON.stringify(stack));
          stackBtn.textContent = "✓ In Stack";
          stackBtn.classList.add("in-stack");
        }
      });
    }

    isOpen = true;
    modal.classList.add("qp-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    if (modal) {
      modal.classList.remove("qp-open");
      modal.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
  }

  // Listen for long-press or right-click on cards for quick preview
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) { close(); e.preventDefault(); }
  });

  // Double-click on card cover to preview
  document.addEventListener("dblclick", (e) => {
    const card = e.target.closest(".card");
    if (card) {
      e.preventDefault();
      const title = card.dataset.title;
      if (title) open(title);
    }
  });

  window.QuickPreview = { open, close };
})();
