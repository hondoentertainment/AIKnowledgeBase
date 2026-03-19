/**
 * Shareable Lists — Generate shareable URLs, Markdown, and JSON exports
 * for the user's curated stack from the My Stack page.
 */
(function () {
  'use strict';

  /* ========== Page guard ========== */
  function isStackPage() {
    if (document.body && document.body.dataset.page === 'stack') return true;
    return /stack\.html/i.test(window.location.pathname) ||
           /stack\.html/i.test(window.location.href);
  }

  /* ========== Encoding helpers (Unicode-safe btoa/atob) ========== */
  function encodeStack(titles) {
    var json = JSON.stringify(titles);
    return btoa(encodeURIComponent(json));
  }

  function decodeStack(encoded) {
    try {
      var json = decodeURIComponent(atob(encoded));
      var parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  /* ========== Data lookup ========== */
  function getAllKnownItems() {
    var items = [];
    if (typeof siteData !== 'undefined') {
      var categories = ['tools', 'knowledge', 'podcasts', 'youtube', 'training', 'dailyWatch', 'bleedingEdge'];
      categories.forEach(function (cat) {
        (siteData[cat] || []).forEach(function (item) {
          items.push(item);
        });
      });
    }
    if (typeof nicheData !== 'undefined') {
      var nicheCats = ['taxes', 'home', 'travel', 'books', 'media', 'entertainment', 'sports',
        'health', 'education', 'finance', 'legal', 'pets', 'food', 'gardening',
        'realEstate', 'career', 'automotive', 'writing', 'marketing'];
      nicheCats.forEach(function (cat) {
        (nicheData[cat] || []).forEach(function (item) {
          items.push(item);
        });
      });
    }
    return items;
  }

  function findItemByTitle(title, allItems) {
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].title === title) return allItems[i];
    }
    return null;
  }

  /* ========== Stack retrieval ========== */
  function getStack() {
    if (window.ProfileStore) return window.ProfileStore.getStack();
    try {
      var raw = localStorage.getItem('myStack');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setStack(arr) {
    if (window.ProfileStore) {
      window.ProfileStore.setStack(arr);
    } else {
      localStorage.setItem('myStack', JSON.stringify(arr));
    }
  }

  /* ========== Clipboard helper with fallback ========== */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function toast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  /* ========== Core API ========== */

  /**
   * Generate a shareable link encoding the current stack titles.
   */
  function generateLink(titles) {
    titles = titles || getStack();
    var encoded = encodeStack(titles);
    var url = new URL('stack.html', window.location.href);
    url.search = '?shared=' + encoded;
    return url.toString();
  }

  /**
   * Generate a Markdown representation of the stack.
   */
  function generateMarkdown(titles) {
    titles = titles || getStack();
    var allItems = getAllKnownItems();
    var lines = ['## My AI Stack'];
    titles.forEach(function (title) {
      var item = findItemByTitle(title, allItems);
      if (item) {
        lines.push('- **' + item.title + '** \u2014 ' + (item.description || ''));
      } else {
        lines.push('- **' + title + '**');
      }
    });
    return lines.join('\n');
  }

  /**
   * Generate a JSON export of the stack with item details.
   */
  function generateJSON(titles) {
    titles = titles || getStack();
    var allItems = getAllKnownItems();
    var result = titles.map(function (title) {
      var item = findItemByTitle(title, allItems);
      if (item) {
        return {
          title: item.title,
          description: item.description || '',
          url: item.url || '',
          tags: item.tags || []
        };
      }
      return { title: title, description: '', url: '', tags: [] };
    });
    return JSON.stringify(result, null, 2);
  }

  /* ========== Shared view banner ========== */
  function getSharedParam() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('shared') || null;
    } catch (e) {
      return null;
    }
  }

  function showSharedBanner(sharedTitles) {
    var banner = document.createElement('div');
    banner.className = 'shared-stack-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML =
      '<span class="shared-stack-banner-text">Viewing someone\'s shared stack</span>' +
      '<button type="button" class="shared-stack-import-btn" id="shared-import-btn">Import to My Stack</button>';

    var main = document.querySelector('.stack-main') || document.getElementById('main-content');
    if (main && main.firstChild) {
      main.insertBefore(banner, main.firstChild);
    } else if (main) {
      main.appendChild(banner);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }

    var importBtn = document.getElementById('shared-import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', function () {
        var current = getStack();
        var currentSet = {};
        current.forEach(function (t) { currentSet[t] = true; });
        var added = 0;
        sharedTitles.forEach(function (t) {
          if (!currentSet[t]) {
            current.push(t);
            currentSet[t] = true;
            added++;
          }
        });
        setStack(current);
        toast('Imported ' + added + ' item' + (added !== 1 ? 's' : '') + ' to your stack!');
        importBtn.textContent = 'Imported!';
        importBtn.disabled = true;
        // Trigger re-render if stack.js is listening
        window.dispatchEvent(new Event('profile-changed'));
      });
    }
  }

  function hideRemoveButtonsForSharedView() {
    var style = document.createElement('style');
    style.textContent =
      '.shared-stack-banner { display: flex; align-items: center; justify-content: center; gap: 1rem; ' +
      'padding: 0.75rem 1rem; background: var(--accent, #6366f1); color: #fff; font-weight: 500; ' +
      'border-radius: 8px; margin: 1rem auto; max-width: 900px; flex-wrap: wrap; }' +
      '.shared-stack-banner-text { flex: 1 1 auto; text-align: center; }' +
      '.shared-stack-import-btn { background: #fff; color: var(--accent, #6366f1); border: none; ' +
      'padding: 0.5rem 1.25rem; border-radius: 6px; font-weight: 600; cursor: pointer; white-space: nowrap; }' +
      '.shared-stack-import-btn:hover { opacity: 0.9; }' +
      '.shared-stack-import-btn:disabled { opacity: 0.6; cursor: default; }' +
      /* Hide remove buttons in shared view */
      'body.shared-view .stack-remove-btn { display: none !important; }' +
      'body.shared-view .stack-clear-all-btn { display: none !important; }' +
      /* Share toolbar styles */
      '.share-toolbar { display: inline-block; position: relative; margin-left: 0.5rem; }' +
      '.share-toolbar-btn { background: var(--accent, #6366f1); color: #fff; border: none; ' +
      'padding: 0.45rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.875rem; }' +
      '.share-toolbar-btn:hover { opacity: 0.9; }' +
      '.share-toolbar-dropdown { display: none; position: absolute; top: calc(100% + 4px); right: 0; ' +
      'background: var(--card-bg, #fff); border: 1px solid var(--border, #e2e8f0); border-radius: 8px; ' +
      'box-shadow: 0 4px 16px rgba(0,0,0,0.12); min-width: 180px; z-index: 100; overflow: hidden; }' +
      '.share-toolbar-dropdown.open { display: block; }' +
      '.share-toolbar-item { display: block; width: 100%; text-align: left; padding: 0.6rem 1rem; ' +
      'border: none; background: none; cursor: pointer; font-size: 0.875rem; ' +
      'color: var(--text, #1e293b); white-space: nowrap; }' +
      '.share-toolbar-item:hover { background: var(--hover-bg, #f1f5f9); }';
    document.head.appendChild(style);
  }

  /* ========== Share Toolbar ========== */
  function createShareToolbar() {
    var wrapper = document.createElement('div');
    wrapper.className = 'share-toolbar';
    wrapper.innerHTML =
      '<button type="button" class="share-toolbar-btn" id="share-stack-btn" aria-haspopup="true" aria-expanded="false">Share Stack</button>' +
      '<div class="share-toolbar-dropdown" id="share-toolbar-dropdown" role="menu">' +
        '<button type="button" class="share-toolbar-item" id="share-copy-link" role="menuitem">Copy Link</button>' +
        '<button type="button" class="share-toolbar-item" id="share-copy-md" role="menuitem">Copy as Markdown</button>' +
        '<button type="button" class="share-toolbar-item" id="share-copy-json" role="menuitem">Copy as JSON</button>' +
      '</div>';
    return wrapper;
  }

  function injectShareToolbar() {
    // Inject next to the sort/clear controls
    var sortWrap = document.getElementById('stack-sort-wrap');
    if (!sortWrap) {
      // Fallback: inject after the stats section
      var statsWrap = document.querySelector('.stack-stats-wrap');
      if (statsWrap) {
        sortWrap = statsWrap;
      }
    }
    if (!sortWrap) return;

    // Don't inject twice
    if (document.getElementById('share-stack-btn')) return;

    var toolbar = createShareToolbar();
    sortWrap.appendChild(toolbar);

    var toggleBtn = document.getElementById('share-stack-btn');
    var dropdown = document.getElementById('share-toolbar-dropdown');

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
      toggleBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      if (!toolbar.contains(e.target)) {
        dropdown.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
      }
    });

    // Copy Link
    document.getElementById('share-copy-link').addEventListener('click', function () {
      var stack = getStack();
      if (stack.length === 0) {
        toast('Your stack is empty!');
        dropdown.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        return;
      }
      var link = generateLink(stack);
      copyToClipboard(link).then(function (ok) {
        toast(ok !== false ? 'Link copied!' : 'Copy failed');
      });
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    // Copy as Markdown
    document.getElementById('share-copy-md').addEventListener('click', function () {
      var stack = getStack();
      if (stack.length === 0) {
        toast('Your stack is empty!');
        dropdown.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        return;
      }
      var md = generateMarkdown(stack);
      copyToClipboard(md).then(function (ok) {
        toast(ok !== false ? 'Markdown copied!' : 'Copy failed');
      });
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    // Copy as JSON
    document.getElementById('share-copy-json').addEventListener('click', function () {
      var stack = getStack();
      if (stack.length === 0) {
        toast('Your stack is empty!');
        dropdown.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        return;
      }
      var json = generateJSON(stack);
      copyToClipboard(json).then(function (ok) {
        toast(ok !== false ? 'JSON copied!' : 'Copy failed');
      });
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  }

  /* ========== Shared view: override stack rendering ========== */
  function handleSharedView(encoded) {
    var sharedTitles = decodeStack(encoded);
    if (sharedTitles.length === 0) return;

    document.body.classList.add('shared-view');

    // Override getStack so stack.js renders the shared items
    var originalGetStack = (window.ProfileStore && window.ProfileStore.getStack)
      ? window.ProfileStore.getStack.bind(window.ProfileStore)
      : null;

    // Temporarily make the shared titles available as the stack
    // We patch localStorage for the duration of the initial render
    var realStack = localStorage.getItem('myStack');
    localStorage.setItem('myStack', JSON.stringify(sharedTitles));

    // After rendering, show the banner
    // Use a short delay to let stack.js render first
    setTimeout(function () {
      showSharedBanner(sharedTitles);
      // Restore original stack in localStorage (the view stays as rendered)
      if (realStack !== null) {
        localStorage.setItem('myStack', realStack);
      } else {
        localStorage.removeItem('myStack');
      }
    }, 100);
  }

  /* ========== Initialization ========== */
  function init() {
    if (!isStackPage()) return;

    // Always inject styles for banner and toolbar
    hideRemoveButtonsForSharedView();

    var sharedParam = getSharedParam();
    if (sharedParam) {
      handleSharedView(sharedParam);
    } else {
      // Inject share toolbar for the user's own stack view
      // Use MutationObserver to wait for the sort wrapper to appear
      var sortWrap = document.getElementById('stack-sort-wrap');
      if (sortWrap) {
        injectShareToolbar();
      } else {
        var observer = new MutationObserver(function (mutations, obs) {
          var target = document.getElementById('stack-sort-wrap');
          if (target) {
            obs.disconnect();
            injectShareToolbar();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        // Safety timeout to stop observing
        setTimeout(function () { observer.disconnect(); }, 10000);
      }
    }
  }

  /* ========== Bootstrap ========== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ========== Public API ========== */
  window.ShareableList = {
    generateLink: generateLink,
    generateMarkdown: generateMarkdown,
    generateJSON: generateJSON,
    init: init
  };
})();
