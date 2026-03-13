/**
 * Lightweight product analytics (client-side/local)
 * Stores a capped event stream in localStorage for UX iteration.
 */
(function () {
  const EVENTS_KEY = "analyticsEvents";
  const ENABLED_KEY = "analyticsEnabled";
  const MAX_EVENTS = 500;

  function readEvents() {
    try {
      const raw = localStorage.getItem(EVENTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeEvents(events) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  }

  function isDoNotTrackEnabled() {
    const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return dnt === "1" || dnt === "yes";
  }

  function isEnabled() {
    const saved = localStorage.getItem(ENABLED_KEY);
    if (saved === "true") return true;
    if (saved === "false") return false;
    return !isDoNotTrackEnabled();
  }

  function setEnabled(enabled) {
    localStorage.setItem(ENABLED_KEY, enabled ? "true" : "false");
  }

  function track(name, properties) {
    if (!name || !isEnabled()) return;
    const evt = {
      name: String(name),
      ts: Date.now(),
      path: window.location.pathname,
      properties: properties && typeof properties === "object" ? properties : {},
    };
    const events = readEvents();
    events.push(evt);
    writeEvents(events);
  }

  function getEvents() {
    return readEvents();
  }

  function clear() {
    localStorage.removeItem(EVENTS_KEY);
  }

  function getSummary() {
    const events = readEvents();
    const byName = {};
    events.forEach((evt) => {
      byName[evt.name] = (byName[evt.name] || 0) + 1;
    });
    return {
      enabled: isEnabled(),
      total: events.length,
      byName,
      latest: events.length ? events[events.length - 1] : null,
    };
  }

  window.Analytics = { track, getEvents, getSummary, clear, isEnabled, setEnabled };
})();
