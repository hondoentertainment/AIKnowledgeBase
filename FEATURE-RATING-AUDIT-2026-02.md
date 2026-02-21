# Feature Rating Audit
**App**: AI Knowledge Hub  
**Date**: February 20, 2026

## Summary
- **Overall score**: 7.4 / 10
- **Highest**: Star ratings (8.5/10), My Stack (8/10), Search (header) (8/10)
- **Needs work**: Auth (6/10), Search page (6.5/10), Admin (6.5/10)

---

## Feature Ratings

### Home Hub — 7.5/10
**Route/Scope**: / (index.html)

**Rationale**: Hero, feature chips, top picks, category grid, and stat counts work well. Skip link, live regions, and error handling are in place. Layout and hierarchy are clear.

**Recommendations** (score < 8):
1. Add loading skeletons for the top picks section instead of only text.
2. Add JSON-LD structured data for SEO.
3. Ensure `aria-busy` updates when featured content finishes loading.

---

### Star Ratings — 8.5/10
**Route/Scope**: Category cards, Niche AI

**Rationale**: Half-stars, keyboard control (arrows, Enter, Space), live region announcements, hover preview, haptics. Accessible and robust.

**Recommendations** (if score < 8): N/A (polish only)

---

### My Stack — 8/10
**Route/Scope**: /stack.html

**Rationale**: Add/remove by category, in-page search, share, remove buttons, profile-aware data, clear empty state.

**Recommendations** (if score < 8): N/A

---

### Search (Header / Category Filter) — 8/10
**Route/Scope**: Expandable header search, category pages

**Rationale**: `/` shortcut, expandable bar, recent/popular suggestions, multi-term matching. Live region for results; ESC handling.

**Recommendations** (if score < 8): N/A (polish: arrow-key navigation in suggestions)

---

### Search Page (Cross-Category) — 6.5/10
**Route/Scope**: /search.html

**Rationale**: URL-based search (`?q=`), grouped results by category, suggestions. Core flow works.

**Recommendations** (score < 8):
1. Make result cards interactive (ratings, stack, I Use This, Want to Try) or add a clear path to the category page for each result.
2. Include Niche AI items in search results.
3. Add a loading or skeleton state while results are computed.

---

### Profiles — 7.5/10
**Route/Scope**: /profiles.html

**Rationale**: Create, switch, rename, delete profiles; backup/restore JSON; limited add-tool form; settings for admins. Delete is confirmed.

**Recommendations** (score < 8):
1. Add keyboard support (Enter/Space for Switch, Escape for cancel).
2. Announce "Switched to [Profile]" when changing profile.
3. Use listbox/option semantics for profile list.

---

### Admin — 6.5/10
**Route/Scope**: /admin.html

**Rationale**: Add/edit/remove custom tools, export for data.js, role-based access. CRUD and export work.

**Recommendations** (score < 8):
1. Add validation feedback for URL and color hex.
2. Add unsaved-changes warning before leaving.
3. Improve focus management when switching between login and admin content.

---

### Auth (Login, Register, Forgot/Reset) — 6/10
**Route/Scope**: /login.html, /register.html, /forgot-password.html, /reset-password.html

**Rationale**: Email/password auth, SHA-256 hashing, rate-limited reset, Google OAuth (requires client ID). Password rules and error feedback.

**Recommendations** (score < 8):
1. Document or guide how to set `googleClientId` (e.g. in Admin or setup).
2. Add session expiry notice (e.g. close to 7-day limit).
3. Add "Remember me" or session length information.

---

### Niche AI — 7.5/10
**Route/Scope**: /niche.html

**Rationale**: 19 categories, sticky TOC, same card interactions. Featured row, profile-aware data.

**Recommendations** (score < 8):
1. Make TOC horizontally scrollable or collapsible on small screens.
2. Indicate active TOC section on scroll.
3. Ensure Niche AI is included in search and stack flows.

---

### Share — 7.5/10
**Route/Scope**: Card and Stack share buttons

**Rationale**: Native Web Share when supported, clipboard fallback, haptics, updated `aria-label`.

**Recommendations** (score < 8):
1. Improve fallback copy feedback (e.g. "Copy failed").
2. Add Open Graph meta for shared links.
3. Test share URL handling with `?share=&id=` on category pages.

---

### I Use This / Want to Try — 7.5/10
**Route/Scope**: Category cards

**Rationale**: Toggle buttons and badges, profile-aware storage, haptics.

**Recommendations** (score < 8):
1. Add filter options for "I Use This" and "Want to Try" on category pages.
2. Include these flags in search and stack filtering.

---

### Theme Toggle — 8/10
**Route/Scope**: Header, all pages

**Rationale**: Light/dark, `prefers-color-scheme` support, `aria-pressed`, persistence, smooth transitions.

**Recommendations** (if score < 8): N/A

---

### PWA & Offline — 7/10
**Route/Scope**: sw.js, manifest.json

**Rationale**: Service worker caches core assets, offline fallback HTML, cache versioning.

**Recommendations** (score < 8):
1. Add `header.js` and `theme.js` to the service worker pre-cache.
2. Add `data.js` and `niche-data.js` to pre-cache for offline catalog.
3. Consider an install prompt for installability.

---

### Mobile & Responsive — 7.5/10
**Route/Scope**: All pages

**Rationale**: Bottom nav, hamburger menu, swipe-to-close, haptics, touch targets, safe-area, scroll lock when menu open.

**Recommendations** (score < 8):
1. Review card actions on small screens to avoid crowding.
2. Make bottom nav active state clearer.
3. Consider pull-to-refresh where appropriate.

---

### Accessibility — 7/10
**Route/Scope**: All pages

**Rationale**: Skip link, live regions, `aria-label`s, sr-only, focus-visible, ESC support, semantic headings.

**Recommendations** (score < 8):
1. Add `aria-expanded` to expandable search bar.
2. Verify contrast for `--text-muted` and trust badges.
3. Ensure landmarks and heading hierarchy are correct.

---

### Category Pages (Tools, Knowledge, etc.) — 7.5/10
**Route/Scope**: /tools.html, /knowledge.html, /podcasts.html, etc.

**Rationale**: Card grid, skeletons, empty states with Admin links. Custom tools merged, share links, scroll-to-shared.

**Recommendations** (score < 8):
1. Add pagination or virtualization for large lists.
2. Add sort options (rating, level).
3. Match skeleton count to expected item count when possible.

---

### About — 8/10
**Route/Scope**: /about.html

**Rationale**: Clear structure, expertise list, Product Hunt link, consistent with app design.

**Recommendations** (if score < 8): N/A

---

## Top Cross-Cutting Recommendations

1. **Align search page with other cards** — Add full card behavior (ratings, stack, I Use This, Want to Try) to search results, or provide a clear, consistent path to those actions.
2. **Improve auth onboarding** — Document Google client ID setup and clarify session behavior (expiry, "remember me").
3. **Standardize loading states** — Use skeletons and `aria-busy` for featured content, search, and category pages.
4. **Strengthen PWA** — Add `header.js`, `theme.js`, and data files to the service worker pre-cache and consider an install prompt.
5. **Improve form UX** — Add validation feedback, unsaved-changes warnings, and focus management in Admin and Profiles forms.
