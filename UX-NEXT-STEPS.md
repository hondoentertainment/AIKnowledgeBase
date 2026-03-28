# UX Improvement Recommendations — Next Steps

> Generated: 2026-03-28 | Status: Active

## Executive Summary

Based on a full audit of every page, component, data source, and interaction pattern in AI Knowledge Hub, these are the **prioritized UX improvements** that will have the highest impact on user satisfaction, engagement, and retention.

---

## Priority 1: Immediate (Next 1–2 Weeks)

### 1.1 Faceted Filters & Sorting on Category Pages
**Impact**: High | **Effort**: Medium
- **Problem**: Category pages (tools, knowledge, podcasts, etc.) only have text search. Users can't sort by rating, difficulty level, or filter by tags.
- **Fix**: Add a filter bar above the card grid with:
  - Sort: Highest Rated, Newest, Difficulty (low→high), Alphabetical
  - Filter chips: by tag, by "In My Stack", by "I Use This"
  - Persist last-used filter per category in localStorage
- **Files**: `app.js`, `styles.css`, all category HTML pages

### 1.2 Breadcrumbs & "Back to Hub" Navigation
**Impact**: Medium | **Effort**: Low
- **Problem**: Users on deep pages (niche subcategories, individual tool shares) have no breadcrumb trail. The only way back is the header nav.
- **Fix**: Add contextual breadcrumbs below the header on category/niche pages (e.g., Home → Niche AI → Health). Add a visible "← Back to Hub" link on stack, dashboard, and want-to-try pages.
- **Files**: `header.js` or new `breadcrumbs.js`, category HTML pages

### 1.3 Empty State Improvements
**Impact**: Medium | **Effort**: Low
- **Problem**: My Stack, Want to Try, and Dashboard show minimal guidance when empty. New users see blank pages with no call to action.
- **Fix**: Add illustrated empty states with:
  - Friendly message explaining what the page does
  - Primary CTA: "Browse Tools" or "Start Exploring"
  - Secondary: link to onboarding tour
- **Files**: `stack.html`, `want-to-try.html`, `dashboard.html`, `styles.css`

### 1.4 Card Action Feedback
**Impact**: Medium | **Effort**: Low
- **Problem**: When users add to stack, rate, or mark "I Use This," the only feedback is the button state change. Easy to miss on mobile.
- **Fix**: Show a brief toast notification confirming the action (e.g., "Added to Stack ✓", "Rated 4.5 stars"). Already have `toast.js` — wire it into card interactions.
- **Files**: `card-builder.js`, `toast.js`

---

## Priority 2: Short-Term (Weeks 3–4)

### 2.1 "Continue Where You Left Off" Section on Home
**Impact**: High | **Effort**: Medium
- **Problem**: Returning users land on the same static hero every time. No personalization.
- **Fix**: Below the hero, show a "Welcome back" section with:
  - Recently viewed/rated items (last 5)
  - Quick link to last-visited category
  - Stack count and "new since last visit" count
  - Only shown for returning users (check localStorage activity)
- **Files**: `index.html`, new `recent-activity.js`

### 2.2 Compare Mode for Tools
**Impact**: High | **Effort**: Medium
- **Problem**: Users evaluating similar tools (e.g., Claude vs ChatGPT vs Gemini) have no side-by-side comparison.
- **Fix**: Add a "Compare" button on cards. Selected items (2–4) appear in a comparison tray at the bottom. Tray expands to a comparison table showing: description, tags, your rating, difficulty level, "I Use This" status.
- **Files**: New `comparison-view.js`, `styles.css`, `card-builder.js`

### 2.3 Search Query Suggestions & Recent Searches
**Impact**: Medium | **Effort**: Low
- **Problem**: Search bar has no autocomplete or history. Users must type exact terms.
- **Fix**: Show dropdown with:
  - Recent searches (last 10, stored in localStorage)
  - Popular/suggested searches (hardcoded top 20: "coding assistant", "image generation", "podcast", etc.)
  - Clear recent searches option
- **Files**: `search-page.js`, `search-utils.js`, `styles.css`

### 2.4 Niche AI TOC Mobile Improvements
**Impact**: Medium | **Effort**: Low
- **Problem**: Niche page's sticky TOC (19 categories) overflows on mobile with no horizontal scroll indicator.
- **Fix**: Make TOC horizontally scrollable on mobile with fade edges. Highlight active section on scroll (IntersectionObserver). Add a "Jump to section" dropdown as alternative.
- **Files**: `niche.js`, `styles.css`

---

## Priority 3: Medium-Term (Month 2)

### 3.1 Guided Onboarding Improvements
- Current onboarding tour exists but doesn't ask user preferences (role, interests)
- Add interest selection step → seed personalized "Recommended for You" section
- Track onboarding completion rate

### 3.2 Trust & Freshness Indicators
- Show "Last verified: March 2026" badges on cards
- Flag items not updated in 90+ days with a "May be outdated" indicator
- Add "Source" link type (official, community, editorial)

### 3.3 Shareable Stack Lists
- Generate shareable URL for user's stack (encoded in URL params or short hash)
- Recipient sees read-only view of the stack with one-click import
- Social sharing metadata (OG tags) for shared lists

### 3.4 Keyboard Navigation Overhaul
- Full arrow-key navigation through card grids
- Focus trap in modals and command palette
- Tab order audit across all pages
- Visible focus indicators in both light and dark mode

---

## Priority 4: Long-Term (Month 3+)

### 4.1 Analytics Instrumentation
- Event schema: search queries, card actions, navigation paths, time-on-page
- Funnel tracking: landing → category → card interaction → stack save
- Weekly UX quality dashboard

### 4.2 Performance Budgets
- LCP < 2.0s, INP < 200ms, CLS < 0.05
- Lazy-load card images/icons below the fold
- Virtualize long lists (niche page with 19 sections)

### 4.3 Backend Auth Migration
- Move from localStorage auth to proper backend (HttpOnly cookies)
- Add session management UI, MFA option
- Data sync across devices

### 4.4 AI-Powered Recommendations
- "Because you saved X, you might like Y" rails
- Stack-based affinity scoring
- "Build me a stack for [use case]" conversational feature

---

## UX Quality Metrics to Track

| Metric | Current (Est.) | Target |
|--------|---------------|--------|
| Time to first meaningful action | ~45s | <30s |
| Search-to-save conversion | ~10% | 25%+ |
| Stack items per active user | ~3 | 8+ |
| Return visit rate (7-day) | Unknown | 40%+ |
| Onboarding completion rate | Unknown | 70%+ |
| Cards with user rating | ~5% | 20%+ |
| Mobile task completion | Unknown | 90%+ |

---

## Agent-Automated UX Maintenance

The following agents (defined in `docs/skills/`) run ongoing UX maintenance:

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **UX Audit Agent** | Evaluates pages against UX heuristics, scores issues | On-demand or per-sprint |
| **Content Freshness Agent** | Detects stale data entries, flags outdated items | Weekly or on data.js changes |
| **Accessibility Agent** | Checks WCAG compliance, contrast, ARIA, keyboard nav | Per-PR or on-demand |
| **Performance Agent** | Monitors Core Web Vitals targets, flags regressions | Per-deploy or on-demand |

See `AGENTS.md` and `docs/skills/` for full agent definitions and invocation.
