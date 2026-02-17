/**
 * AI Knowledge Hub — Profile management
 * Each profile stores its own stack, ratings, directUse, and wantToTry.
 */

(function () {
  const PROFILES_KEY = "profiles";
  const ACTIVE_KEY = "activeProfileId";
  const PROFILE_DATA_KEY = "profileData";

  function getProfiles() {
    try {
      const j = localStorage.getItem(PROFILES_KEY);
      return j ? JSON.parse(j) : [];
    } catch (_) {
      return [];
    }
  }

  function getActiveId() {
    return localStorage.getItem(ACTIVE_KEY) || "";
  }

  function getProfileData() {
    try {
      const j = localStorage.getItem(PROFILE_DATA_KEY);
      return j ? JSON.parse(j) : {};
    } catch (_) {
      return {};
    }
  }

  function saveProfileData(data) {
    localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(data));
  }

  function getDataForProfile(id) {
    const all = getProfileData();
    return all[id] || { myStack: [], ratings: {}, directUse: [], wantToTry: [] };
  }

  function setDataForProfile(id, data) {
    const all = getProfileData();
    all[id] = data;
    saveProfileData(all);
  }

  /* Migrate legacy localStorage to first profile if needed */
  function migrateLegacy() {
    const profiles = getProfiles();
    if (profiles.length > 0) return;

    const legacyStack = localStorage.getItem("myStack");
    const legacyDirect = localStorage.getItem("directUse");
    const legacyWant = localStorage.getItem("wantToTry");
    const hasLegacy = legacyStack || legacyDirect || legacyWant;

    if (!hasLegacy) {
      const id = "default-" + Date.now();
      localStorage.setItem(PROFILES_KEY, JSON.stringify([{ id, name: "Default" }]));
      localStorage.setItem(ACTIVE_KEY, id);
      return;
    }

    const ratings = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("rating:")) {
        const title = k.slice(7);
        ratings[title] = parseFloat(localStorage.getItem(k) || "0");
      }
    }

    const id = "default-" + Date.now();
    const data = {
      myStack: legacyStack ? JSON.parse(legacyStack) : [],
      ratings,
      directUse: legacyDirect ? JSON.parse(legacyDirect) : [],
      wantToTry: legacyWant ? JSON.parse(legacyWant) : [],
    };

    localStorage.setItem(PROFILES_KEY, JSON.stringify([{ id, name: "Default" }]));
    localStorage.setItem(ACTIVE_KEY, id);
    setDataForProfile(id, data);

    /* Clear legacy keys so we don't double-count */
    localStorage.removeItem("myStack");
    localStorage.removeItem("directUse");
    localStorage.removeItem("wantToTry");
    Object.keys(ratings).forEach((title) => localStorage.removeItem("rating:" + title));
  }

  migrateLegacy();

  function getActiveProfileId() {
    const id = getActiveId();
    const profiles = getProfiles();
    if (id && profiles.some((p) => p.id === id)) return id;
    if (profiles.length > 0) return profiles[0].id;
    return null;
  }

  function getCurrentData() {
    const id = getActiveProfileId();
    return id ? getDataForProfile(id) : null;
  }

  /* Public API — used by app.js and stack.js */
  window.ProfileStore = {
    getStack() {
      const data = getCurrentData();
      if (data) return data.myStack || [];
      try {
        const j = localStorage.getItem("myStack");
        return j ? JSON.parse(j) : [];
      } catch (_) {
        return [];
      }
    },
    setStack(arr) {
      const id = getActiveProfileId();
      if (id) {
        const d = getDataForProfile(id);
        d.myStack = arr;
        setDataForProfile(id, d);
      } else {
        localStorage.setItem("myStack", JSON.stringify(arr));
      }
    },

    getRating(title) {
      const data = getCurrentData();
      if (data && data.ratings && typeof data.ratings[title] !== "undefined")
        return data.ratings[title];
      const v = localStorage.getItem("rating:" + title);
      return v ? parseFloat(v) : 0;
    },
    setRating(title, value) {
      const id = getActiveProfileId();
      if (id) {
        const d = getDataForProfile(id);
        d.ratings = d.ratings || {};
        if (value === 0) delete d.ratings[title];
        else d.ratings[title] = value;
        setDataForProfile(id, d);
      } else {
        if (value === 0) localStorage.removeItem("rating:" + title);
        else localStorage.setItem("rating:" + title, String(value));
      }
    },

    getDirectUse() {
      const data = getCurrentData();
      if (data) return data.directUse || [];
      try {
        const j = localStorage.getItem("directUse");
        return j ? JSON.parse(j) : [];
      } catch (_) {
        return [];
      }
    },
    setDirectUse(arr) {
      const id = getActiveProfileId();
      if (id) {
        const d = getDataForProfile(id);
        d.directUse = arr;
        setDataForProfile(id, d);
      } else {
        localStorage.setItem("directUse", JSON.stringify(arr));
      }
    },

    getWantToTry() {
      const data = getCurrentData();
      if (data) return data.wantToTry || [];
      try {
        const j = localStorage.getItem("wantToTry");
        return j ? JSON.parse(j) : [];
      } catch (_) {
        return [];
      }
    },
    setWantToTry(arr) {
      const id = getActiveProfileId();
      if (id) {
        const d = getDataForProfile(id);
        d.wantToTry = arr;
        setDataForProfile(id, d);
      } else {
        localStorage.setItem("wantToTry", JSON.stringify(arr));
      }
    },

    getProfiles,
    getActiveProfileId,
    setActiveProfile(id) {
      localStorage.setItem(ACTIVE_KEY, id);
      window.dispatchEvent(new CustomEvent("profile-changed"));
    },
    createProfile(name) {
      const profiles = getProfiles();
      const id = "p-" + Date.now();
      profiles.push({ id, name });
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      setDataForProfile(id, { myStack: [], ratings: {}, directUse: [], wantToTry: [] });
      return id;
    },
    deleteProfile(id) {
      const profiles = getProfiles().filter((p) => p.id !== id);
      const data = getProfileData();
      delete data[id];
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      saveProfileData(data);
      const active = getActiveId();
      if (active === id && profiles.length > 0) {
        localStorage.setItem(ACTIVE_KEY, profiles[0].id);
      } else if (profiles.length === 0) {
        localStorage.removeItem(ACTIVE_KEY);
      }
      window.dispatchEvent(new CustomEvent("profile-changed"));
    },
    renameProfile(id, name) {
      const profiles = getProfiles().map((p) => (p.id === id ? { ...p, name } : p));
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    },
  };
})();
