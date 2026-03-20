/**
 * AI Knowledge Hub — Quick Preview Modal
 * Peek at item details without leaving the page
 */
(function () {
  let overlay = null;
  let isOpen = false;

  function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function levelLabel(lvl) { if (lvl <= 2) return "Beginner"; if (lvl <= 4) return "Intermediate"; if (lvl <= 6) return "Advanced"; if (lvl <= 8) return "Expert"; return "World-Class"; }
  function levelClass(lvl) { if (lvl <= 2) return "level-beginner"; if (lvl <= 4) return "level-intermediate"; return "level-advanced"; }

  function gradientCSS(colorPair) {
    if (colorPair && colorPair.length === 2) return "linear-gradient(135deg, " + colorPair[0] + " 0%, " + colorPair[1] + " 100%)";
    return "linear-gradient(135deg, #30363d 0%, #21262d 100%)";
  }

  function findItem(title) {
    if (!window.siteData) return null;
    var categories = ["tools", "knowledge", "podcasts", "youtube", "training", "daily-watch", "bleeding-edge"];
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      var items = window.siteData[cat] || [];
      for (var j = 0; j < items.length; j++) {
        if (items[j].title === title) return Object.assign({}, items[j], { category: cat });
      }
    }
    if (window.nicheData) {
      var sections = Object.keys(window.nicheData);
      for (var s = 0; s < sections.length; s++) {
        var arr = window.nicheData[sections[s]] || [];
        for (var k = 0; k < arr.length; k++) {
          if (arr[k].title === title) return Object.assign({}, arr[k], { category: "niche", nicheSection: sections[s] });
        }
      }
    }
    return null;
  }

  function findSimilar(item, limit) {
    if (!window.siteData || !item.tags || !item.tags.length) return [];
    var tagSet = {};
    (item.tags || []).forEach(function(t) { tagSet[t.toLowerCase()] = true; });
    var results = [];
    var categories = ["tools", "knowledge", "podcasts", "youtube", "training", "daily-watch", "bleeding-edge"];
    categories.forEach(function(cat) {
      (window.siteData[cat] || []).forEach(function(it) {
        if (it.title === item.title) return;
        var matches = (it.tags || []).filter(function(t) { return tagSet[t.toLowerCase()]; }).length;
        if (matches > 0) results.push({ item: it, matches: matches });
      });
    });
    results.sort(function(a, b) { return b.matches - a.matches; });
    return results.slice(0, limit || 3).map(function(r) { return r.item; });
  }

  function open(title, category) {
    var item = findItem(title);
    if (!item) return;

    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.className = "quick-preview-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Preview: " + escapeHtml(item.title));

    var tags = (item.tags || []).map(function(t) { return '<span class="qp-tag">' + escapeHtml(t) + '</span>'; }).join("");
    var lvl = item.level || 0;
    var lvlHtml = lvl ? '<span class="qp-level badge ' + levelClass(lvl) + '">' + levelLabel(lvl) + '</span>' : '';

    var similar = findSimilar(item, 3);
    var similarHtml = "";
    if (similar.length > 0) {
      similarHtml = '<div class="qp-similar"><p class="qp-similar-title">Similar Tools</p><div class="qp-similar-list">' +
        similar.map(function(s) {
          return '<a href="' + escapeHtml(s.url || "#") + '" class="qp-similar-item" target="_blank" rel="noopener">' +
            '<span class="qp-similar-icon" style="background:' + gradientCSS(s.color) + '">' + (s.icon || "📄") + '</span>' +
            '<span class="qp-similar-name">' + escapeHtml(s.title) + '</span></a>';
        }).join("") + '</div></div>';
    }

    var inStack = false;
    try {
      var stack = window.ProfileStore ? (window.ProfileStore.getStack() || []) : JSON.parse(localStorage.getItem("myStack") || "[]");
      inStack = stack.indexOf(item.title) !== -1;
    } catch(e) {}

    var visitBtn = item.url && item.url !== "#" ? '<a href="' + escapeHtml(item.url) + '" class="qp-visit" target="_blank" rel="noopener">Visit Site</a>' : '';
    var stackBtnLabel = inStack ? "In Stack" : "+ Add to Stack";

    overlay.innerHTML =
      '<div class="quick-preview-modal">' +
        '<div class="qp-header">' +
          '<div class="qp-icon" style="background:' + gradientCSS(item.color) + '">' + (item.icon || "📄") + '</div>' +
          '<div class="qp-title-area">' +
            '<h2 class="qp-title">' + escapeHtml(item.title) + '</h2>' +
            lvlHtml +
          '</div>' +
          '<button type="button" class="qp-close" aria-label="Close preview">&times;</button>' +
        '</div>' +
        '<div class="qp-body">' +
          '<p class="qp-desc">' + escapeHtml(item.description || "") + '</p>' +
          (tags ? '<div class="qp-tags">' + tags + '</div>' : '') +
          similarHtml +
          '<div class="qp-actions">' +
            visitBtn +
            '<button type="button" class="qp-stack-btn" data-title="' + escapeHtml(item.title) + '">' + stackBtnLabel + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    isOpen = true;

    // Close handlers
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) close();
    });
    overlay.querySelector(".qp-close").addEventListener("click", close);

    // Stack toggle
    var stackBtn = overlay.querySelector(".qp-stack-btn");
    if (stackBtn) {
      stackBtn.addEventListener("click", function() {
        var s;
        try { s = window.ProfileStore ? (window.ProfileStore.getStack() || []) : JSON.parse(localStorage.getItem("myStack") || "[]"); } catch(e) { s = []; }
        var idx = s.indexOf(item.title);
        if (idx !== -1) {
          s.splice(idx, 1);
          if (window.ProfileStore) window.ProfileStore.setStack(s);
          else localStorage.setItem("myStack", JSON.stringify(s));
          stackBtn.textContent = "+ Add to Stack";
        } else {
          s.push(item.title);
          if (window.ProfileStore) window.ProfileStore.setStack(s);
          else localStorage.setItem("myStack", JSON.stringify(s));
          stackBtn.textContent = "In Stack";
        }
        if (window.showToast) window.showToast(idx !== -1 ? "Removed from stack" : "Added to stack");
      });
    }

    // Focus the close button
    var closeBtn = overlay.querySelector(".qp-close");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && isOpen) { close(); e.preventDefault(); }
  });

  // Double-click on card cover to preview
  document.addEventListener("dblclick", function(e) {
    var card = e.target.closest(".card");
    if (card) {
      e.preventDefault();
      var title = card.dataset.title;
      if (title) open(title);
    }
  });

  window.QuickPreview = { open: open, close: close };
})();
