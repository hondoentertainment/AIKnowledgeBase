# Test Suite

## Main Hub E2E Tests

Playwright E2E tests for the Main Hub (index.html).

### Run tests

```bash
npm run test
```

Or with UI:

```bash
npm run test:ui
```

### Coverage

- Hero section: title, stats, aria-live regions
- Featured row: loading message, cards/empty state, aria-label
- Category hub: 7 categories, counts
- Search: `/` to open, Escape to close
- Accessibility: skip link, main content loading state
- Feature chips visibility

### Requirements

- Node.js and npm
- Playwright Chromium: `npx playwright install chromium`
- Tests start a static server on port 3847 (or use `PLAYWRIGHT_BASE_URL` if app is already served)
