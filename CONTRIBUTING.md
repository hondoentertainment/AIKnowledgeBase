# Contributing to AI Knowledge Hub

Thanks for your interest in contributing. This document covers how to run the app locally, add content, run tests, and submit changes.

## Quick Start

### Run locally

```bash
npm install
npm run serve
```

Open http://localhost:3000 in your browser.

### Run tests

```bash
npm run test
```

Runs Playwright E2E tests. Requires Chromium: `npx playwright install chromium` if not already installed.

```bash
npm run test:ui    # Interactive test runner
npm run test:headed # Run with browser visible
```

## Adding Content

### Via data files

1. **Main catalog** — Edit `data.js` to add tools, knowledge, podcasts, etc.
2. **Niche AI** — Edit `niche-data.js` for the Niche AI category.

Each item supports:

- `title` — Name
- `description` — Short summary
- `url` — Link (use `#` if none)
- `tags` — Array of tags for search
- `icon` — Emoji (optional)
- `color` — `[hexFrom, hexTo]` for card gradient
- `level` — 1–10 (difficulty)
- `freq` — Output frequency (e.g. "Daily", "Weekly")

See `data.example.js` for the schema.

### Via Admin UI

1. Log in at `admin.html`
2. Add custom tools via the form
3. Use "Export for data.js" to copy entries for permanent inclusion in `data.js`

## Code Style

- Use semantic HTML and ARIA where appropriate
- Prefer vanilla JS; no build step required
- Keep styles in `styles.css` or page-specific `*.css`
- Scripts load in order; ensure dependencies are available before use

## Pull Requests

1. Create a branch from `main`
2. Make changes and run `npm run test`
3. Open a PR with a clear description
4. Tests must pass before merge

## Project Structure

- `*.html` — Pages (index, tools, search, stack, admin, etc.)
- `*.js` — Scripts (`app.js`, `auth.js`, `card-builder.js`, `header.js`, etc.)
- `styles.css` — Main stylesheet
- `sw.js` — Service worker for PWA
- `tests/` — Playwright E2E tests

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture notes.
