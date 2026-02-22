/**
 * Toast notifications for share/copy feedback
 */
(function () {
  let container = null;
  function getContainer() {
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "true");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }
  window.showToast = function (msg, durationMs) {
    if (!msg) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    getContainer().appendChild(el);
    requestAnimationFrame(() => el.classList.add("visible"));
    setTimeout(() => {
      el.classList.remove("visible");
      setTimeout(() => el.remove(), 200);
    }, durationMs || 2200);
  };
})();
