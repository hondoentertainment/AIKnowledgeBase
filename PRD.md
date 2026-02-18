# Product Requirements Document (PRD)

**Product:** AI Knowledge Hub  
**Version:** 1.1  
**Last updated:** Feb 17, 2026

---

## 1. Vision & Overview

AI Knowledge Hub is a personal dashboard for curating and tracking AI tools, knowledge articles, podcasts, YouTube channels, and training resources. Users can rate items with half-stars, save favorites to a stack, search instantly, and switch between profiles (e.g., Work, Personal).

**Tagline:** Your AI command center — rate what you use, save what matters.

**Target users:** Individuals tracking AI tools and knowledge; product managers, developers, and tech enthusiasts building a personal AI reference library.

---

## 2. Product Scope

### In Scope
- Curated catalog across 7 categories: Tools, Knowledge, Podcasts, YouTube, Training, Daily Watch, Bleeding Edge — plus Niche AI (separate page)
- Star ratings with half-stars, keyboard support, and ARIA announcements
- My Stack (saved favorites), "I Use This," "Want to Try," share links
- Multiple profiles with export/import
- Custom tools via Admin (add, edit, remove)
- Auth (login, register, reset password) — device-only, localStorage
- Responsive design, dark mode, search with `/` shortcut
- PWA with service worker (caching, offline fallback)

### Out of Scope (Current)
- Backend or cloud sync
- Email verification
- Collaborative or multi-user features

---

## 3. Site Rating Audit (Feb 2026)

| Metric | Score |
|--------|-------|
| **Overall** | ~82 / 100 |
| **Target** | 85+ (auth UX, About contact) |

### Feature Ratings

| Feature | Score | Notes |
|---------|-------|------|
| Main Hub | 10/10 | Hero aria-live, featured loading/empty states, 7 categories, search, skip link, E2E tests |
| Star Ratings | 8.5/10 | Half-stars, keyboard, hover preview, live announcements |
| Search | 8/10 | Instant filter, result count, no-results message |
| Auth | 7/10 | Login, register, reset; SHA-256; no backend or email verification |
| Admin | 8.5/10 | Add/edit/remove custom tools, export to data.js |
| Profiles | 8/10 | Multiple profiles, rename, delete, export/import |
| My Stack | 8/10 | Aggregates across categories, search, empty state |
| Share / Deep Links | 8/10 | Clipboard fallback, scroll-to-card for shared items |
| Design System | 8.5/10 | Crimson Pro + DM Sans, warm palette, dark mode |
| Accessibility | 8/10 | Skip link, focus styles, ARIA, keyboard support |
| PWA / Mobile | 8.5/10 | manifest.json, service worker, caching, offline fallback, ~44px touch targets |
| About Page | 7.5/10 | Structure, expertise, app links, Product Hunt; optional: contact info |

### Strengths
- Main hub (10/10): hero aria-live, featured loading states, E2E test suite
- Star ratings, design system
- Clear UX, good accessibility
- PWA with service worker and offline support
- Admin full CRUD for custom tools

### Needs Improvement
- Auth model (no backend, limited verification)
- About page (optional: explicit contact info)

---

## 4. Roadmap & Priorities

### P0 — Must Have (reach ~85 score)
1. ~~**Service worker**~~ — Done: caching, offline fallback
2. ~~**Admin: Edit custom tools**~~ — Done: full CRUD for custom tools
3. **About page upgrade** — Mostly done (structure, expertise, links); optional: contact info

### P1 — Should Have
4. **Auth UX improvements** — Stronger password rules, clearer feedback for login/register
5. **Centralize theme/auth logic** — Shared modules to reduce duplication across pages

### P2 — Nice to Have
6. **Search enhancements** — Fuzzy matching, query highlighting
7. **Optional backend sync** — If/when needed for cross-device use
8. **Basic email verification** — If auth scope expands
9. **Admin URL validation** — Optional validation for custom tool URLs

---

## 5. Success Metrics

- Overall audit score: ~82 → 85+
- PWA: installable, basic offline use — Done
- Core flows (rate, stack, search, share) remain fast and accessible
- Admin: full CRUD for custom tools — Done

---

## 6. Technical Constraints

- Static site; no build step
- Deployable to GitHub Pages, Vercel, Netlify
- Auth: device-only (localStorage), SHA-256 hashing

---

## 7. Open Questions

- Backend sync: when/if to add?
- Email verification: required for which flows?
- Niche AI: kept as separate nav page (current: niche.html)

---

*For feature development pipeline, see [AGENTS.md](AGENTS.md).*
