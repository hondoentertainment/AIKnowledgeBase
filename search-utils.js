/**
 * Search utilities: fuzzy/multi-term matching, recent searches, popular queries
 */

(function () {
  const RECENT_KEY = "searchRecent";
  const RECENT_MAX = 10;

  /**
   * Multi-term + fuzzy-friendly matching.
   * Splits query by spaces; each term must appear (as substring) in title, desc, or tags.
   * Normalizes spaces and case. "chat gpt" matches "ChatGPT", "chat gpt" matches "chat GPT".
   */
  function matchItem(query, item) {
    const q = (query || "").toLowerCase().trim();
    if (!q) return true;

    const terms = q.split(/\s+/).filter((t) => t.length > 0);
    if (terms.length === 0) return true;

    const title = String(item.title || "").toLowerCase();
    const desc = String(item.description || "").toLowerCase();
    const tagsStr = (item.tags || []).map((t) => String(t).toLowerCase()).join(" ");

    return terms.every((term) => {
      return title.includes(term) || desc.includes(term) || tagsStr.includes(term);
    });
  }

  /**
   * Check if a card element (with data-title, data-desc, data-tags) matches query.
   */
  function matchCard(query, card) {
    const item = {
      title: card.dataset.title || "",
      description: card.dataset.desc || "",
      tags: (card.dataset.tags || "").split(/\s+/).filter(Boolean),
    };
    return matchItem(query, item);
  }

  function getRecentSearches() {
    try {
      const j = localStorage.getItem(RECENT_KEY);
      const arr = j ? JSON.parse(j) : [];
      return Array.isArray(arr) ? arr.slice(0, RECENT_MAX) : [];
    } catch (_) {
      return [];
    }
  }

  function addRecentSearch(query) {
    const q = (query || "").trim();
    if (!q) return;
    const recent = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
    recent.unshift(q);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, RECENT_MAX)));
  }

  function clearRecentSearches() {
    localStorage.removeItem(RECENT_KEY);
  }

  /**
   * Popular queries derived from common catalog terms and tool names.
   */
  function getPopularQueries() {
    return [
      "ChatGPT",
      "Claude",
      "coding",
      "image",
      "writing",
      "video",
      "research",
      "automation",
      "LLM",
      "open source",
    ];
  }

  window.SearchUtils = {
    matchItem,
    matchCard,
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches,
    getPopularQueries,
  };
})();
