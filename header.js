/**
 * AI Knowledge Hub — Shared header component
 * Single source of truth for topbar navigation
 * Consolidates: flat nav structure, auth in You group
 */

(function () {
  const ICON_MOON = '<svg aria-hidden="true" class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const ICON_SUN = '<svg aria-hidden="true" class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const ICON_SEARCH = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  const ICON_SEARCH_SM = '<svg aria-hidden="true" class="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

  function navTab(href, label, active, id) {
    const cls = "nav-tab" + (active ? " active" : "");
    const idAttr = id ? ' id="' + id + '"' : "";
    return '<a href="' + href + '" class="' + cls + '"' + idAttr + '>' + label + '</a>';
  }

  function render(opts) {
    opts = opts || {};
    const variant = opts.variant || "full";
    const activeNav = opts.activeNav || null;
    const searchMode = opts.searchMode || "expandable";
    const searchPlaceholder = opts.searchPlaceholder || "Search tools, articles, podcasts, videos, bleeding edge… (press /)";
    const root = document.getElementById("header-root");
    if (!root) return;

    if (variant === "auth") {
      const authTabs = opts.authTabs || [];
      let navHtml = "";
      authTabs.forEach(function (t) {
        navHtml += navTab(t.href, t.label, t.active);
      });
      root.innerHTML =
        '<header class="topbar">' +
        '  <div class="topbar-inner">' +
        '    <a href="index.html" class="logo" aria-label="AI Knowledge Hub – Home">' +
        '      <span class="logo-icon" aria-hidden="true">&#x2B22;</span> AI Knowledge Hub' +
        "    </a>" +
        '    <nav class="nav-tabs nav-tabs-auth" aria-label="Main navigation">' +
        navHtml +
        "    </nav>" +
        '    <div class="topbar-actions">' +
        '      <button id="theme-btn" class="icon-btn" aria-label="Toggle theme" aria-pressed="true">' +
        ICON_MOON +
        ICON_SUN +
        "      </button>" +
        "    </div>" +
        "  </div>" +
        "</header>";
      const themeBtn = root.querySelector("#theme-btn");
      if (themeBtn) {
        const t = document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "light";
        themeBtn.setAttribute("aria-pressed", t === "dark");
      }
      return;
    }

    const isSearchPage = searchMode === "always-open";
    const searchBarCls = "search-bar" + (isSearchPage ? " search-bar-always-open open" : "");
    const searchBarAria = isSearchPage ? ' aria-expanded="true"' : ' aria-expanded="false"';
    const searchInnerCls = "search-bar-inner" + (isSearchPage ? " search-bar-inner-with-suggestions" : "");
    const hasSearchForm = !isSearchPage;

    let searchToggleHtml = "";
    if (searchMode === "expandable") {
      searchToggleHtml =
        '<button id="search-toggle" class="icon-btn" aria-label="Toggle search" aria-expanded="false">' +
        ICON_SEARCH +
        "</button>";
    } else if (searchMode === "always-open") {
      searchToggleHtml =
        '<a href="search.html" class="icon-btn" aria-label="Search" aria-current="page">' +
        ICON_SEARCH +
        "</a>";
    }

    const authInYou =
      '<a href="login.html" class="nav-tab" id="nav-login">Log in</a>' +
      '<span class="auth-user-wrap" id="auth-user-wrap" style="display:none">' +
      '<span class="auth-user-email" id="auth-user-email"></span>' +
      '<span class="session-expiry-note" id="session-expiry-note" aria-live="polite"></span>' +
      '<button type="button" class="nav-tab nav-tab-btn" id="nav-logout">Log out</button>' +
      "</span>";

    const browseItems = [
      { href: "tools.html", id: "tools", label: "Tools" },
      { href: "knowledge.html", id: "knowledge", label: "Knowledge" },
      { href: "podcasts.html", id: "podcasts", label: "Podcasts" },
      { href: "youtube.html", id: "youtube", label: "YouTube" },
      { href: "training.html", id: "training", label: "Training" },
    ];
    const discoverItems = [
      { href: "search.html", id: "search", label: "Search" },
      { href: "daily-watch.html", id: "daily-watch", label: "Daily Watch" },
      { href: "bleeding-edge.html", id: "bleeding-edge", label: "Bleeding Edge" },
      { href: "niche.html", id: "niche", label: "Niche AI" },
    ];
    const youItems = [
      { href: "stack.html", id: "stack", label: "My Stack" },
      { href: "about.html", id: "about", label: "About" },
    ];

    function navGroup(label, items, extra) {
      let html = '<div class="nav-group" role="group" aria-label="' + label + '">';
      html += '<span class="nav-group-label">' + label + "</span>";
      items.forEach(function (item) {
        html += navTab(item.href, item.label, activeNav === item.id, item.idAttr || null);
      });
      if (extra) html += extra;
      html += "</div>";
      return html;
    }

    const navHtml =
      navGroup(
        "Browse",
        browseItems
      ) +
      navGroup(
        "Discover",
        discoverItems
      ) +
      navGroup("You", youItems, authInYou);

    let searchInputHtml = "";
    if (hasSearchForm) {
      searchInputHtml =
        '<form id="search-form" action="search.html" method="get" style="display:contents">' +
        '<input type="search" id="search" name="q" placeholder="' +
        searchPlaceholder.replace(/"/g, "&quot;") +
        '" aria-label="Search">' +
        "</form>";
    } else {
      searchInputHtml =
        '<input type="search" id="search" placeholder="' +
        searchPlaceholder.replace(/"/g, "&quot;") +
        '" aria-label="Search all categories">';
    }

    root.innerHTML =
      '<header class="topbar">' +
      "  <div class=\"topbar-inner\">" +
      '    <a href="index.html" class="logo" aria-label="AI Knowledge Hub – Home">' +
      '      <span class="logo-icon" aria-hidden="true">&#x2B22;</span> AI Knowledge Hub' +
      "    </a>" +
      '    <nav class="nav-tabs" aria-label="Main navigation">' +
      navHtml +
      "    </nav>" +
      '    <div class="topbar-actions">' +
      '      <div class="profile-switcher" id="profile-switcher"></div>' +
      '      <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">' +
      '        <span class="nav-toggle-bar"></span>' +
      '        <span class="nav-toggle-bar"></span>' +
      '        <span class="nav-toggle-bar"></span>' +
      "      </button>" +
      searchToggleHtml +
      '      <button id="theme-btn" class="icon-btn" aria-label="Toggle theme" aria-pressed="true">' +
      ICON_MOON +
      ICON_SUN +
      "      </button>" +
      "    </div>" +
      "  </div>" +
      '  <div class="' +
      searchBarCls +
      '" id="search-bar"' +
      searchBarAria +
      ">" +
      '    <div class="' +
      searchInnerCls +
      '">' +
      ICON_SEARCH_SM +
      searchInputHtml +
      '<span id="search-results" class="search-results" aria-live="polite"></span>' +
      "    </div>" +
      "  </div>" +
      "</header>";
  }

  window.Header = { render: render };
})();
