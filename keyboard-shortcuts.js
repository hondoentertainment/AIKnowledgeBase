/**
 * AI Knowledge Hub — Keyboard Shortcuts System
 * Global keyboard shortcuts with help overlay
 */
(function () {
  let helpOverlay = null;
  let isHelpOpen = false;

  const SHORTCUTS = [
    { keys: ["Ctrl+K", "Cmd+K"], desc: "Open command palette", group: "Navigation" },
    { keys: ["/"], desc: "Focus search", group: "Navigation" },
    { keys: ["?"], desc: "Show keyboard shortcuts", group: "Navigation" },
    { keys: ["g h"], desc: "Go to Home", group: "Navigation" },
    { keys: ["g t"], desc: "Go to Tools", group: "Navigation" },
    { keys: ["g k"], desc: "Go to Knowledge", group: "Navigation" },
    { keys: ["g s"], desc: "Go to My Stack", group: "Navigation" },
    { keys: ["g d"], desc: "Go to Dashboard", group: "Navigation" },
    { keys: ["Esc"], desc: "Close modal/overlay", group: "General" },
    { keys: ["d"], desc: "Toggle dark mode", group: "General" },
    { keys: ["↑ ↓"], desc: "Navigate results", group: "General" },
    { keys: ["Enter"], desc: "Select/activate", group: "General" },
  ];

  const GO_SHORTCUTS = {
    h: "index.html",
    t: "tools.html",
    k: "knowledge.html",
    p: "podcasts.html",
    y: "youtube.html",
    s: "stack.html",
    d: "dashboard.html",
    n: "niche.html",
    a: "about.html",
  };

  let gPending = false;
  let gTimer = null;

  function isInputFocused() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
  }

  function createHelpOverlay() {
    helpOverlay = document.createElement("div");
    helpOverlay.className = "ks-overlay";
    helpOverlay.setAttribute("role", "dialog");
    helpOverlay.setAttribute("aria-label", "Keyboard shortcuts");
    helpOverlay.setAttribute("aria-hidden", "true");

    const groups = {};
    SHORTCUTS.forEach(s => {
      if (!groups[s.group]) groups[s.group] = [];
      groups[s.group].push(s);
    });

    let html = '<div class="ks-backdrop"></div><div class="ks-panel">';
    html += '<div class="ks-header"><h2 class="ks-title">Keyboard Shortcuts</h2><button class="ks-close" aria-label="Close">&times;</button></div>';
    html += '<div class="ks-body">';
    Object.entries(groups).forEach(([group, shortcuts]) => {
      html += `<div class="ks-group"><h3 class="ks-group-title">${group}</h3>`;
      shortcuts.forEach(s => {
        const keys = s.keys.map(k => `<kbd class="ks-key">${k}</kbd>`).join(" / ");
        html += `<div class="ks-row"><span class="ks-desc">${s.desc}</span><span class="ks-keys">${keys}</span></div>`;
      });
      html += '</div>';
    });
    html += '</div></div>';

    helpOverlay.innerHTML = html;
    document.body.appendChild(helpOverlay);

    helpOverlay.querySelector(".ks-backdrop").addEventListener("click", closeHelp);
    helpOverlay.querySelector(".ks-close").addEventListener("click", closeHelp);
  }

  function showHelp() {
    if (isHelpOpen) return;
    if (!helpOverlay) createHelpOverlay();
    isHelpOpen = true;
    helpOverlay.classList.add("ks-open");
    helpOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeHelp() {
    if (!isHelpOpen) return;
    isHelpOpen = false;
    helpOverlay.classList.remove("ks-open");
    helpOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", (e) => {
    if (isInputFocused()) return;

    // ? for help
    if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      if (isHelpOpen) closeHelp(); else showHelp();
      return;
    }

    // Escape closes help
    if (e.key === "Escape" && isHelpOpen) {
      e.preventDefault();
      closeHelp();
      return;
    }

    // d for dark mode toggle
    if (e.key === "d" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const btn = document.getElementById("theme-btn");
      if (btn) { btn.click(); e.preventDefault(); }
      return;
    }

    // g + letter for go-to navigation
    if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      gPending = true;
      clearTimeout(gTimer);
      gTimer = setTimeout(() => { gPending = false; }, 800);
      return;
    }

    if (gPending && GO_SHORTCUTS[e.key]) {
      e.preventDefault();
      gPending = false;
      clearTimeout(gTimer);
      window.location.href = GO_SHORTCUTS[e.key];
      return;
    }

    gPending = false;
  });

  window.KeyboardShortcuts = { showHelp, closeHelp };
})();
