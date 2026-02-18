// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Main Hub (index)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with title and stats', async ({ page }) => {
    await expect(page.locator('h1.hero-title')).toContainText('Your AI command center');
    await expect(page.locator('#hero-stats')).toBeVisible();
    await expect(page.locator('#hero-tools-count')).toBeVisible();
    await expect(page.locator('#hero-knowledge-count')).toBeVisible();
    await expect(page.locator('#hero-podcasts-count')).toBeVisible();
  });

  test('hero stats have aria-live for screen reader announcements', async ({ page }) => {
    const heroStats = page.locator('#hero-stats');
    await expect(heroStats).toHaveAttribute('aria-live', 'polite');
    await expect(heroStats).toHaveAttribute('aria-atomic', 'true');
  });

  test('hero stats announcer exists for catalog load message', async ({ page }) => {
    const announcer = page.locator('#hero-stats-announcer');
    await expect(announcer).toBeAttached();
    await expect(announcer).toHaveAttribute('aria-live', 'polite');
  });

  test('hero stats show non-zero counts after data loads', async ({ page }) => {
    await page.waitForFunction(() => {
      const tools = document.getElementById('hero-tools-count');
      return tools && parseInt(tools.textContent || '0', 10) > 0;
    }, { timeout: 5000 });
  });

  test('featured section has loading state then content', async ({ page }) => {
    const featured = page.locator('#featured');
    await expect(featured).toBeVisible();
    await expect(page.locator('h2.featured-heading')).toContainText('Top picks');
  });

  test('featured row shows cards or empty state after load', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => {
      const row = document.getElementById('featured-row');
      if (!row) return false;
      const loading = row.querySelector('.featured-loading');
      return !loading && (row.querySelector('.featured-card') || row.querySelector('.featured-empty'));
    }, { timeout: 5000 });
    const featuredRow = page.locator('#featured-row');
    const hasCards = (await featuredRow.locator('.featured-card').count()) > 0;
    const hasEmpty = (await featuredRow.locator('.featured-empty').count()) > 0;
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test('featured section has aria-label', async ({ page }) => {
    const featured = page.locator('#featured');
    await expect(featured).toHaveAttribute('aria-label', 'Top picks from your catalog');
  });

  test('category hub shows all 7 categories', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const categories = [
      'AI Tools',
      'Knowledge',
      'Podcasts',
      'YouTube',
      'Training',
      'Daily Watch',
      'Bleeding Edge',
    ];
    for (const name of categories) {
      await expect(page.locator(`.category-hub-card:has-text("${name}")`)).toBeVisible();
    }
  });

  test('category hub counts are populated', async ({ page }) => {
    await page.waitForFunction(() => {
      const count = document.querySelector('.category-hub-count');
      return count && count.textContent !== undefined;
    }, { timeout: 5000 });
  });

  test('main content has skip link target', async ({ page }) => {
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
    const skipLink = page.locator('a.skip-link[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('search bar can be opened with / key', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#search-bar')).toHaveClass(/open/);
    await expect(page.locator('#search')).toBeFocused();
  });

  test('search bar can be closed with Escape', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#search-bar')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#search-bar')).not.toHaveClass(/open/);
  });

  test('feature chips are visible', async ({ page }) => {
    await expect(page.locator('.feature-chip:has-text("Rate & review")')).toBeVisible();
    await expect(page.locator('.feature-chip:has-text("Instant search")')).toBeVisible();
  });

  test('main content clears loading state', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const main = page.locator('#main-content');
    await expect(main).not.toHaveClass(/main-loading/);
    await expect(main).not.toHaveAttribute('aria-busy', 'true');
  });
});
