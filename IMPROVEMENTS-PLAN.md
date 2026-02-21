# UX Improvements Plan

## 1. Search Results — Full Interactive Cards

### Breakdown
- **Current**: Search results render simple link cards; no ratings, stack, I Use This, Want to Try.
- **Target**: Reuse category-page card structure with star ratings, Add to Stack, I Use This, Want to Try, Share.
- **Approach**: Extract shared card HTML builder and interaction init into `card-builder.js`. Search page loads it and renders full cards; after render, call `CardBuilder.initInteractions(container)`.

### Tasks
1. Create `card-builder.js` with `buildFullCard(item, category)` and `initInteractions(container)`.
2. Refactor `app.js` to use `CardBuilder` instead of inline buildCard.
3. Update `search-page.js` to use `CardBuilder.buildFullCard` and call `initInteractions` after render.
4. Load `card-builder.js`, `profiles.js`, `data.js` on search page (already has profiles, data, niche-data).
5. Add `app.js` to search page only for card interactions — OR include card-builder as standalone (preferred).

### Files
- New: `card-builder.js`
- Modify: `app.js`, `search-page.js`, `search.html`

---

## 2. Auth — Google Client ID & Session Expiry

### Breakdown
- **Current**: Google setup is console-only; no session expiry notice.
- **Target**: Clear setup UI (e.g. in Admin after login); show session expiry when close to 7-day limit.

### Tasks
1. Add session expiry check in header/auth area — show "Session expires in X days" when &lt; 2 days left.
2. Add Google Client ID config in Admin (admin-only): input field, save to localStorage.
3. Update login/register pages: replace console instructions with link to Admin or inline friendly note.
4. Export `Auth.getSessionExpiryInfo()` for expiry messaging.

### Files
- Modify: `auth.js`, `login.html`, `register.html`, `admin.html`, `header.js`

---

## 3. Admin — Validation & Unsave Changes

### Breakdown
- **Current**: URL/hex validated only on submit; no beforeunload when form is dirty.
- **Target**: Inline validation (on blur/input); beforeunload when dirty; focus management.

### Tasks
1. Add `aria-describedby` and inline error spans for URL and color fields.
2. Validate URL on blur; validate hex on blur or input. Show inline error text.
3. Track `formDirty` on input change; `beforeunload` when dirty.
4. Reset `formDirty` on successful submit and cancel. Add `formDirty` variable (admin already has it in submit handler — wire it to inputs and beforeunload).

### Files
- Modify: `admin.html` (inline script)

---

## 4. PWA — Caching & Install Prompt

### Breakdown
- **Current**: sw.js caches many assets but may miss some; no install prompt.
- **Target**: Ensure all critical assets pre-cached; add deferred install prompt when criteria met.

### Tasks
1. Bump `CACHE_NAME`; verify ASSETS list includes all HTML, JS, CSS, manifest.
2. Add `profile-switcher.js` to ASSETS if missing.
3. Create `pwa-install.js`: listen for `beforeinstallprompt`, store event, show custom install banner/modal when appropriate.
4. Add install banner UI (dismissible) on index or after first meaningful interaction.

### Files
- Modify: `sw.js`, `manifest.json` (if needed)
- New: `pwa-install.js`
- Modify: `index.html` (or shared layout)

---

## 5. Test Cases

### Search interactive cards
- Search returns cards with `.card-rating`, `.stack-btn`, `.direct-use-btn`, `.want-to-try-btn`.
- Clicking stack toggles in/out of stack.
- Star rating updates and persists.

### Auth
- Session expiry message appears when session &lt; 2 days.
- Google Client ID can be set from Admin.

### Admin
- Invalid URL shows inline error.
- Invalid hex shows inline error.
- beforeunload fires when form dirty and user navigates.

### PWA
- Service worker pre-caches critical assets.
- Install prompt stored and can be triggered.
