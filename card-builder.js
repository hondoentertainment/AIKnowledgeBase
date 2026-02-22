/**
 * AI Knowledge Hub — Card builder
 * Shared full card HTML and interaction init for category pages and search
 * Depends: profiles.js (optional, falls back to localStorage)
 */
(function () {
  const SHARE_PAGE_MAP = { tools: "tools.html", knowledge: "knowledge.html", podcasts: "podcasts.html", youtube: "youtube.html", training: "training.html", "daily-watch": "daily-watch.html", "bleeding-edge": "bleeding-edge.html" };
  const STAR_SVG = '<svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>';

  function haptic() { if (navigator.vibrate) navigator.vibrate(5); }
  function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }
  function gradientCSS(colorPair) {
    if (colorPair && colorPair.length === 2) return `linear-gradient(135deg, ${colorPair[0]} 0%, ${colorPair[1]} 100%)`;
    return "linear-gradient(135deg, #30363d 0%, #21262d 100%)";
  }

  function deriveTrustSignals(item) {
    const trustSignals = [];
    const tags = (item.tags || []).map((t) => String(t).toLowerCase());
    const title = String(item.title || "").toLowerCase();
    const desc = String(item.description || "").toLowerCase();
    const url = String(item.url || "");
    let host = "";
    try { host = new URL(url).hostname.replace(/^www\./, "").toLowerCase(); } catch (_) {}
    const officialHosts = ["openai.com", "anthropic.com", "google.com", "deepmind.com", "microsoft.com", "aws.amazon.com", "huggingface.co", "github.com", "meta.com", "stability.ai"];
    const hasOfficialHost = officialHosts.some((h) => host === h || host.endsWith("." + h));
    const hasDocsSignal = title.includes("documentation") || title.includes("docs") || desc.includes("documentation") || tags.some((t) => t.includes("documentation") || t.includes("guide"));
    const hasSourceSignal = tags.some((t) => t.includes("open source")) || desc.includes("open-source") || desc.includes("open source");
    const hasEvidenceSignal = desc.includes("cited") || desc.includes("sourced") || desc.includes("research") || tags.some((t) => t.includes("research"));
    const hasSecureSignal = url.startsWith("https://");
    if (hasOfficialHost) trustSignals.push({ cls: "trust-badge-official", label: "Official", title: "Official source domain" });
    if (hasSourceSignal) trustSignals.push({ cls: "trust-badge-oss", label: "Open source", title: "Open-source project or ecosystem" });
    if (hasDocsSignal) trustSignals.push({ cls: "trust-badge-docs", label: "Docs", title: "Documentation or learning guide" });
    if (hasEvidenceSignal) trustSignals.push({ cls: "trust-badge-evidence", label: "Research", title: "Research-backed or cited content" });
    if (hasSecureSignal) trustSignals.push({ cls: "trust-badge-secure", label: "HTTPS", title: "Secure connection available" });
    return trustSignals.slice(0, 2);
  }

  function starHalfSvg(gradId) {
    return '<svg class="star-icon" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="' + gradId + '"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="url(#' + gradId + ')" stroke="currentColor" stroke-width="0.5"/></svg>';
  }
  let _starGradCounter = 0;
  function ratingGradId() { return "halfStar-" + (++_starGradCounter); }

  function getRating(title) {
    if (window.ProfileStore) return window.ProfileStore.getRating(title);
    const v = localStorage.getItem("rating:" + title);
    return v ? parseFloat(v) : 0;
  }
  function setRating(title, value) {
    if (window.ProfileStore) window.ProfileStore.setRating(title, value);
    else { if (value === 0) localStorage.removeItem("rating:" + title); else localStorage.setItem("rating:" + title, String(value)); }
  }
  function getStack() { return window.ProfileStore ? window.ProfileStore.getStack() : []; }
  function isInStack(title) { return getStack().includes(title); }
  function addToStack(title) { const s = getStack(); if (!s.includes(title)) { s.push(title); if (window.ProfileStore) window.ProfileStore.setStack(s); else localStorage.setItem("myStack", JSON.stringify(s)); } }
  function removeFromStack(title) { const s = getStack().filter((t) => t !== title); if (window.ProfileStore) window.ProfileStore.setStack(s); else localStorage.setItem("myStack", JSON.stringify(s)); }
  function toggleStack(title) { if (isInStack(title)) removeFromStack(title); else addToStack(title); }
  function getDirectUse() { return window.ProfileStore ? window.ProfileStore.getDirectUse() : []; }
  function isDirectUse(title) { return getDirectUse().includes(title); }
  function addDirectUse(title) { const d = getDirectUse(); if (!d.includes(title)) { d.push(title); if (window.ProfileStore) window.ProfileStore.setDirectUse(d); else localStorage.setItem("directUse", JSON.stringify(d)); } }
  function removeDirectUse(title) { const d = getDirectUse().filter((t) => t !== title); if (window.ProfileStore) window.ProfileStore.setDirectUse(d); else localStorage.setItem("directUse", JSON.stringify(d)); }
  function toggleDirectUse(title) { if (isDirectUse(title)) removeDirectUse(title); else addDirectUse(title); }
  function getWantToTry() { return window.ProfileStore ? window.ProfileStore.getWantToTry() : []; }
  function isWantToTry(title) { return getWantToTry().includes(title); }
  function addWantToTry(title) { const w = getWantToTry(); if (!w.includes(title)) { w.push(title); if (window.ProfileStore) window.ProfileStore.setWantToTry(w); else localStorage.setItem("wantToTry", JSON.stringify(w)); } }
  function removeWantToTry(title) { const w = getWantToTry().filter((t) => t !== title); if (window.ProfileStore) window.ProfileStore.setWantToTry(w); else localStorage.setItem("wantToTry", JSON.stringify(w)); }
  function toggleWantToTry(title) { if (isWantToTry(title)) removeWantToTry(title); else addWantToTry(title); }

  function levelLabel(lvl) { if (lvl <= 2) return "Beginner"; if (lvl <= 4) return "Intermediate"; if (lvl <= 6) return "Advanced"; if (lvl <= 8) return "Expert"; return "World-Class"; }
  function levelClass(lvl) { if (lvl <= 2) return "level-beginner"; if (lvl <= 4) return "level-intermediate"; if (lvl <= 6) return "level-advanced"; if (lvl <= 8) return "level-expert"; return "level-worldclass"; }

  function getShareUrl(page, category, title) {
    const base = page === "niche" ? "niche.html" : (SHARE_PAGE_MAP[page] || "index.html");
    const u = new URL(base, window.location.href);
    u.search = new URLSearchParams({ share: category, id: title }).toString();
    return u.toString();
  }

  function buildStarsHTML(title) {
    const saved = getRating(title);
    const gradId = ratingGradId();
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = saved >= i;
      const isHalf = !isFull && saved >= i - 0.5;
      let cls = "star" + (isFull ? " filled" : isHalf ? " half-filled" : "");
      stars.push(`<span class="${cls}" data-star="${i}" tabindex="0" role="button" aria-label="Rate ${i} of 5 stars"><span class="star-half star-left" data-val="${i - 0.5}"></span><span class="star-half star-right" data-val="${i}"></span>${isHalf ? starHalfSvg(gradId) : STAR_SVG}</span>`);
    }
    const label = saved ? saved.toFixed(1).replace(/\.0$/, "") : "";
    return `<div class="card-rating" data-title="${escapeAttr(title)}" data-rating="${saved}" data-grad-id="${escapeAttr(gradId)}" role="group" aria-label="${saved ? `Rate ${escapeAttr(title)} — currently ${saved} of 5 stars` : `Rate ${escapeAttr(title)}`}">${stars.join("")}<span class="rating-value" aria-hidden="true">${label}</span></div>`;
  }

  function buildCard(item, category) {
    const url = item.url || "#";
    const icon = item.icon || "";
    const grad = gradientCSS(item.color);
    const tags = (item.tags || []).map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`).join("");
    const lvl = item.level || 0;
    const levelBadge = lvl ? `<span class="level-badge ${levelClass(lvl)}" title="${levelLabel(lvl)} (${lvl}/10)">${lvl}</span>` : "";
    const freq = item.freq || "";
    const freqBadge = freq ? `<span class="freq-badge" title="Output: ${escapeAttr(freq)}">${escapeHtml(freq)}</span>` : "";
    const inStack = isInStack(item.title);
    const stackBtn = `<button type="button" class="stack-btn ${inStack ? "in-stack" : ""}" data-stack-title="${escapeAttr(item.title)}" aria-label="${inStack ? "Remove from My Stack" : "Add to My Stack"}">${inStack ? "✓ In Stack" : "+ Add to Stack"}</button>`;
    const using = isDirectUse(item.title);
    const directUseBadge = using ? `<span class="direct-use-badge" title="I use this tool directly">✓ Using</span>` : "";
    const directUseBtn = `<button type="button" class="direct-use-btn ${using ? "using" : ""}" data-direct-use-title="${escapeAttr(item.title)}" aria-label="${using ? "Unmark as using" : "Mark as using directly"}">${using ? "✓ Using" : "I Use This"}</button>`;
    const flagged = isWantToTry(item.title);
    const wantToTryBadge = flagged ? `<span class="want-to-try-badge" title="Flagged to try">🔖</span>` : "";
    const wantToTryBtn = `<button type="button" class="want-to-try-btn ${flagged ? "flagged" : ""}" data-want-to-try-title="${escapeAttr(item.title)}" aria-label="${flagged ? "Remove from want to try" : "Flag to try"}">${flagged ? "🔖 Flagged" : "Want to Try"}</button>`;
    const cat = category || "tools";
    const shareCat = (item.category === "niche" && item.nicheSection) ? item.nicheSection : cat;
    const sharePage = (item.category === "niche") ? "niche" : (document.body.dataset.category || cat);
    const shareBtn = `<button type="button" class="share-btn" data-share-page="${escapeAttr(sharePage)}" data-share-category="${escapeAttr(shareCat)}" data-share-title="${escapeAttr(item.title)}" data-share-desc="${escapeAttr(item.description || "")}" aria-label="Share ${escapeAttr(item.title)}">Share</button>`;
    const visitUrl = url && url !== "#" ? url : null;
    const visitBtn = visitUrl ? `<a href="${escapeHtml(visitUrl)}" class="visit-btn" target="_blank" rel="noopener" aria-label="Visit ${escapeAttr(item.title)}">Visit</a>` : "";
    const categoryLink = item.categoryPage && item.categoryLabel
      ? `<a href="${escapeHtml(item.categoryPage)}" class="card-category-link" aria-label="View in ${escapeAttr(item.categoryLabel)}">In ${escapeHtml(item.categoryLabel)}</a>`
      : "";
    const trustSignals = deriveTrustSignals(item);
    const trustSignalsHtml = trustSignals.length ? `<div class="card-trust-signals" aria-label="Trust signals">${trustSignals.map((s) => `<span class="trust-badge ${s.cls}" title="${escapeAttr(s.title)}">${escapeHtml(s.label)}</span>`).join("")}</div>` : "";
    return `<div class="card" data-title="${escapeAttr(item.title)}" data-desc="${escapeAttr(item.description)}" data-tags="${escapeAttr((item.tags || []).join(" "))}"><a href="${escapeHtml(url)}" class="card-link" target="_blank" rel="noopener"><div class="card-cover" style="background:${grad}">${freqBadge}${levelBadge}${directUseBadge}${wantToTryBadge}<span class="card-cover-icon">${icon}</span></div></a><div class="card-body"><a href="${escapeHtml(url)}" class="card-title" target="_blank" rel="noopener">${escapeHtml(item.title)}</a><p class="card-desc">${escapeHtml(item.description)}</p>${trustSignalsHtml}${buildStarsHTML(item.title)}<div class="card-actions">${visitBtn}${categoryLink}${wantToTryBtn}${directUseBtn}${stackBtn}${shareBtn}</div>${tags ? `<div class="card-tags">${tags}</div>` : ""}</div></div>`;
  }

  function initStarInteractions(container) {
    const root = container || document;
    const liveRegion = document.getElementById("rating-announcer");
    function announce(msg) { if (liveRegion) { liveRegion.textContent = msg; setTimeout(() => { liveRegion.textContent = ""; }, 500); } }
    root.querySelectorAll(".card-rating").forEach((container) => {
      const title = container.dataset.title;
      const starEls = container.querySelectorAll(".star");
      const label = container.querySelector(".rating-value");
      function updateDisplay(rating) {
        const gradId = container.dataset.gradId || "halfStar-fallback";
        starEls.forEach((el) => {
          const idx = parseInt(el.dataset.star, 10);
          el.classList.remove("filled", "half-filled", "preview", "preview-half");
          if (rating >= idx) {
            el.classList.add("filled");
            el.innerHTML = `<span class="star-half star-left" data-val="${idx - 0.5}"></span><span class="star-half star-right" data-val="${idx}"></span>${STAR_SVG}`;
          } else if (rating >= idx - 0.5) {
            el.classList.add("half-filled");
            el.innerHTML = `<span class="star-half star-left" data-val="${idx - 0.5}"></span><span class="star-half star-right" data-val="${idx}"></span>${starHalfSvg(gradId)}`;
          } else {
            el.innerHTML = `<span class="star-half star-left" data-val="${idx - 0.5}"></span><span class="star-half star-right" data-val="${idx}"></span>${STAR_SVG}`;
          }
        });
        label.textContent = rating ? String(rating).replace(/\.0$/, "") : "";
        container.dataset.rating = rating;
        container.setAttribute("aria-label", rating ? `Rate ${title} — currently ${rating} of 5 stars` : `Rate ${title}`);
      }
      function previewStars(hoverVal) {
        container.classList.add("hovering");
        if (label) { label.textContent = String(hoverVal).replace(/\.0$/, ""); label.classList.add("previewing"); }
        starEls.forEach((el) => { const idx = parseInt(el.dataset.star, 10); el.classList.remove("preview", "preview-half"); if (hoverVal >= idx) el.classList.add("preview"); else if (hoverVal >= idx - 0.5) el.classList.add("preview-half"); });
      }
      function clearPreview() {
        container.classList.remove("hovering");
        if (label) { const current = parseFloat(container.dataset.rating || "0"); label.textContent = current ? String(current).replace(/\.0$/, "") : ""; label.classList.remove("previewing"); }
        starEls.forEach((el) => el.classList.remove("preview", "preview-half"));
      }
      starEls.forEach((starEl) => {
        starEl.querySelectorAll(".star-half").forEach((half) => {
          half.addEventListener("mouseenter", () => previewStars(parseFloat(half.dataset.val)));
          half.addEventListener("click", (e) => {
            e.preventDefault(); e.stopPropagation(); haptic(); window.MobileUX?.haptic?.success?.();
            const val = parseFloat(half.dataset.val);
            const newVal = getRating(title) === val ? 0 : val;
            setRating(title, newVal); clearPreview(); updateDisplay(newVal);
            container.classList.add("just-rated"); setTimeout(() => container.classList.remove("just-rated"), 450);
            announce(newVal ? "Rated " + newVal + " of 5" : "Rating cleared");
          });
        });
        starEl.addEventListener("keydown", (e) => {
          if (!["ArrowLeft", "ArrowRight", "Enter", " "].includes(e.key)) return;
          e.preventDefault(); haptic();
          const current = getRating(title);
          const starArr = Array.from(starEls);
          const idx = starArr.indexOf(starEl);
          if (e.key === "ArrowRight") { const next = Math.min(5, current + 0.5); setRating(title, next); updateDisplay(next); if (idx < starArr.length - 1) starArr[idx + 1].focus(); announce("Rated " + next + " of 5"); }
          else if (e.key === "ArrowLeft") { const next = Math.max(0, current - 0.5); setRating(title, next); updateDisplay(next); if (idx > 0) starArr[idx - 1].focus(); announce(next ? "Rated " + next + " of 5" : "Rating cleared"); }
          else if (e.key === "Enter" || e.key === " ") { const starIdx = parseInt(starEl.dataset.star, 10); const val = current === starIdx ? 0 : starIdx; setRating(title, val); updateDisplay(val); container.classList.add("just-rated"); setTimeout(() => container.classList.remove("just-rated"), 450); announce(val ? "Rated " + val + " of 5" : "Rating cleared"); }
        });
      });
      container.addEventListener("mouseleave", clearPreview);
    });
  }

  function initStackButtons(container) {
    const root = container || document;
    root.querySelectorAll(".stack-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        const title = btn.dataset.stackTitle;
        const wasInStack = isInStack(title);
        haptic(); toggleStack(title);
        const nowInStack = isInStack(title);
        if (nowInStack && !wasInStack) window.MobileUX?.haptic?.success?.();
        btn.classList.toggle("in-stack", nowInStack);
        btn.textContent = nowInStack ? "✓ In Stack" : "+ Add to Stack";
        btn.setAttribute("aria-label", nowInStack ? "Remove from My Stack" : "Add to My Stack");
      });
    });
  }

  function initDirectUseButtons(container) {
    const root = container || document;
    root.querySelectorAll(".direct-use-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation(); haptic();
        const title = btn.dataset.directUseTitle;
        const wasUsing = isDirectUse(title);
        toggleDirectUse(title);
        if (isDirectUse(title) && !wasUsing) window.MobileUX?.haptic?.success?.();
        btn.classList.toggle("using", isDirectUse(title));
        btn.textContent = isDirectUse(title) ? "✓ Using" : "I Use This";
        btn.setAttribute("aria-label", isDirectUse(title) ? "Unmark as using" : "Mark as using directly");
        const card = btn.closest(".card"); const cover = card?.querySelector(".card-cover");
        if (cover) {
          const badge = cover.querySelector(".direct-use-badge");
          if (isDirectUse(title)) { if (!badge) { const b = document.createElement("span"); b.className = "direct-use-badge"; b.title = "I use this tool directly"; b.textContent = "✓ Using"; cover.appendChild(b); } }
          else if (badge) badge.remove();
        }
      });
    });
  }

  function initWantToTryButtons(container) {
    const root = container || document;
    root.querySelectorAll(".want-to-try-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation(); haptic();
        const title = btn.dataset.wantToTryTitle;
        const wasFlagged = isWantToTry(title);
        toggleWantToTry(title);
        if (isWantToTry(title) && !wasFlagged) window.MobileUX?.haptic?.success?.();
        btn.classList.toggle("flagged", isWantToTry(title));
        btn.textContent = isWantToTry(title) ? "🔖 Flagged" : "Want to Try";
        btn.setAttribute("aria-label", isWantToTry(title) ? "Remove from want to try" : "Flag to try");
        const card = btn.closest(".card"); const cover = card?.querySelector(".card-cover");
        if (cover) {
          const badge = cover.querySelector(".want-to-try-badge");
          if (isWantToTry(title)) { if (!badge) { const b = document.createElement("span"); b.className = "want-to-try-badge"; b.title = "Flagged to try"; b.textContent = "🔖"; cover.appendChild(b); } }
          else if (badge) badge.remove();
        }
      });
    });
  }

  function initShareButtons(container) {
    const root = container || document;
    root.querySelectorAll(".share-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        const { sharePage, shareCategory, shareTitle, shareDesc } = btn.dataset;
        if (!sharePage || !shareCategory || !shareTitle) return;
        const url = getShareUrl(sharePage, shareCategory, shareTitle);
        const shareData = { url, title: shareTitle, text: shareDesc || shareTitle };
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          navigator.share(shareData).then(() => showShareFeedback(btn, true, true)).catch(() => copyAndFeedback(url, btn));
        } else {
          copyAndFeedback(url, btn);
        }
      });
    });
  }

  function copyAndFeedback(url, btn) {
    navigator.clipboard.writeText(url).then(() => showShareFeedback(btn, true, false)).catch(() => showShareFeedback(btn, false, false));
  }

  function showShareFeedback(btn, ok, wasNativeShare) {
    if (ok) haptic();
    const label = btn.getAttribute("aria-label") || "Share";
    const prev = btn.textContent;
    const successMsg = (wasNativeShare === true) ? "Shared!" : "Link copied!";
    const successAria = (wasNativeShare === true) ? "Shared successfully" : "Link copied to clipboard";
    btn.textContent = ok ? successMsg : "Copy failed";
    btn.setAttribute("aria-label", ok ? successAria : "Copy failed");
    btn.disabled = true;
    setTimeout(() => { btn.textContent = prev || "Share"; btn.setAttribute("aria-label", label); btn.disabled = false; }, 2000);
  }

  function initInteractions(container) {
    initStarInteractions(container);
    initStackButtons(container);
    initDirectUseButtons(container);
    initWantToTryButtons(container);
    initShareButtons(container);
  }

  window.CardBuilder = {
    buildCard,
    initInteractions,
  };
})();
