// @ts-check
const { test, expect } = require('@playwright/test');

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
