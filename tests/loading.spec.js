// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Loading states', () => {
  test.describe('Stack page', () => {
    test('stack page clears main-loading after render', async ({ page }) => {
      await page.goto('/stack.html');
      await page.waitForLoadState('networkidle');
      const main = page.locator('#main-content');
      await expect(main).not.toHaveClass(/main-loading/);
      await expect(main).not.toHaveAttribute('aria-busy', 'true');
    });

    test('stack page has tools grid element', async ({ page }) => {
      await page.goto('/stack.html');
      await page.waitForLoadState('networkidle');
      const grid = page.locator('#stack-tools-grid');
      await expect(grid).toBeAttached();
    });
  });

  test.describe('Niche page', () => {
    test('niche page clears main-loading after render', async ({ page }) => {
      await page.goto('/niche.html');
      await page.waitForLoadState('networkidle');
      // Wait for render: taxes-grid or featured-row gets content
      await page.locator('#taxes-grid .card, #taxes-grid .section-empty, .featured-card').first().waitFor({ state: 'attached', timeout: 10000 });
      const main = page.locator('#main-content');
      await expect(main).not.toHaveClass(/main-loading/);
      await expect(main).not.toHaveAttribute('aria-busy', 'true');
    });

    test('niche featured row has loading then content', async ({ page }) => {
      await page.goto('/niche.html');
      await page.waitForLoadState('networkidle');
      const featured = page.locator('#featured-row');
      await expect(featured).not.toHaveAttribute('aria-busy', 'true');
    });
  });

  test.describe('Category pages', () => {
    test('tools page replaces skeletons with cards', async ({ page }) => {
      await page.goto('/tools.html');
      await page.waitForLoadState('networkidle');
      const main = page.locator('#main-content');
      await expect(main).not.toHaveClass(/main-loading/);
      const grid = page.locator('#tools-grid');
      const skeletons = await grid.locator('.card-skeleton').count();
      expect(skeletons).toBe(0);
    });
  });
});
