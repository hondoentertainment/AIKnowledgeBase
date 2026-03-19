/**
 * AI Knowledge Hub — Activity Feed / Timeline
 * Tracks user actions (ratings, stack changes, direct use, want-to-try,
 * searches, achievements) and renders a timeline UI.
 * Depends: profiles.js (optional, scopes feed to active profile)
 */
(function () {
  /* ── constants ─────────────────────────────────────────────── */
  var STORAGE_KEY = "activityFeed";
  var MAX_ENTRIES = 100;

  var ICONS = {
    rated:        "\u2B50",
    stack_add:    "\uD83D\uDCDA",
    stack_remove: "\u2715",
    direct_use:   "\u2713",
    want_to_try:  "\uD83D\uDD16",
    search:       "\uD83D\uDD0D",
    achievement:  "\uD83C\uDFC6"
  };

  /* ── helpers ───────────────────────────────────────────────── */
  function storageKey() {
    if (window.ProfileStore && typeof window.ProfileStore.getActiveProfileId === "function") {
      var id = window.ProfileStore.getActiveProfileId();
      if (id) return STORAGE_KEY + "_" + id;
    }
    return STORAGE_KEY;
  }

  function loadFeed() {
    try {
      var raw = localStorage.getItem(storageKey());
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveFeed(feed) {
    localStorage.setItem(storageKey(), JSON.stringify(feed));
  }

  /* ── relative-time formatter ───────────────────────────────── */
  function relativeTime(ts) {
    var now = Date.now();
    var diff = now - ts;
    if (diff < 0) diff = 0;

    var seconds = Math.floor(diff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours   = Math.floor(minutes / 60);
    var days    = Math.floor(hours / 24);

    if (seconds < 60)  return "just now";
    if (minutes === 1)  return "1 minute ago";
    if (minutes < 60)   return minutes + " minutes ago";
    if (hours === 1)    return "1 hour ago";
    if (hours < 24)     return hours + " hours ago";
    if (days === 1)     return "yesterday";
    return days + " days ago";
  }

  /* ── event-text builder ────────────────────────────────────── */
  function eventText(evt) {
    var t = evt.title || "";
    var strong = "<strong>" + escapeHtml(t) + "</strong>";
    switch (evt.type) {
      case "rated":
        return "Rated " + strong + " " + (evt.value || 0) + " stars";
      case "stack_add":
        return "Added " + strong + " to stack";
      case "stack_remove":
        return "Removed " + strong + " from stack";
      case "direct_use":
        return "Marked " + strong + " as &ldquo;I use this&rdquo;";
      case "want_to_try":
        return "Flagged " + strong + " as &ldquo;want to try&rdquo;";
      case "search":
        return "Searched for " + strong;
      case "achievement":
        return "Unlocked achievement " + strong;
      default:
        return strong;
    }
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── public API ────────────────────────────────────────────── */

  /**
   * log(type, data)
   * @param {string} type  — one of the ICONS keys
   * @param {object} data  — { title, value? }
   */
  function log(type, data) {
    data = data || {};
    var entry = {
      type: type,
      title: data.title || "",
      timestamp: Date.now()
    };
    if (data.value !== undefined) entry.value = data.value;

    var feed = loadFeed();
    feed.push(entry);
    // FIFO: keep only the last MAX_ENTRIES
    if (feed.length > MAX_ENTRIES) {
      feed = feed.slice(feed.length - MAX_ENTRIES);
    }
    saveFeed(feed);
  }

  /**
   * getRecent(count) — returns the last N events, newest first.
   */
  function getRecent(count) {
    var feed = loadFeed();
    count = count || 20;
    return feed.slice(-count).reverse();
  }

  /**
   * clear() — removes all events for the current profile / global scope.
   */
  function clear() {
    localStorage.removeItem(storageKey());
  }

  /**
   * render(containerId) — builds timeline HTML inside the given element.
   */
  function render(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var events = getRecent(100);
    if (events.length === 0) {
      container.innerHTML = '<div class="af-timeline"><p class="af-empty">No activity yet.</p></div>';
      return;
    }

    var html = '<div class="af-timeline">';
    for (var i = 0; i < events.length; i++) {
      var evt = events[i];
      var icon = ICONS[evt.type] || "";
      html += '<div class="af-event">' +
        '<span class="af-event-icon">' + icon + '</span>' +
        '<div class="af-event-body">' +
          '<span class="af-event-text">' + eventText(evt) + '</span>' +
          '<span class="af-event-time">' + relativeTime(evt.timestamp) + '</span>' +
        '</div>' +
      '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  /* ── auto-hook: monkey-patch localStorage.setItem ──────────── */
  var _origSetItem = localStorage.setItem.bind(localStorage);
  var _suppressed = false;

  localStorage.setItem = function (key, value) {
    _origSetItem(key, value);

    // Don't re-enter when we write the feed itself
    if (_suppressed) return;
    _suppressed = true;

    try {
      detectChange(key, value);
    } catch (_) { /* swallow */ }

    _suppressed = false;
  };

  /**
   * Detect card-builder interactions by inspecting the key being written.
   */
  function detectChange(key, value) {
    // Rating — keys like "rating:ChatGPT"
    if (key.indexOf("rating:") === 0) {
      var title = key.substring(7);
      var stars = parseFloat(value);
      if (stars > 0) {
        log("rated", { title: title, value: stars });
      }
      return;
    }

    // Stack
    if (key === "myStack") {
      diffArray("myStack", value, "stack_add", "stack_remove");
      return;
    }

    // Direct use
    if (key === "directUse") {
      diffArray("directUse", value, "direct_use", "direct_use");
      return;
    }

    // Want to try
    if (key === "wantToTry") {
      diffArray("wantToTry", value, "want_to_try", "want_to_try");
      return;
    }

    // ProfileStore bulk data — detect changes in profileData
    if (key === "profileData") {
      // handled at the ProfileStore level; too noisy to diff here
      return;
    }
  }

  /* Keep snapshots to diff arrays and detect adds / removes */
  var _snapshots = {};

  function diffArray(key, newValRaw, addType, removeType) {
    var prev = _snapshots[key] || [];
    var next;
    try { next = JSON.parse(newValRaw); } catch (_) { next = []; }
    if (!Array.isArray(next)) next = [];

    // detect additions
    for (var i = 0; i < next.length; i++) {
      if (prev.indexOf(next[i]) === -1) {
        log(addType, { title: next[i] });
      }
    }
    // detect removals
    for (var j = 0; j < prev.length; j++) {
      if (next.indexOf(prev[j]) === -1) {
        log(removeType, { title: prev[j] });
      }
    }

    _snapshots[key] = next.slice();
  }

  /* Initialise snapshots from current localStorage state */
  function initSnapshots() {
    ["myStack", "directUse", "wantToTry"].forEach(function (key) {
      try {
        var raw = localStorage.getItem(key);
        _snapshots[key] = raw ? JSON.parse(raw) : [];
      } catch (_) {
        _snapshots[key] = [];
      }
    });
  }

  initSnapshots();

  /* ── listen for profile switches ───────────────────────────── */
  window.addEventListener("profile-changed", function () {
    // Re-initialise snapshots for the new profile context
    initSnapshots();
  });

  /* ── expose ────────────────────────────────────────────────── */
  window.ActivityFeed = {
    log: log,
    getRecent: getRecent,
    clear: clear,
    render: render
  };
})();
