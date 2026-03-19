/**
 * AI Knowledge Hub — Personal Notes / Annotations
 * Adds per-card personal notes with inline expandable textarea.
 * Depends: toast.js (optional), profiles.js (optional, falls back to localStorage)
 * Extends: SearchUtils.matchCard (if available) to include note text in search
 */
(function () {
  "use strict";

  var MAX_LENGTH = 500;
  var SAVE_DEBOUNCE_MS = 400;
  var NOTE_ICON_SVG =
    '<svg class="notes-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
    '<polyline points="14 2 14 8 20 8"/>' +
    '<line x1="16" y1="13" x2="8" y2="13"/>' +
    '<line x1="16" y1="17" x2="8" y2="17"/>' +
    '<polyline points="10 9 9 9 8 9"/>' +
    "</svg>";
  var NOTE_INDICATOR_SVG =
    '<svg class="notes-indicator-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
    "</svg>";

  /* ── Storage helpers ── */

  function getNote(title) {
    if (window.ProfileStore && typeof window.ProfileStore.getNote === "function") {
      return window.ProfileStore.getNote(title) || "";
    }
    return localStorage.getItem("note:" + title) || "";
  }

  function setNote(title, text) {
    var value = (text || "").slice(0, MAX_LENGTH);
    if (window.ProfileStore && typeof window.ProfileStore.setNote === "function") {
      window.ProfileStore.setNote(title, value);
    } else {
      if (value) {
        localStorage.setItem("note:" + title, value);
      } else {
        localStorage.removeItem("note:" + title);
      }
    }
  }

  /* ── Inject CSS ── */

  function injectStyles() {
    if (document.getElementById("notes-styles")) return;
    var style = document.createElement("style");
    style.id = "notes-styles";
    style.textContent =
      /* Note button in card-actions */
      ".note-btn{" +
        "display:inline-flex;align-items:center;gap:4px;" +
        "padding:4px 10px;border:1px solid rgba(255,255,255,.15);" +
        "border-radius:6px;background:transparent;color:inherit;" +
        "font-size:.8rem;cursor:pointer;transition:background .15s,border-color .15s;" +
      "}" +
      ".note-btn:hover,.note-btn:focus-visible{" +
        "background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.3);outline:none;" +
      "}" +
      ".note-btn .notes-icon{width:14px;height:14px;flex-shrink:0;}" +
      ".note-btn.has-note{color:#58a6ff;border-color:rgba(88,166,255,.35);}" +

      /* Note indicator on card-cover */
      ".note-indicator{" +
        "position:absolute;top:8px;right:8px;width:18px;height:18px;" +
        "color:rgba(255,255,255,.85);filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));" +
        "pointer-events:none;z-index:2;" +
      "}" +
      ".note-indicator .notes-indicator-icon{width:100%;height:100%;}" +

      /* Expandable note area */
      ".note-area-wrapper{" +
        "max-height:0;overflow:hidden;" +
        "transition:max-height .3s ease,opacity .3s ease;opacity:0;" +
      "}" +
      ".note-area-wrapper.expanded{max-height:260px;opacity:1;}" +
      ".note-area{" +
        "padding:8px 12px 6px;border-top:1px solid rgba(255,255,255,.08);" +
      "}" +
      ".note-area textarea{" +
        "width:100%;min-height:70px;max-height:140px;resize:vertical;" +
        "background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);" +
        "border-radius:6px;color:inherit;font:inherit;font-size:.85rem;" +
        "padding:8px;box-sizing:border-box;line-height:1.4;" +
        "transition:border-color .15s;" +
      "}" +
      ".note-area textarea:focus{border-color:rgba(88,166,255,.5);outline:none;}" +
      ".note-area-footer{" +
        "display:flex;align-items:center;justify-content:space-between;" +
        "margin-top:4px;font-size:.75rem;color:rgba(255,255,255,.45);" +
      "}" +
      ".note-char-count{}" +
      ".note-char-count.over-limit{color:#f85149;}" +
      ".note-clear-btn{" +
        "background:none;border:none;color:rgba(255,255,255,.45);" +
        "font-size:.75rem;cursor:pointer;padding:2px 4px;border-radius:4px;" +
        "transition:color .15s,background .15s;" +
      "}" +
      ".note-clear-btn:hover,.note-clear-btn:focus-visible{" +
        "color:#f85149;background:rgba(248,81,73,.1);outline:none;" +
      "}";
    document.head.appendChild(style);
  }

  /* ── Debounce helper ── */

  function debounce(fn, ms) {
    var timer;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, ms);
    };
  }

  /* ── Card injection ── */

  function getTitleFromCard(card) {
    return card.dataset.title || "";
  }

  function updateIndicator(card, title) {
    var cover = card.querySelector(".card-cover");
    if (!cover) return;
    var existing = cover.querySelector(".note-indicator");
    var hasNote = !!getNote(title);
    if (hasNote && !existing) {
      var ind = document.createElement("span");
      ind.className = "note-indicator";
      ind.title = "Has a personal note";
      ind.innerHTML = NOTE_INDICATOR_SVG;
      /* card-cover is position:relative in existing styles */
      cover.appendChild(ind);
    } else if (!hasNote && existing) {
      existing.remove();
    }
  }

  function updateNoteButton(btn, title) {
    var hasNote = !!getNote(title);
    btn.classList.toggle("has-note", hasNote);
    btn.setAttribute("aria-label", hasNote ? "Edit note for " + title : "Add note for " + title);
  }

  function buildNoteArea(card, title) {
    var wrapper = document.createElement("div");
    wrapper.className = "note-area-wrapper";
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "Personal note for " + title);

    var area = document.createElement("div");
    area.className = "note-area";

    var textarea = document.createElement("textarea");
    textarea.setAttribute("maxlength", String(MAX_LENGTH));
    textarea.setAttribute("placeholder", "Add a personal note\u2026");
    textarea.setAttribute("aria-label", "Note for " + title);
    textarea.value = getNote(title);

    var footer = document.createElement("div");
    footer.className = "note-area-footer";

    var charCount = document.createElement("span");
    charCount.className = "note-char-count";
    charCount.textContent = textarea.value.length + "/" + MAX_LENGTH;

    var clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "note-clear-btn";
    clearBtn.textContent = "Clear note";
    clearBtn.setAttribute("aria-label", "Clear note for " + title);
    clearBtn.style.display = textarea.value ? "" : "none";

    footer.appendChild(charCount);
    footer.appendChild(clearBtn);
    area.appendChild(textarea);
    area.appendChild(footer);
    wrapper.appendChild(area);

    /* Save logic */
    var noteBtn = card.querySelector(".note-btn");

    function saveNote() {
      var val = textarea.value.slice(0, MAX_LENGTH);
      setNote(title, val);
      updateIndicator(card, title);
      if (noteBtn) updateNoteButton(noteBtn, title);
      clearBtn.style.display = val ? "" : "none";
      if (typeof window.showToast === "function") {
        window.showToast("Note saved");
      }
    }

    var debouncedSave = debounce(saveNote, SAVE_DEBOUNCE_MS);

    textarea.addEventListener("input", function () {
      var len = textarea.value.length;
      charCount.textContent = len + "/" + MAX_LENGTH;
      charCount.classList.toggle("over-limit", len >= MAX_LENGTH);
      debouncedSave();
    });

    textarea.addEventListener("blur", function () {
      /* Immediate save on blur to ensure nothing is lost */
      var currentVal = textarea.value.slice(0, MAX_LENGTH);
      var storedVal = getNote(title);
      if (currentVal !== storedVal) {
        saveNote();
      }
    });

    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        collapseNoteArea(card);
        if (noteBtn) noteBtn.focus();
      }
    });

    clearBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      textarea.value = "";
      charCount.textContent = "0/" + MAX_LENGTH;
      charCount.classList.remove("over-limit");
      setNote(title, "");
      updateIndicator(card, title);
      if (noteBtn) updateNoteButton(noteBtn, title);
      clearBtn.style.display = "none";
      if (typeof window.showToast === "function") {
        window.showToast("Note saved");
      }
      textarea.focus();
    });

    clearBtn.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        collapseNoteArea(card);
        if (noteBtn) noteBtn.focus();
      }
    });

    return wrapper;
  }

  function collapseNoteArea(card) {
    var wrapper = card.querySelector(".note-area-wrapper");
    var btn = card.querySelector(".note-btn");
    if (wrapper) {
      wrapper.classList.remove("expanded");
    }
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
    }
  }

  function toggleNoteArea(card, title) {
    var btn = card.querySelector(".note-btn");
    var existing = card.querySelector(".note-area-wrapper");

    if (existing) {
      var isExpanded = existing.classList.contains("expanded");
      if (isExpanded) {
        collapseNoteArea(card);
      } else {
        existing.classList.add("expanded");
        if (btn) btn.setAttribute("aria-expanded", "true");
        var ta = existing.querySelector("textarea");
        if (ta) ta.focus();
      }
      return;
    }

    /* First time — create the note area */
    var wrapper = buildNoteArea(card, title);
    var body = card.querySelector(".card-body");
    if (body) {
      body.appendChild(wrapper);
    } else {
      card.appendChild(wrapper);
    }

    /* Trigger expand on next frame for animation */
    requestAnimationFrame(function () {
      wrapper.classList.add("expanded");
      if (btn) btn.setAttribute("aria-expanded", "true");
      var ta = wrapper.querySelector("textarea");
      if (ta) ta.focus();
    });
  }

  function injectNoteButton(card) {
    if (card.querySelector(".note-btn")) return;

    var title = getTitleFromCard(card);
    if (!title) return;

    var actions = card.querySelector(".card-actions");
    if (!actions) return;

    /* Create note button */
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "note-btn";
    btn.innerHTML = NOTE_ICON_SVG + " Note";
    btn.setAttribute("aria-expanded", "false");
    updateNoteButton(btn, title);

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleNoteArea(card, title);
    });

    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        toggleNoteArea(card, title);
      } else if (e.key === "Escape") {
        collapseNoteArea(card);
      }
    });

    /* Insert before share button if present, otherwise append */
    var shareBtn = actions.querySelector(".share-btn");
    if (shareBtn) {
      actions.insertBefore(btn, shareBtn);
    } else {
      actions.appendChild(btn);
    }

    /* Indicator on cover */
    updateIndicator(card, title);
  }

  function injectAll(root) {
    var container = root || document;
    var cards = container.querySelectorAll(".card");
    for (var i = 0; i < cards.length; i++) {
      injectNoteButton(cards[i]);
    }
  }

  /* ── MutationObserver for dynamic cards ── */

  function startObserver() {
    if (typeof MutationObserver === "undefined") return;

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains("card")) {
            injectNoteButton(node);
          }
          if (node.querySelectorAll) {
            var nested = node.querySelectorAll(".card");
            for (var k = 0; k < nested.length; k++) {
              injectNoteButton(nested[k]);
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ── Extend SearchUtils.matchCard ── */

  function extendSearch() {
    if (!window.SearchUtils || typeof window.SearchUtils.matchCard !== "function") return;

    var originalMatchCard = window.SearchUtils.matchCard;

    window.SearchUtils.matchCard = function (query, card) {
      if (originalMatchCard(query, card)) return true;

      /* Also check note text */
      var title = card.dataset.title || "";
      var note = getNote(title);
      if (!note) return false;

      var q = (query || "").toLowerCase().trim();
      if (!q) return true;

      var terms = q.split(/\s+/).filter(function (t) { return t.length > 0; });
      if (terms.length === 0) return true;

      var noteLower = note.toLowerCase();
      return terms.every(function (term) {
        return noteLower.indexOf(term) !== -1;
      });
    };
  }

  /* ── Init ── */

  function init() {
    injectStyles();
    injectAll();
    startObserver();
    extendSearch();
  }

  /* Run on DOMContentLoaded or immediately if already loaded */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Re-inject after profile changes */
  window.addEventListener("profile-changed", function () {
    var cards = document.querySelectorAll(".card");
    for (var i = 0; i < cards.length; i++) {
      var title = getTitleFromCard(cards[i]);
      if (!title) continue;
      updateIndicator(cards[i], title);
      var btn = cards[i].querySelector(".note-btn");
      if (btn) updateNoteButton(btn, title);
      /* Update textarea content if open */
      var ta = cards[i].querySelector(".note-area textarea");
      if (ta) ta.value = getNote(title);
    }
  });

  /* ── Public API ── */

  window.Notes = {
    getNote: getNote,
    setNote: setNote,
    init: init,
  };
})();
