// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Offline', () => {
  test('offline banner appears when connection is lost', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.locator('#offline-banner')).toBeAttached();
    await expect(page.locator('#offline-banner')).not.toHaveClass(/visible/);
    await context.setOffline(true);
    await page.waitForTimeout(100);
    await expect(page.locator('#offline-banner')).toHaveClass(/visible/);
    await expect(page.locator('#offline-banner')).toContainText(/offline/i);
    await context.setOffline(false);
    await page.waitForTimeout(150);
    await expect(page.locator('#offline-banner')).not.toHaveClass(/visible/);
  });
});

test.describe('PWA', () => {
  test('install banner element exists on index', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#pwa-install-banner')).toBeAttached();
    await expect(page.locator('#pwa-install-banner [data-pwa-install]')).toBeAttached();
    await expect(page.locator('#pwa-install-banner [data-pwa-dismiss]')).toBeAttached();
  });

  test('PWAInstall is defined', async ({ page }) => {
    await page.goto('/');
    const hasPWAInstall = await page.evaluate(() => typeof window.PWAInstall === 'object');
    expect(hasPWAInstall).toBeTruthy();
  });

  test('manifest is loadable', async ({ page }) => {
    const res = await page.goto('/manifest.json');
    expect(res?.status()).toBe(200);
    const json = await res?.json();
    expect(json?.name).toBe('AI Knowledge Hub');
    expect(json?.short_name).toBeDefined();
  });
});
