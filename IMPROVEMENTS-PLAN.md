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

---

## Recommended Next Steps (Priority Order)

### Next 48 Hours
1. **Ship Search full interactive cards first** (Section 1) because this is the most visible UX gap and improves discovery + conversion to saved actions.
2. **Add baseline regression checks** for search interactions (stack toggle, rating persistence) before additional UI work.

### This Week
1. **Implement Admin inline validation + unsaved-change protection** (Section 3) to prevent data-entry errors and accidental loss.
2. **Add session expiry messaging** from Auth work (Section 2) so active users are warned before silent sign-out.

### Next Sprint
1. **Complete Google Client ID setup UX in Admin** (Section 2) and remove console-driven setup language from auth pages.
2. **Finish PWA install prompt flow + cache audit** (Section 4) once core interaction work is stable.

### Success Metrics to Track
- Search result card action rate (stack/use/try clicks) increases week-over-week.
- Admin form submission error rate drops after inline validation.
- Auth-related support issues decrease after expiry messaging + setup UX improvements.
- Install prompt acceptance rate and repeat-visit retention improve after PWA work ships.


---

## World-Class Roadmap (What to Change Next)

### 1) Product Experience Excellence
- Define **top 3 user jobs** (discover, evaluate, save/organize) and map every page to one primary job.
- Add a first-run onboarding flow (30–60 sec) that asks goals/role and seeds personalized recommendations.
- Introduce “Why this is recommended” explanations on cards to improve trust and decision speed.
- Add a **compare mode** for tools/learning resources (features, pricing, ideal use cases).
- Add frictionless “continue where I left off” states across sessions.

### 2) Information Architecture & Discovery
- Build a unified taxonomy (topic, use case, audience, cost, difficulty, freshness, credibility).
- Add faceted filters + sorting (newest, most used, highest rated, fastest to learn).
- Add query suggestions with intent categories (“learn”, “build”, “automate”, “research”).
- Add saved searches and alerting for newly added matching resources.

### 3) Personalization & Intelligence
- Move from static ranking to hybrid ranking (keyword + profile + behavior signals).
- Add “Because you viewed/saved/rated X” recommendation rails.
- Add quality scores to content (freshness, source trust, user usefulness).
- Add optional AI assistant for guided exploration (“build me a stack for X”).

### 4) Trust, Quality, and Editorial System
- Add source provenance on every item (publisher, last verified date, evidence type).
- Add stale-content detection and editorial review queues.
- Add community feedback loops: report outdated info, suggest alternatives, quality voting.
- Publish transparent curation criteria and scoring rubric.

### 5) Collaboration & Network Effects
- Add shareable curated lists/stacks with public or private visibility.
- Add team workspaces with role-based permissions and shared collections.
- Add comments/notes on saved resources for team context.
- Add import/export integrations (Notion, CSV, browser bookmarks).

### 6) UX Polish & Accessibility (A11y) at AAA-minded Quality
- Complete keyboard-first interactions across all controls and dialogs.
- Improve focus order, visible focus styles, and live-region announcements.
- Validate contrast and dark-mode parity for all states.
- Add motion-reduction support and resilient touch targets for mobile.

### 7) Performance & Reliability Targets
- Set SLOs: LCP < 2.0s, INP < 200ms, CLS < 0.05 on mobile median.
- Add route-level code splitting and asset budget enforcement.
- Add stale-while-revalidate caching strategy for content feeds.
- Add robust offline fallback behaviors beyond shell caching.

### 8) Security, Privacy, and Account Maturity
- Add secure backend auth/session model (HttpOnly cookies, revocation, rotation).
- Add optional MFA and session/device management UI.
- Add audit logs for admin changes and configuration updates.
- Add privacy controls (data export/delete, profile reset, clear personalization).

### 9) Analytics, Experimentation, and Decision Discipline
- Define a product KPI tree: activation, retained usage, depth of engagement, contribution rate.
- Instrument event schema for search intent, card actions, save success, return behavior.
- Add experiment framework (A/B or feature flag rollouts) for discovery/ranking changes.
- Create weekly UX quality review using funnels + session replay + feedback tags.

### 10) Developer Experience & Delivery Velocity
- Add CI quality gates: lint, unit, integration, E2E smoke, Lighthouse budget checks.
- Add preview environments per PR and visual regression snapshots.
- Add schema/data validation for catalog entries to prevent broken content cards.
- Add playbooks for incidents, rollback, and release quality checks.

### 11) World-Class Success Benchmarks
- Time-to-first-value under 2 minutes for new users.
- +30% improvement in search-to-save conversion.
- +25% increase in weekly return rate for activated users.
- <1% broken/outdated item reports per active month.
- P95 task completion time reduced across top 5 journeys.

### 12) 30/60/90 Day Execution Plan
**30 days**
- Ship taxonomy + filters v1, onboarding v1, analytics instrumentation baseline, and top-priority accessibility fixes.

**60 days**
- Ship personalization rails, compare mode, trust metadata, and stronger caching/performance improvements.

**90 days**
- Ship collaboration features, experiment platform, admin auditability, and mature reliability/security controls.
