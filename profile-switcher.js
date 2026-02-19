/**
 * Profile switcher — rendered in header on all pages as a link to profiles page
 */
(function () {
  function render() {
    const el = document.getElementById("profile-switcher");
    if (!el || !window.ProfileStore) return;

    const profiles = window.ProfileStore.getProfiles();
    const activeId = window.ProfileStore.getActiveProfileId();
    if (profiles.length === 0) return;

    const active = profiles.find((p) => p.id === activeId) || profiles[0];
    el.innerHTML = `
      <a href="profiles.html" class="profile-switcher-trigger" aria-label="Profile: ${escapeAttr(active.name)} — manage profiles">
        <span class="profile-switcher-icon">👤</span>
        <span class="profile-switcher-name">${escapeHtml(active.name)}</span>
      </a>
    `;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  window.addEventListener("profile-changed", render);
})();
