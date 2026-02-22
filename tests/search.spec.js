// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Search', () => {
  test.describe('Search results page', () => {
    test('search page loads', async ({ page }) => {
      await page.goto('/search.html');
      await expect(page.locator('#search')).toBeVisible();
      await expect(page.locator('#search-results-container')).toBeVisible();
    });

    test('search page with query shows results or empty state', async ({ page }) => {
      await page.goto('/search.html?q=chat');
      await page.waitForLoadState('networkidle');
      const hasResults = await page.locator('#search-grouped .card').count() > 0;
      const hasEmptyHint = await page.locator('#search-empty').isVisible();
      expect(hasResults || hasEmptyHint).toBeTruthy();
    });

    test('CardBuilder and interactive cards available on search page', async ({ page }) => {
      await page.goto('/search.html');
      const hasCardBuilder = await page.evaluate(() => typeof window.CardBuilder === 'object' && typeof window.CardBuilder.buildCard === 'function');
      expect(hasCardBuilder).toBeTruthy();
    });

    test('empty query shows hint', async ({ page }) => {
      await page.goto('/search.html');
      await expect(page.locator('#search-empty')).toContainText('Enter a search term');
    });

    test('search bar accepts / shortcut to focus', async ({ page }) => {
      await page.goto('/search.html');
      await page.keyboard.press('/');
      await expect(page.locator('#search')).toBeFocused();
    });
  });

  test.describe('Hub search redirect', () => {
    test('hub: Enter with query navigates to search page', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('/');
      await expect(page.locator('#search-bar')).toHaveClass(/open/);
      await page.locator('#search').fill('claude');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/search/);
    });
  });

  test.describe('Category page search', () => {
    test('tools page: search filters cards with multi-term matching', async ({ page }) => {
      await page.goto('/tools.html');
      await page.waitForLoadState('networkidle');
      await page.keyboard.press('/');
      await page.locator('#search').fill('chat gpt');
      await page.waitForTimeout(200);
      const chatGPTCard = page.locator('.card[data-title="ChatGPT"]');
      await expect(chatGPTCard).not.toHaveClass(/hidden/, { timeout: 3000 });
    });

    test('tools page: search shows result count in aria-live', async ({ page }) => {
      await page.goto('/tools.html');
      await page.waitForLoadState('networkidle');
      await page.keyboard.press('/');
      await page.locator('#search').fill('coding');
      await page.waitForTimeout(200);
      const resultsEl = page.locator('#search-results');
      await expect(resultsEl).not.toHaveText('');
    });
  });

  test.describe('Search suggestions', () => {
    test('focusing empty search shows recent or popular suggestions', async ({ page }) => {
      await page.goto('/search.html');
      await page.locator('#search').focus();
      await page.waitForTimeout(150);
      const hasPopular = await page.locator('.search-suggestions-label').filter({ hasText: 'Popular' }).first().isVisible();
      expect(hasPopular).toBeTruthy();
    });

    test('ArrowDown focuses first suggestion', async ({ page }) => {
      await page.goto('/search.html');
      await page.locator('#search').focus();
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
      const focused = await page.evaluate(() => document.activeElement?.classList?.contains('search-suggestion'));
      expect(focused).toBeTruthy();
    });

    test('ArrowDown then Enter activates suggestion when suggestions visible', async ({ page }) => {
      await page.goto('/search.html');
      await page.locator('#search').focus();
      await page.waitForTimeout(250);
      const suggestionCount = await page.locator('.search-suggestion').count();
      if (suggestionCount > 0) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(80);
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/search/, { timeout: 5000 });
      }
    });
  });
});
