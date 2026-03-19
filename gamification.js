/**
 * AI Knowledge Hub — Gamification System
 * Achievements, exploration progress, and engagement tracking
 */
(function () {
  const STORAGE_KEY = "achievements";
  const ACHIEVEMENTS = [
    { id: "first_rating", title: "First Impression", desc: "Rate your first tool", icon: "⭐", check: () => countRatings() >= 1 },
    { id: "five_ratings", title: "Critic", desc: "Rate 5 tools", icon: "🌟", check: () => countRatings() >= 5 },
    { id: "twenty_ratings", title: "Connoisseur", desc: "Rate 20 tools", icon: "👑", check: () => countRatings() >= 20 },
    { id: "first_stack", title: "Collector", desc: "Add first item to stack", icon: "📚", check: () => getStack().length >= 1 },
    { id: "ten_stack", title: "Curator", desc: "Build a stack of 10+ items", icon: "🏆", check: () => getStack().length >= 10 },
    { id: "first_try", title: "Explorer", desc: "Flag your first want-to-try", icon: "🔖", check: () => getWantToTry().length >= 1 },
    { id: "dark_mode", title: "Night Owl", desc: "Switch to dark mode", icon: "🌙", check: () => document.documentElement.getAttribute("data-theme") === "dark" },
    { id: "search_master", title: "Search Master", desc: "Perform 10 searches", icon: "🔍", check: () => getSearchCount() >= 10 },
    { id: "five_star", title: "Perfectionist", desc: "Give a 5-star rating", icon: "💯", check: () => hasRatingOf(5) },
    { id: "multi_category", title: "Renaissance User", desc: "Rate items in 3+ categories", icon: "🎭", check: () => ratedCategories() >= 3 },
    { id: "command_palette", title: "Power User", desc: "Use the command palette", icon: "⌨️", check: () => localStorage.getItem("used_cmd_palette") === "true" },
    { id: "compare_tools", title: "Analyst", desc: "Compare tools side-by-side", icon: "⚖️", check: () => localStorage.getItem("used_compare") === "true" },
  ];

  function countRatings() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("rating:") && parseFloat(localStorage.getItem(key)) > 0) count++;
    }
    return count;
  }

  function getStack() {
    try { return JSON.parse(localStorage.getItem("myStack") || "[]"); } catch (_) { return []; }
  }

  function getWantToTry() {
    try { return JSON.parse(localStorage.getItem("wantToTry") || "[]"); } catch (_) { return []; }
  }

  function getSearchCount() {
    return parseInt(localStorage.getItem("search_count") || "0", 10);
  }

  function hasRatingOf(val) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("rating:") && parseFloat(localStorage.getItem(key)) === val) return true;
    }
    return false;
  }

  function ratedCategories() {
    if (!window.siteData) return 0;
    const cats = new Set();
    const categories = ["tools", "knowledge", "podcasts", "youtube", "training", "daily-watch", "bleeding-edge"];
    categories.forEach(cat => {
      (window.siteData[cat] || []).forEach(item => {
        const r = localStorage.getItem("rating:" + item.title);
        if (r && parseFloat(r) > 0) cats.add(cat);
      });
    });
    return cats.size;
  }

  function getUnlocked() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (_) { return []; }
  }

  function saveUnlocked(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  function checkAchievements() {
    const unlocked = getUnlocked();
    let newUnlocks = [];
    ACHIEVEMENTS.forEach(a => {
      if (!unlocked.includes(a.id) && a.check()) {
        unlocked.push(a.id);
        newUnlocks.push(a);
      }
    });
    if (newUnlocks.length > 0) {
      saveUnlocked(unlocked);
      newUnlocks.forEach(a => showAchievementToast(a));
    }
    return { unlocked: unlocked.length, total: ACHIEVEMENTS.length };
  }

  function showAchievementToast(achievement) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `
      <div class="achievement-toast-inner">
        <span class="achievement-toast-icon">${achievement.icon}</span>
        <div class="achievement-toast-text">
          <strong>Achievement Unlocked!</strong>
          <span>${achievement.title}</span>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function getProgress() {
    const unlocked = getUnlocked();
    return {
      unlocked: unlocked.length,
      total: ACHIEVEMENTS.length,
      percent: Math.round((unlocked.length / ACHIEVEMENTS.length) * 100),
      achievements: ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: unlocked.includes(a.id),
      })),
    };
  }

  // Periodically check achievements
  setInterval(checkAchievements, 5000);
  // Check on page load
  setTimeout(checkAchievements, 2000);

  // Track command palette usage
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      localStorage.setItem("used_cmd_palette", "true");
    }
  });

  // Track search count
  const origAddRecent = window.SearchUtils?.addRecentSearch;
  if (origAddRecent) {
    window.SearchUtils.addRecentSearch = function (q) {
      origAddRecent(q);
      const count = getSearchCount() + 1;
      localStorage.setItem("search_count", String(count));
    };
  }

  window.Gamification = { checkAchievements, getProgress };
})();
