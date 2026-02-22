/**
 * AI Knowledge Hub — Bottom nav behavior (all pages)
 * Search: open overlay or navigate to search.html
 * More: open slide-out nav or more menu overlay
 */
(function () {
  function haptic() {
    if (navigator.vibrate) navigator.vibrate(5);
  }

  const bottomSearchBtn = document.getElementById("bottom-search-btn");
  const bottomMoreBtn = document.getElementById("bottom-more-btn");
  const searchBar = document.getElementById("search-bar");
  const searchEl = document.getElementById("search");
  const navToggle = document.getElementById("nav-toggle");

  if (bottomSearchBtn) {
    bottomSearchBtn.addEventListener("click", function () {
      haptic();
      if (searchBar && searchEl) {
        searchBar.classList.add("open");
        searchEl.focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = "search.html";
      }
    });
  }

  if (bottomMoreBtn) {
    bottomMoreBtn.addEventListener("click", function () {
      haptic();
      if (navToggle) {
        navToggle.click();
      } else {
        openMoreMenu();
      }
    });
  }

  function openMoreMenu() {
    let overlay = document.getElementById("more-menu-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "more-menu-overlay";
      overlay.className = "more-menu-overlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML =
        '<div class="more-menu-backdrop" id="more-menu-backdrop" aria-hidden="true"></div>' +
        '<div class="more-menu-panel" role="dialog" aria-label="More pages" aria-modal="true">' +
        '<a href="index.html" class="more-menu-link">Home</a>' +
        '<a href="tools.html" class="more-menu-link">Tools</a>' +
        '<a href="search.html" class="more-menu-link">Search</a>' +
        '<a href="stack.html" class="more-menu-link">My Stack</a>' +
        '<a href="want-to-try.html" class="more-menu-link">Want to Try</a>' +
        '<a href="profiles.html" class="more-menu-link">Profiles</a>' +
        '<a href="about.html" class="more-menu-link">About</a>' +
        "</div>";
      document.body.appendChild(overlay);
      overlay.querySelector("#more-menu-backdrop").addEventListener("click", closeMoreMenu);
      overlay.querySelectorAll(".more-menu-link").forEach(function (link) {
        link.addEventListener("click", function () {
          haptic();
          closeMoreMenu();
        });
      });
      document.addEventListener("keydown", moreMenuKeyHandler);
    }
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    if (overlay.querySelector("#more-menu-backdrop")) {
      overlay.querySelector("#more-menu-backdrop").setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("more-menu-open");
    var panel = overlay.querySelector(".more-menu-panel");
    var links = overlay.querySelectorAll(".more-menu-link");
    var firstLink = links[0];
    if (firstLink) firstLink.focus();

    if (overlay._trapFocus) document.removeEventListener("keydown", overlay._trapFocus);
    function trapFocus(e) {
      if (e.key !== "Tab" || !panel || !panel.contains(document.activeElement)) return;
      var first = links[0];
      var last = links[links.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", trapFocus);
    overlay._trapFocus = trapFocus;
  }

  function closeMoreMenu() {
    var overlay = document.getElementById("more-menu-overlay");
    if (overlay) {
      overlay.classList.remove("visible");
      overlay.setAttribute("aria-hidden", "true");
      if (overlay.querySelector("#more-menu-backdrop")) {
        overlay.querySelector("#more-menu-backdrop").setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("more-menu-open");
      if (overlay._trapFocus) document.removeEventListener("keydown", overlay._trapFocus);
      if (bottomMoreBtn) bottomMoreBtn.focus();
    }
    document.removeEventListener("keydown", moreMenuKeyHandler);
  }

  function moreMenuKeyHandler(e) {
    if (e.key === "Escape") {
      closeMoreMenu();
      e.preventDefault();
    }
  }

  var bottomNav = document.querySelector(".bottom-nav");
  if (bottomNav) {
    bottomNav.addEventListener("click", function (e) {
      if (e.target.closest(".bottom-nav-item")) haptic();
    }, { passive: true });
  }
})();
