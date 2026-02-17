/**
 * Profile switcher dropdown — rendered in header on all pages
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
      <div class="profile-switcher-trigger" id="profile-trigger" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false" aria-label="Switch profile">
        <span class="profile-switcher-icon">👤</span>
        <span class="profile-switcher-name">${escapeHtml(active.name)}</span>
        <span class="profile-switcher-chevron">▼</span>
      </div>
      <div class="profile-switcher-dropdown hidden" id="profile-dropdown" role="listbox">
        ${profiles.map((p) => `
          <button type="button" class="profile-switcher-option ${p.id === activeId ? "active" : ""}" data-id="${escapeAttr(p.id)}">${escapeHtml(p.name)}</button>
        `).join("")}
        <a href="profiles.html" class="profile-switcher-manage">Manage profiles</a>
      </div>
    `;

    const trigger = el.querySelector("#profile-trigger");
    const dropdown = el.querySelector("#profile-dropdown");

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
      trigger.setAttribute("aria-expanded", !dropdown.classList.contains("hidden"));
    });

    el.querySelectorAll(".profile-switcher-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.ProfileStore.setActiveProfile(btn.dataset.id);
        dropdown.classList.add("hidden");
        trigger.setAttribute("aria-expanded", "false");
        render();
      });
    });

    document.addEventListener("click", (e) => {
      if (!el.contains(e.target)) {
        dropdown.classList.add("hidden");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });
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
