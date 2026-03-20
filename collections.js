/**
 * AI Knowledge Hub — Curated Collections
 * Renders themed collections of AI tools and resources
 */

(function () {
  "use strict";

  var COLLECTIONS = [
    {
      id: "getting-started",
      title: "Getting Started with AI",
      desc: "Essential tools for AI beginners",
      icon: "\uD83D\uDE80",
      color: ["#6366f1", "#8b5cf6"],
      items: ["ChatGPT", "Claude", "Perplexity", "Gemini", "Microsoft Copilot", "NotebookLM"]
    },
    {
      id: "content-creator",
      title: "Content Creator Toolkit",
      desc: "Writing, image, and video AI tools for creators",
      icon: "\uD83C\uDFA8",
      color: ["#ec4899", "#f43f5e"],
      items: ["Jasper", "Copy.ai", "Midjourney", "DALL-E 3", "Runway", "Sora", "Descript", "Canva Magic Studio"]
    },
    {
      id: "developer-tools",
      title: "Developer Power Tools",
      desc: "Coding assistants and dev tools to supercharge your workflow",
      icon: "\uD83D\uDCBB",
      color: ["#10b981", "#059669"],
      items: ["Cursor", "GitHub Copilot", "Claude Code", "Replit", "Codeium", "Windsurf", "v0 by Vercel", "Bolt.new"]
    },
    {
      id: "research-learning",
      title: "Research & Learning",
      desc: "Knowledge resources and training for leveling up",
      icon: "\uD83D\uDCDA",
      color: ["#3b82f6", "#2563eb"],
      items: ["Perplexity", "Consensus", "Semantic Scholar", "Elicit", "NotebookLM Plus", "Khanmigo"]
    },
    {
      id: "podcast-essentials",
      title: "Podcast Essentials",
      desc: "Top AI podcasts to follow and stay informed",
      icon: "\uD83C\uDFA7",
      color: ["#8b5cf6", "#7c3aed"],
      items: ["Lex Fridman Podcast", "Latent Space", "Hard Fork", "No Priors", "AI for Humans", "Last Week in AI"]
    },
    {
      id: "bleeding-edge",
      title: "Bleeding Edge Picks",
      desc: "Newest, most innovative AI tools pushing boundaries",
      icon: "\u26A1",
      color: ["#f59e0b", "#d97706"],
      items: ["Devin", "Manus", "Sora", "Grok", "Kiro", "Google Jules", "Firebase Studio"]
    },
    {
      id: "free-open-source",
      title: "Free & Open Source",
      desc: "Best free and open-source AI tools anyone can use",
      icon: "\uD83D\uDD13",
      color: ["#14b8a6", "#0d9488"],
      items: ["Ollama", "Stable Diffusion", "Whisper", "Hugging Face", "LM Studio", "Cline", "Codeium"]
    },
    {
      id: "productivity-powerhouse",
      title: "Productivity Powerhouse",
      desc: "AI tools for daily productivity and getting things done",
      icon: "\uD83D\uDCC8",
      color: ["#f97316", "#ea580c"],
      items: ["Notion AI", "Grammarly", "Otter.ai", "Reclaim AI", "Zapier AI", "Granola", "Gamma", "Napkin AI"]
    }
  ];

  var STORAGE_KEY = "collections-explored";

  function getExplored() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function markExplored(id) {
    var explored = getExplored();
    explored[id] = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(explored));
    } catch (e) {}
  }

  function getStack() {
    try {
      return JSON.parse(localStorage.getItem("myStack") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveStack(stack) {
    try {
      localStorage.setItem("myStack", JSON.stringify(stack));
    } catch (e) {}
  }

  function getWantToTry() {
    try {
      return JSON.parse(localStorage.getItem("wantToTry") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveWantToTry(list) {
    try {
      localStorage.setItem("wantToTry", JSON.stringify(list));
    } catch (e) {}
  }

  function addToStack(title) {
    var stack = getStack();
    if (stack.indexOf(title) === -1) {
      stack.push(title);
      saveStack(stack);
    }
    if (window.showToast) {
      window.showToast(title + " added to stack");
    }
  }

  function addToWantToTry(title) {
    var list = getWantToTry();
    if (list.indexOf(title) === -1) {
      list.push(title);
      saveWantToTry(list);
    }
    if (window.showToast) {
      window.showToast(title + " added to Want to Try");
    }
  }

  function saveAllToStack(items) {
    var stack = getStack();
    var added = 0;
    items.forEach(function (title) {
      if (stack.indexOf(title) === -1) {
        stack.push(title);
        added++;
      }
    });
    saveStack(stack);
    if (window.showToast) {
      window.showToast(added + " item(s) added to stack");
    }
  }

  function renderCollections() {
    var grid = document.getElementById("collections-grid");
    if (!grid) return;

    var explored = getExplored();

    grid.innerHTML = COLLECTIONS.map(function (col) {
      var gradient = "linear-gradient(135deg, " + col.color[0] + " 0%, " + col.color[1] + " 100%)";
      var exploredBadge = explored[col.id]
        ? '<span class="collection-explored-badge" aria-label="Explored">&#10003;</span>'
        : "";

      return (
        '<div class="collection-card" data-collection-id="' + col.id + '">' +
        '  <button type="button" class="collection-card-header" aria-expanded="false" aria-controls="collection-detail-' + col.id + '">' +
        '    <div class="collection-icon" style="background:' + gradient + '">' + col.icon + '</div>' +
        '    <div class="collection-info">' +
        '      <h3 class="collection-title">' + col.title + exploredBadge + '</h3>' +
        '      <p class="collection-desc">' + col.desc + '</p>' +
        '      <span class="collection-count">' + col.items.length + ' items</span>' +
        '    </div>' +
        '    <span class="collection-chevron" aria-hidden="true">&#8250;</span>' +
        '  </button>' +
        '  <div class="collection-detail" id="collection-detail-' + col.id + '" hidden>' +
        '    <div class="collection-items" id="collection-items-' + col.id + '"></div>' +
        '    <div class="collection-actions">' +
        '      <button type="button" class="collection-save-all-btn" data-save-all="' + col.id + '">Save All to Stack</button>' +
        '    </div>' +
        '  </div>' +
        '</div>'
      );
    }).join("");

    // Bind expand/collapse
    grid.addEventListener("click", function (e) {
      var headerBtn = e.target.closest(".collection-card-header");
      if (headerBtn) {
        var card = headerBtn.closest(".collection-card");
        var id = card.getAttribute("data-collection-id");
        var detail = document.getElementById("collection-detail-" + id);
        var isOpen = headerBtn.getAttribute("aria-expanded") === "true";

        // Close all other open cards
        grid.querySelectorAll(".collection-card-header[aria-expanded='true']").forEach(function (btn) {
          if (btn !== headerBtn) {
            btn.setAttribute("aria-expanded", "false");
            var otherId = btn.closest(".collection-card").getAttribute("data-collection-id");
            var otherDetail = document.getElementById("collection-detail-" + otherId);
            if (otherDetail) otherDetail.hidden = true;
            btn.closest(".collection-card").classList.remove("expanded");
          }
        });

        if (isOpen) {
          headerBtn.setAttribute("aria-expanded", "false");
          detail.hidden = true;
          card.classList.remove("expanded");
        } else {
          headerBtn.setAttribute("aria-expanded", "true");
          detail.hidden = false;
          card.classList.add("expanded");
          renderCollectionItems(id);
          markExplored(id);
          // Update explored badge
          var titleEl = card.querySelector(".collection-title");
          if (titleEl && !titleEl.querySelector(".collection-explored-badge")) {
            titleEl.insertAdjacentHTML("beforeend", '<span class="collection-explored-badge" aria-label="Explored">&#10003;</span>');
          }
        }
        return;
      }

      // Add to stack button
      var stackBtn = e.target.closest(".collection-item-stack-btn");
      if (stackBtn) {
        var title = stackBtn.getAttribute("data-title");
        addToStack(title);
        stackBtn.textContent = "Added!";
        stackBtn.disabled = true;
        return;
      }

      // Want to try button
      var tryBtn = e.target.closest(".collection-item-try-btn");
      if (tryBtn) {
        var title = tryBtn.getAttribute("data-title");
        addToWantToTry(title);
        tryBtn.textContent = "Added!";
        tryBtn.disabled = true;
        return;
      }

      // Save all button
      var saveAllBtn = e.target.closest(".collection-save-all-btn");
      if (saveAllBtn) {
        var colId = saveAllBtn.getAttribute("data-save-all");
        var col = COLLECTIONS.find(function (c) { return c.id === colId; });
        if (col) {
          saveAllToStack(col.items);
          saveAllBtn.textContent = "All Saved!";
          saveAllBtn.disabled = true;
        }
        return;
      }
    });
  }

  function renderCollectionItems(collectionId) {
    var col = COLLECTIONS.find(function (c) { return c.id === collectionId; });
    if (!col) return;

    var container = document.getElementById("collection-items-" + collectionId);
    if (!container) return;

    var stack = getStack();
    var wantToTry = getWantToTry();

    container.innerHTML = col.items.map(function (itemTitle) {
      var inStack = stack.indexOf(itemTitle) !== -1;
      var inTry = wantToTry.indexOf(itemTitle) !== -1;

      var stackBtnText = inStack ? "In Stack" : "Add to Stack";
      var stackBtnDisabled = inStack ? " disabled" : "";
      var tryBtnText = inTry ? "Bookmarked" : "Want to Try";
      var tryBtnDisabled = inTry ? " disabled" : "";

      return (
        '<div class="collection-item">' +
        '  <span class="collection-item-title">' + itemTitle + '</span>' +
        '  <div class="collection-item-actions">' +
        '    <button type="button" class="collection-item-stack-btn" data-title="' + itemTitle + '"' + stackBtnDisabled + '>' + stackBtnText + '</button>' +
        '    <button type="button" class="collection-item-try-btn" data-title="' + itemTitle + '"' + tryBtnDisabled + '>' + tryBtnText + '</button>' +
        '  </div>' +
        '</div>'
      );
    }).join("");
  }

  // Init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderCollections);
  } else {
    renderCollections();
  }
})();
