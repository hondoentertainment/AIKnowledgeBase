/**
 * Profile switcher — dropdown in header for quick switch, link to profiles for manage
 */
(function () {
  function render() {
    const el = document.getElementById("profile-switcher");
    if (!el || !window.ProfileStore) return;

    const profiles = window.ProfileStore.getProfiles();
    const activeId = window.ProfileStore.getActiveProfileId();
    if (profiles.length === 0) return;

    const active = profiles.find((p) => p.id === activeId) || profiles[0];
    const isOpen = el.dataset.open === "true";

    let html = `<button type="button" class="profile-switcher-trigger" aria-label="Profile: ${escapeAttr(active.name)}" aria-haspopup="listbox" aria-expanded="${isOpen}" id="profile-switcher-btn">
      <span class="profile-switcher-icon">👤</span>
      <span class="profile-switcher-name">${escapeHtml(active.name)}</span>
      <span class="profile-switcher-chevron" aria-hidden="true">▼</span>
    </button>`;
    if (profiles.length > 1) {
      html += `<div class="profile-switcher-dropdown" role="listbox" aria-label="Switch profile"${isOpen ? "" : ' hidden'}>
        ${profiles.map((p) => `
          <button type="button" class="profile-switcher-option ${p.id === activeId ? "active" : ""}" role="option" aria-selected="${p.id === activeId}" data-profile-id="${escapeAttr(p.id)}" data-profile-name="${escapeAttr(p.name)}">
            ${escapeHtml(p.name)}${p.id === activeId ? " ✓" : ""}
          </button>
        `).join("")}
        <a href="profiles.html" class="profile-switcher-manage">Manage profiles</a>
      </div>`;
    } else {
      html = `<a href="profiles.html" class="profile-switcher-trigger" aria-label="Profile: ${escapeAttr(active.name)}">
        <span class="profile-switcher-icon">👤</span>
        <span class="profile-switcher-name">${escapeHtml(active.name)}</span>
      </a>`;
    }
    el.innerHTML = html;
    el.dataset.open = "false";

    if (profiles.length > 1) {
      const btn = document.getElementById("profile-switcher-btn");
      const dropdown = el.querySelector(".profile-switcher-dropdown");
      const options = el.querySelectorAll(".profile-switcher-option");

      const close = () => {
        el.dataset.open = "false";
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (dropdown) dropdown.hidden = true;
      };

      const open = () => {
        el.dataset.open = "true";
        if (btn) btn.setAttribute("aria-expanded", "true");
        if (dropdown) dropdown.hidden = false;
      };

      const toggle = () => (el.dataset.open === "true" ? close() : open());

      if (btn) {
        btn.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
      }
      options.forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          const id = opt.dataset.profileId;
          if (id && window.ProfileStore.setActiveProfile) {
            window.ProfileStore.setActiveProfile(id);
            window.dispatchEvent(new CustomEvent("profile-changed"));
            close();
          }
        });
      });
      document.addEventListener("click", (e) => {
        if (!el.contains(e.target)) close();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && el.dataset.open === "true") close();
      });
    }
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
