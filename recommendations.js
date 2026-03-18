/**
 * AI Knowledge Hub — Smart Recommendations Engine
 * "Because you rated X highly" — personalized suggestions based on user behavior
 */
(function () {
  function getRatings() {
    const ratings = {};
    const prefix = "rating:";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const val = parseFloat(localStorage.getItem(key));
        if (val > 0) ratings[key.slice(prefix.length)] = val;
      }
    }
    if (window.ProfileStore) {
      try {
        const ps = window.ProfileStore;
        if (ps.getAllRatings) return ps.getAllRatings();
      } catch (_) {}
    }
    return ratings;
  }

  function getStack() {
    if (window.ProfileStore) return window.ProfileStore.getStack() || [];
    try { return JSON.parse(localStorage.getItem("myStack") || "[]"); } catch (_) { return []; }
  }

  function getDirectUse() {
    if (window.ProfileStore) return window.ProfileStore.getDirectUse() || [];
    try { return JSON.parse(localStorage.getItem("directUse") || "[]"); } catch (_) { return []; }
  }

  function getAllItems() {
    const items = [];
    if (!window.siteData) return items;
    const categories = ["tools", "knowledge", "podcasts", "youtube", "training", "daily-watch", "bleeding-edge"];
    categories.forEach(cat => {
      (window.siteData[cat] || []).forEach(item => {
        items.push({ ...item, category: cat });
      });
    });
    return items;
  }

  function getTagProfile(ratings, allItems) {
    const tagScores = {};
    allItems.forEach(item => {
      const rating = ratings[item.title];
      if (rating && rating >= 3) {
        (item.tags || []).forEach(tag => {
          const t = tag.toLowerCase();
          tagScores[t] = (tagScores[t] || 0) + rating;
        });
      }
    });
    return tagScores;
  }

  function recommend(count) {
    count = count || 8;
    const ratings = getRatings();
    const stack = getStack();
    const directUse = getDirectUse();
    const allItems = getAllItems();
    const tagProfile = getTagProfile(ratings, allItems);

    if (Object.keys(tagProfile).length === 0) return [];

    // Score unrated/unsaved items
    const candidates = allItems
      .filter(item => !ratings[item.title])
      .map(item => {
        let score = 0;
        (item.tags || []).forEach(tag => {
          const t = tag.toLowerCase();
          if (tagProfile[t]) score += tagProfile[t];
        });
        // Boost items in same category as highly rated items
        const ratedInCategory = allItems.filter(it => it.category === item.category && ratings[it.title] >= 4);
        if (ratedInCategory.length > 0) score += ratedInCategory.length * 2;
        return { ...item, recommendScore: score };
      })
      .filter(item => item.recommendScore > 0)
      .sort((a, b) => b.recommendScore - a.recommendScore)
      .slice(0, count);

    return candidates;
  }

  function getTopRatedTags() {
    const ratings = getRatings();
    const allItems = getAllItems();
    const tagProfile = getTagProfile(ratings, allItems);
    return Object.entries(tagProfile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  function getReason(item) {
    const ratings = getRatings();
    const allItems = getAllItems();
    const itemTags = (item.tags || []).map(t => t.toLowerCase());
    const topTags = getTopRatedTags();
    const matchingTag = itemTags.find(t => topTags.includes(t));
    if (matchingTag) {
      const relatedRated = allItems.find(it => ratings[it.title] >= 4 && (it.tags || []).some(t => t.toLowerCase() === matchingTag));
      if (relatedRated) return `Because you rated ${relatedRated.title} highly`;
    }
    return "Based on your interests";
  }

  window.Recommendations = { recommend, getTopRatedTags, getReason };
})();
