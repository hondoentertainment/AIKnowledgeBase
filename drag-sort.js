/**
 * Drag & Drop Reordering for My Stack
 * Allows users to reorder stack cards via native HTML5 drag-and-drop and touch events.
 * Persists order to localStorage and ProfileStore.
 */
(function () {
  "use strict";

  /* ========== Constants ========== */
  var STORAGE_KEY = "stackOrder";
  var CARD_SEL = ".stack-card";
  var GRID_SEL = ".stack-grid";
  var DRAG_CLASS = "ds-dragging";
  var OVER_CLASS = "ds-drag-over";
  var INDICATOR_CLASS = "ds-drop-indicator";
  var TRANSITION_MS = 200;

  /* ========== State ========== */
  var draggedEl = null;
  var touchClone = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var touchCurrentGrid = null;
  var indicator = null;
  var initialized = false;
  var observer = null;

  /* ========== Styles ========== */
  function injectStyles() {
    if (document.getElementById("ds-styles")) return;
    var style = document.createElement("style");
    style.id = "ds-styles";
    style.textContent = [
      "." + DRAG_CLASS + " {",
      "  opacity: 0.5;",
      "  transform: scale(0.97);",
      "  transition: opacity " + TRANSITION_MS + "ms ease, transform " + TRANSITION_MS + "ms ease;",
      "}",
      "." + INDICATOR_CLASS + " {",
      "  position: absolute;",
      "  width: 3px;",
      "  background: #3b82f6;",
      "  border-radius: 2px;",
      "  pointer-events: none;",
      "  z-index: 1000;",
      "  transition: top " + (TRANSITION_MS / 2) + "ms ease, left " + (TRANSITION_MS / 2) + "ms ease, height " + (TRANSITION_MS / 2) + "ms ease;",
      "  box-shadow: 0 0 6px rgba(59,130,246,0.5);",
      "}",
      ".ds-touch-clone {",
      "  position: fixed;",
      "  pointer-events: none;",
      "  z-index: 10000;",
      "  opacity: 0.85;",
      "  transform: scale(1.04) rotate(1deg);",
      "  box-shadow: 0 12px 32px rgba(0,0,0,0.18);",
      "  border-radius: 12px;",
      "  transition: transform 80ms ease;",
      "}",
      GRID_SEL + " {",
      "  position: relative;",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  /* ========== Indicator ========== */
  function getIndicator() {
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = INDICATOR_CLASS;
      indicator.setAttribute("aria-hidden", "true");
    }
    return indicator;
  }

  function showIndicator(grid, refCard, before) {
    var ind = getIndicator();
    if (!grid.contains(ind)) grid.appendChild(ind);

    var gridRect = grid.getBoundingClientRect();
    var cardRect = refCard.getBoundingClientRect();
    var top = cardRect.top - gridRect.top;
    var height = cardRect.height;
    var left;

    if (before) {
      left = cardRect.left - gridRect.left - 4;
    } else {
      left = cardRect.right - gridRect.left + 1;
    }

    ind.style.top = top + "px";
    ind.style.left = left + "px";
    ind.style.height = height + "px";
    ind.style.display = "block";
  }

  function hideIndicator() {
    if (indicator) indicator.style.display = "none";
  }

  /* ========== Helpers ========== */
  function getCardTitle(card) {
    return card ? (card.getAttribute("data-title") || "") : "";
  }

  function getGridCards(grid) {
    return grid ? Array.prototype.slice.call(grid.querySelectorAll(CARD_SEL)) : [];
  }

  function closestCard(el) {
    while (el && el !== document) {
      if (el.matches && el.matches(CARD_SEL)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function closestGrid(el) {
    while (el && el !== document) {
      if (el.matches && el.matches(GRID_SEL)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function getInsertPosition(grid, clientX, clientY) {
    var cards = getGridCards(grid);
    if (!cards.length) return { ref: null, before: true };

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card === draggedEl) continue;
      var rect = card.getBoundingClientRect();
      var midX = rect.left + rect.width / 2;
      var midY = rect.top + rect.height / 2;

      if (clientY < rect.bottom && clientY > rect.top) {
        if (clientX < midX) return { ref: card, before: true };
        if (clientX >= midX) return { ref: card, before: false };
      }
    }

    /* Default: place after last card */
    var last = cards[cards.length - 1];
    if (last === draggedEl && cards.length > 1) last = cards[cards.length - 2];
    return { ref: last || null, before: false };
  }

  /* ========== Persistence ========== */
  function saveOrder() {
    var allGrids = document.querySelectorAll(GRID_SEL);
    var titles = [];
    allGrids.forEach(function (grid) {
      getGridCards(grid).forEach(function (card) {
        var t = getCardTitle(card);
        if (t) titles.push(t);
      });
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
    } catch (_) { /* quota exceeded */ }

    if (window.ProfileStore && typeof window.ProfileStore.setStack === "function") {
      window.ProfileStore.setStack(titles);
    }
  }

  function loadOrder() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function applyOrder() {
    var order = loadOrder();
    if (!order || !order.length) return;

    var grids = document.querySelectorAll(GRID_SEL);
    grids.forEach(function (grid) {
      var cards = getGridCards(grid);
      if (!cards.length) return;

      var titleToCard = {};
      cards.forEach(function (c) {
        titleToCard[getCardTitle(c)] = c;
      });

      /* Build ordered list for this grid */
      var ordered = [];
      var seen = {};
      order.forEach(function (title) {
        if (titleToCard[title] && !seen[title]) {
          ordered.push(titleToCard[title]);
          seen[title] = true;
        }
      });

      /* Append any cards not in the saved order */
      cards.forEach(function (c) {
        var t = getCardTitle(c);
        if (!seen[t]) ordered.push(c);
      });

      /* Only reorder if something changed */
      var changed = false;
      for (var i = 0; i < ordered.length; i++) {
        if (ordered[i] !== cards[i]) { changed = true; break; }
      }
      if (changed) {
        ordered.forEach(function (c) { grid.appendChild(c); });
      }
    });
  }

  /* ========== Accessibility ========== */
  function setAriaGrabbed(card, grabbed) {
    card.setAttribute("aria-grabbed", grabbed ? "true" : "false");
  }

  function setGridDropEffect(grid, effect) {
    if (grid) grid.setAttribute("aria-dropeffect", effect);
  }

  function setupAria(card) {
    card.setAttribute("draggable", "true");
    card.setAttribute("role", "listitem");
    setAriaGrabbed(card, false);
  }

  function setupGridAria(grid) {
    grid.setAttribute("role", "list");
    grid.setAttribute("aria-dropeffect", "move");
  }

  /* ========== HTML5 Drag & Drop ========== */
  function onDragStart(e) {
    var card = closestCard(e.target);
    if (!card) return;

    draggedEl = card;
    card.classList.add(DRAG_CLASS);
    setAriaGrabbed(card, true);

    var grid = closestGrid(card);
    if (grid) setGridDropEffect(grid, "move");

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", getCardTitle(card));

    /* Use a timeout so the browser captures the element before applying styles */
    setTimeout(function () {
      if (draggedEl) draggedEl.classList.add(DRAG_CLASS);
    }, 0);
  }

  function onDragOver(e) {
    if (!draggedEl) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    var grid = closestGrid(e.target);
    if (!grid) { hideIndicator(); return; }

    var pos = getInsertPosition(grid, e.clientX, e.clientY);
    if (pos.ref) {
      showIndicator(grid, pos.ref, pos.before);
    } else {
      hideIndicator();
    }
  }

  function onDragEnter(e) {
    if (!draggedEl) return;
    e.preventDefault();
  }

  function onDragLeave(e) {
    var grid = closestGrid(e.target);
    var related = closestGrid(e.relatedTarget);
    if (grid && grid !== related) {
      hideIndicator();
    }
  }

  function onDrop(e) {
    if (!draggedEl) return;
    e.preventDefault();
    hideIndicator();

    var grid = closestGrid(e.target);
    if (!grid) return;

    var srcGrid = closestGrid(draggedEl);
    if (grid !== srcGrid) return; /* Only allow reorder within the same grid */

    var pos = getInsertPosition(grid, e.clientX, e.clientY);
    moveDraggedTo(grid, pos);
  }

  function onDragEnd() {
    if (draggedEl) {
      draggedEl.classList.remove(DRAG_CLASS);
      setAriaGrabbed(draggedEl, false);
      var grid = closestGrid(draggedEl);
      if (grid) setGridDropEffect(grid, "move");
    }
    draggedEl = null;
    hideIndicator();
  }

  function moveDraggedTo(grid, pos) {
    if (!draggedEl || !grid) return;

    if (pos.ref && pos.ref !== draggedEl) {
      if (pos.before) {
        grid.insertBefore(draggedEl, pos.ref);
      } else {
        var next = pos.ref.nextElementSibling;
        if (next) {
          grid.insertBefore(draggedEl, next);
        } else {
          grid.appendChild(draggedEl);
        }
      }
    } else if (!pos.ref) {
      grid.appendChild(draggedEl);
    }

    saveOrder();
  }

  /* ========== Touch Support ========== */
  function onTouchStart(e) {
    var card = closestCard(e.target);
    if (!card) return;

    /* Ignore touches on buttons/links */
    var tag = e.target.tagName;
    if (tag === "BUTTON" || tag === "A" || e.target.closest("button") || e.target.closest("a")) return;

    var touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    /* Delay to distinguish scroll from drag */
    card._dsLongPressTimer = setTimeout(function () {
      beginTouchDrag(card, touch);
    }, 300);

    card._dsMoveCancelled = false;
  }

  function beginTouchDrag(card, touch) {
    draggedEl = card;
    card.classList.add(DRAG_CLASS);
    setAriaGrabbed(card, true);

    touchCurrentGrid = closestGrid(card);
    if (touchCurrentGrid) setGridDropEffect(touchCurrentGrid, "move");

    /* Create a visual clone */
    var rect = card.getBoundingClientRect();
    touchClone = card.cloneNode(true);
    touchClone.className = card.className + " ds-touch-clone";
    touchClone.classList.remove(DRAG_CLASS);
    touchClone.style.width = rect.width + "px";
    touchClone.style.height = rect.height + "px";
    touchClone.style.left = rect.left + "px";
    touchClone.style.top = rect.top + "px";
    document.body.appendChild(touchClone);

    /* Haptic feedback if available */
    if (navigator.vibrate) navigator.vibrate(10);
  }

  function onTouchMove(e) {
    var card = closestCard(e.target);

    /* If we haven't started dragging yet, check if we should cancel the long press */
    if (!draggedEl && card && card._dsLongPressTimer) {
      var touch = e.touches[0];
      var dx = Math.abs(touch.clientX - touchStartX);
      var dy = Math.abs(touch.clientY - touchStartY);
      if (dx > 10 || dy > 10) {
        clearTimeout(card._dsLongPressTimer);
        card._dsLongPressTimer = null;
        card._dsMoveCancelled = true;
        return;
      }
    }

    if (!draggedEl || !touchClone) return;
    e.preventDefault();

    var touch = e.touches[0];

    /* Move clone */
    var rect = draggedEl.getBoundingClientRect();
    touchClone.style.left = (touch.clientX - rect.width / 2) + "px";
    touchClone.style.top = (touch.clientY - rect.height / 2) + "px";

    /* Find grid under touch point */
    touchClone.style.display = "none";
    var elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    touchClone.style.display = "";

    var grid = elBelow ? closestGrid(elBelow) : null;
    if (!grid || grid !== touchCurrentGrid) {
      hideIndicator();
      return;
    }

    var pos = getInsertPosition(grid, touch.clientX, touch.clientY);
    if (pos.ref) {
      showIndicator(grid, pos.ref, pos.before);
    } else {
      hideIndicator();
    }
  }

  function onTouchEnd(e) {
    var card = closestCard(e.target);
    if (card && card._dsLongPressTimer) {
      clearTimeout(card._dsLongPressTimer);
      card._dsLongPressTimer = null;
    }

    if (!draggedEl) return;

    hideIndicator();

    if (touchClone) {
      /* Find final position */
      var cloneRect = touchClone.getBoundingClientRect();
      var cx = cloneRect.left + cloneRect.width / 2;
      var cy = cloneRect.top + cloneRect.height / 2;

      touchClone.remove();
      touchClone = null;

      var elBelow = document.elementFromPoint(cx, cy);
      var grid = elBelow ? closestGrid(elBelow) : touchCurrentGrid;
      if (grid && grid === touchCurrentGrid) {
        var pos = getInsertPosition(grid, cx, cy);
        moveDraggedTo(grid, pos);
      }
    }

    draggedEl.classList.remove(DRAG_CLASS);
    setAriaGrabbed(draggedEl, false);
    draggedEl = null;
    touchCurrentGrid = null;
  }

  /* ========== Bind Events ========== */
  function bindCard(card) {
    if (card._dsBound) return;
    card._dsBound = true;

    setupAria(card);

    /* HTML5 drag */
    card.addEventListener("dragstart", onDragStart);

    /* Touch */
    card.addEventListener("touchstart", onTouchStart, { passive: true });
  }

  function bindGrid(grid) {
    if (grid._dsBound) return;
    grid._dsBound = true;

    setupGridAria(grid);

    grid.addEventListener("dragover", onDragOver);
    grid.addEventListener("dragenter", onDragEnter);
    grid.addEventListener("dragleave", onDragLeave);
    grid.addEventListener("drop", onDrop);
    grid.addEventListener("dragend", onDragEnd);

    /* Touch on grid level */
    grid.addEventListener("touchmove", onTouchMove, { passive: false });
    grid.addEventListener("touchend", onTouchEnd);
    grid.addEventListener("touchcancel", onTouchEnd);
  }

  function bindAll() {
    var grids = document.querySelectorAll(GRID_SEL);
    grids.forEach(function (grid) {
      bindGrid(grid);
      getGridCards(grid).forEach(bindCard);
    });
  }

  /* ========== MutationObserver ========== */
  function startObserver() {
    if (observer) return;
    if (!window.MutationObserver) return;

    observer = new MutationObserver(function (mutations) {
      var needsBind = false;
      mutations.forEach(function (m) {
        if (m.type === "childList" && m.addedNodes.length) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              if (node.matches && node.matches(CARD_SEL)) {
                bindCard(node);
                needsBind = true;
              }
              if (node.matches && node.matches(GRID_SEL)) {
                bindGrid(node);
                needsBind = true;
              }
              /* Check children */
              var cards = node.querySelectorAll ? node.querySelectorAll(CARD_SEL) : [];
              cards.forEach(function (c) { bindCard(c); needsBind = true; });
            }
          });
        }
      });
      if (needsBind) applyOrder();
    });

    var target = document.querySelector("main") || document.body;
    observer.observe(target, { childList: true, subtree: true });
  }

  /* ========== Init ========== */
  function init() {
    injectStyles();
    bindAll();
    applyOrder();
    startObserver();
    initialized = true;
  }

  /* Wait for DOM ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      /* Delay slightly to allow stack.js to render first */
      setTimeout(init, 50);
    });
  } else {
    setTimeout(init, 50);
  }

  /* Re-init on profile changes in case cards are re-rendered */
  window.addEventListener("profile-changed", function () {
    setTimeout(function () {
      bindAll();
      applyOrder();
    }, 100);
  });

  /* ========== Public API ========== */
  window.DragSort = {
    init: function () {
      bindAll();
      applyOrder();
      if (!observer) startObserver();
    }
  };
})();
