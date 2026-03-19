// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('UX Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('command palette opens with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.locator('.cp-overlay')).toHaveClass(/cp-open/);
    await expect(page.locator('.cp-input')).toBeFocused();
  });

  test('command palette closes with Escape', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.locator('.cp-overlay')).toHaveClass(/cp-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.cp-overlay')).not.toHaveClass(/cp-open/);
  });

  test('command palette shows results when typing', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.locator('.cp-input').fill('tools');
    const results = page.locator('.cp-result');
    await expect(results.first()).toBeVisible();
  });

  test('keyboard shortcuts help opens with ?', async ({ page }) => {
    await page.keyboard.press('?');
    await expect(page.locator('.ks-overlay')).toHaveClass(/ks-open/);
  });

  test('keyboard shortcuts help closes with Escape', async ({ page }) => {
    await page.keyboard.press('?');
    await expect(page.locator('.ks-overlay')).toHaveClass(/ks-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.ks-overlay')).not.toHaveClass(/ks-open/);
  });

  test('CommandPalette global is defined', async ({ page }) => {
    const has = await page.evaluate(() => typeof window.CommandPalette === 'object');
    expect(has).toBeTruthy();
  });

  test('KeyboardShortcuts global is defined', async ({ page }) => {
    const has = await page.evaluate(() => typeof window.KeyboardShortcuts === 'object');
    expect(has).toBeTruthy();
  });

  test('Gamification global is defined', async ({ page }) => {
    const has = await page.evaluate(() => typeof window.Gamification === 'object');
    expect(has).toBeTruthy();
  });

  test('Recommendations global is defined', async ({ page }) => {
    const has = await page.evaluate(() => typeof window.Recommendations === 'object');
    expect(has).toBeTruthy();
  });

  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard.html');
    await expect(page.locator('.dash-title')).toContainText('Your Dashboard');
    await expect(page.locator('.dash-stats-grid')).toBeVisible();
  });

  test('dashboard shows achievement grid', async ({ page }) => {
    await page.goto('/dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const grid = page.locator('#dash-achievements-grid');
    await expect(grid).toBeAttached();
  });
});

test.describe('Category Page Filters', () => {
  test('tools page has filter toggle button', async ({ page }) => {
    await page.goto('/tools.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    const filterBtn = page.locator('.af-toggle');
    await expect(filterBtn).toBeVisible();
  });

  test('filter panel opens when toggle clicked', async ({ page }) => {
    await page.goto('/tools.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    await page.locator('.af-toggle').click();
    await expect(page.locator('.af-panel')).toBeVisible();
  });

  test('comparison button exists on tool cards', async ({ page }) => {
    await page.goto('/tools.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const cmpBtn = page.locator('.cmp-add-btn').first();
    await expect(cmpBtn).toBeAttached();
  });
});
