# Architecture Overview

AI Knowledge Hub is a static, multi-page web app. No build step; deployable to GitHub Pages, Vercel, or any static host.

## Data Flow

### Data sources

| Source | Purpose | Storage |
|--------|---------|---------|
| `data.js` | Main catalog: tools, knowledge, podcasts, youtube, training, dailyWatch, bleedingEdge | File (or generated via `extend-data.js`) |
| `niche-data.js` | Niche AI categories (19 sections) | File |
| `localStorage` | Custom tools (Admin), auth session, profiles, ratings, stack, I Use This, Want to Try | Browser |

### Merging

- **Category pages** (`tools.html`, etc.): `siteData[category]` + `customTools[category]`
- **Search** (`search-page.js`): All items from `siteData`, `nicheData`, and `customTools`, grouped by category
- **Stack** (`stack.js`): Items whose `title` is in the profile's stack array
- **Profiles** (`profiles.js`): Each profile stores its own ratings, stack, directUse, wantToTry

### Profile store

`profiles.js` provides `ProfileStore` (or falls back to `localStorage` directly when no profile system). Keys like `rating:<title>`, `myStack`, `directUse`, `wantToTry` are profile-scoped when a profile is active.

## Modules

| Module | Purpose |
|--------|---------|
| `header.js` | Shared topbar: nav, search toggle, theme, auth UI, profile switcher |
| `theme.js` | Light/dark theme toggle, `prefers-color-scheme`, persistence |
| `auth.js` | Login, register, logout, session, password reset, Google OAuth, session expiry |
| `profiles.js` | Create/switch/rename/delete profiles, backup/restore, profile-scoped data |
| `profile-switcher.js` | Dropdown UI for profile selection |
| `app.js` | Category page logic: render cards, featured row, scroll-to-shared |
| `card-builder.js` | Shared card HTML (stars, stack, I Use This, Want to Try, share) and interaction init |
| `search-utils.js` | Search matching, recent/popular suggestions |
| `search-page.js` | Cross-category search, grouped results, suggestions |
| `stack.js` | My Stack aggregation, in-page search |
| `niche.js` | Niche AI page, sticky TOC, section rendering |
| `mobile-ux.js` | Haptics, swipe, touch helpers |
| `bottom-nav.js` | Mobile bottom nav, more menu |
| `pwa-install.js` | `beforeinstallprompt`, install banner |
| `sw.js` | Service worker: pre-cache, runtime cache, offline fallback |

## Pages

- **index.html** — Home hub, hero, featured row, category grid
- **tools.html**, **knowledge.html**, etc. — Category pages (same pattern)
- **search.html** — Cross-category search with full interactive cards
- **stack.html** — My Stack
- **profiles.html** — Profile management
- **admin.html** — Add/edit custom tools (admin only), Google Client ID, export
- **niche.html** — Niche AI by section
- **login.html**, **register.html**, **forgot-password.html**, **reset-password.html** — Auth flows

## PWA

- **manifest.json** — App name, icons, theme-color, display
- **sw.js** — Installs and activates; caches HTML, CSS, JS, data files; offline fallback for documents
- **pwa-install.js** — Listens for `beforeinstallprompt`, shows dismissible install banner after criteria met

## Script Load Order

Pages load scripts in dependency order. Typical sequence:

1. `header.js`, `theme.js`, `mobile-ux.js`
2. `auth.js`, `profiles.js` (when needed)
3. `data.js`, `niche-data.js` (when needed)
4. `search-utils.js`, `card-builder.js`, `app.js` (or `search-page.js`, `stack.js`, `niche.js`)
5. `profile-switcher.js`, `bottom-nav.js`, `pwa-install.js`
6. Service worker registration

## Custom Tools

Admin adds tools to `localStorage.customTools` keyed by category. Export copies JSON that can be pasted into `data.js` for permanent inclusion. Custom tools are merged with `siteData` on each category and search render.
