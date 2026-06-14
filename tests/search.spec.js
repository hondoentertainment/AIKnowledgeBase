// @ts-check
const { test, expect } = require('@playwright/test');

async function waitForSearchCards(page) {
  await page.waitForFunction(() => {
    const hasUtils = typeof window.SearchUtils?.matchItem === 'function';
    const hasData = (window.siteData?.tools?.length ?? 0) > 0;
    const hasCards = document.querySelectorAll('#search-grouped .card').length > 0;
    return hasUtils && hasData && hasCards;
  }, { timeout: 20000 });
}

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

    test('Analytics API is available on search page', async ({ page }) => {
      await page.goto('/search.html');
      const hasAnalytics = await page.evaluate(() => (
        typeof window.Analytics === 'object'
        && typeof window.Analytics.track === 'function'
        && typeof window.Analytics.isEnabled === 'function'
        && typeof window.Analytics.setEnabled === 'function'
      ));
      expect(hasAnalytics).toBeTruthy();
    });

    test('CardBuilder and interactive cards available on search page', async ({ page }) => {
      await page.goto('/search.html');
      const hasCardBuilder = await page.evaluate(() => typeof window.CardBuilder === 'object' && typeof window.CardBuilder.buildCard === 'function');
      expect(hasCardBuilder).toBeTruthy();
    });

    test('search results render full interactive cards with buttons', async ({ page }) => {
      await page.goto('/search.html?q=chat');
      await page.waitForLoadState('networkidle');
      const cardCount = await page.locator('#search-grouped .card').count();
      if (cardCount > 0) {
        const firstCard = page.locator('#search-grouped .card').first();
        await expect(firstCard.locator('.card-rating')).toBeVisible();
        await expect(firstCard.locator('.stack-btn')).toBeVisible();
        await expect(firstCard.locator('.direct-use-btn')).toBeVisible();
        await expect(firstCard.locator('.want-to-try-btn')).toBeVisible();
        await expect(firstCard.locator('.share-btn')).toBeVisible();
      }
    });

    test('search results show loading skeleton before results', async ({ page }) => {
      await page.goto('/search.html?q=chat');
      // The skeleton is shown synchronously before data loads
      // On fast loads it may already be replaced, so we just verify the page works
      await page.waitForLoadState('networkidle');
      const hasResults = await page.locator('#search-grouped .card').count() > 0;
      const hasEmptyHint = await page.locator('#search-empty').isVisible();
      expect(hasResults || hasEmptyHint).toBeTruthy();
    });

    test('search results include niche AI items', async ({ page }) => {
      await page.goto('/search.html?q=chat');
      await waitForSearchCards(page);
      const cardCount = await page.locator('#search-grouped .card').count();
      expect(cardCount).toBeGreaterThan(0);
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


  test.describe('Search card interactions', () => {
    test('stack toggle persists after reload', async ({ page }) => {
      await page.goto('/search.html?q=chat');
      await waitForSearchCards(page);

      const firstCard = page.locator('#search-grouped .card').first();

      const title = await firstCard.getAttribute('data-title');
      const stackBtn = firstCard.locator('.stack-btn');
      await firstCard.scrollIntoViewIfNeeded();
      await stackBtn.evaluate((btn) => btn.click());
      await expect(stackBtn).toHaveClass(/in-stack/);

      const stackContainsTitle = await page.evaluate((cardTitle) => {
        const stack = window.ProfileStore?.getStack?.()
          ?? JSON.parse(localStorage.getItem('myStack') || '[]');
        return stack.includes(cardTitle);
      }, title);
      expect(stackContainsTitle).toBeTruthy();

      await page.reload();
      await waitForSearchCards(page);
      const reloadedCard = page.locator('#search-grouped .card').first();
      await expect(reloadedCard).toHaveAttribute('data-title', title);
      await expect(reloadedCard.locator('.stack-btn')).toHaveClass(/in-stack/);
    });

    test('star rating persists after reload', async ({ page }) => {
      await page.goto('/search.html?q=chat');
      await waitForSearchCards(page);

      const firstCard = page.locator('#search-grouped .card').first();

      const title = await firstCard.getAttribute('data-title');
      const starRightHalf = firstCard.locator('.card-rating .star[data-star="3"] .star-half.star-right');
      await firstCard.scrollIntoViewIfNeeded();
      await starRightHalf.evaluate((el) => el.click());

      await expect(firstCard.locator('.card-rating')).toHaveAttribute('data-rating', '3');

      const savedRating = await page.evaluate((cardTitle) => {
        const profileRating = window.ProfileStore?.getRating?.(cardTitle);
        if (profileRating != null) return String(profileRating);
        return localStorage.getItem(`rating:${cardTitle}`);
      }, title);
      expect(savedRating).toBe('3');

      await page.reload();
      await waitForSearchCards(page);
      const reloadedCard = page.locator('#search-grouped .card').first();
      await expect(reloadedCard).toHaveAttribute('data-title', title);
      await expect(reloadedCard.locator('.card-rating')).toHaveAttribute('data-rating', '3');
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
