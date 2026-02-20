/**
 * AI Knowledge Hub — Centralized theme logic
 * Applies saved theme or prefers-color-scheme; wires theme toggle
 */
(function () {
  const KEY = "theme";

  function get() {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function set(val) {
    document.documentElement.setAttribute("data-theme", val);
    localStorage.setItem(KEY, val);
  }

  function apply() {
    set(get());
  }

  apply();

  function init() {
    apply();
    const btn = document.getElementById("theme-btn");
    if (btn) {
      btn.setAttribute("aria-pressed", get() === "dark");
      btn.addEventListener("click", function () {
        const next = get() === "dark" ? "light" : "dark";
        set(next);
        btn.setAttribute("aria-pressed", next === "dark");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.Theme = { get, set, apply, init };
})();
