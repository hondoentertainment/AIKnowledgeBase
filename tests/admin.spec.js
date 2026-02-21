// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Admin', () => {
  test.describe('Validation', () => {
    test.beforeEach(async ({ page }) => {
      const email = `admin-val-${Date.now()}@test.local`;
      const password = process.env.ADMIN_PASSWORD || 'Test1234';
      await page.goto('/register.html');
      await page.locator('#email').fill(email);
      await page.locator('#password').fill(password);
      await page.locator('#password-confirm').fill(password);
      await page.locator('#register-form').getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/login/, { timeout: 5000 });
      await page.goto('/admin.html');
      await page.locator('#admin-email').fill(email);
      await page.locator('#admin-password').fill(password);
      await page.locator('#admin-login-form').getByRole('button', { name: /log in/i }).click();
      await expect(page.locator('#admin-content')).toBeVisible({ timeout: 8000 });
    });

    test('invalid URL shows inline error on blur', async ({ page }) => {
      await page.locator('#tool-url').fill('not-a-valid-url');
      await page.locator('#tool-url').blur();
      await page.waitForTimeout(100);
      await expect(page.locator('#tool-url-error')).toContainText(/valid URL/i);
      await expect(page.locator('#tool-url')).toHaveAttribute('aria-invalid', 'true');
    });

    test('invalid hex color shows inline error on blur', async ({ page }) => {
      await page.locator('#tool-color1').fill('xyz');
      await page.locator('#tool-color1').blur();
      await page.waitForTimeout(100);
      await expect(page.locator('#tool-color-error')).toContainText(/hex/i);
    });

    test('valid URL clears error', async ({ page }) => {
      await page.locator('#tool-url').fill('not-valid');
      await page.locator('#tool-url').blur();
      await page.waitForTimeout(100);
      await page.locator('#tool-url').fill('https://example.com');
      await page.locator('#tool-url').blur();
      await page.waitForTimeout(100);
      await expect(page.locator('#tool-url-error')).toHaveText('');
    });
  });

  test.describe('Google Client ID settings', () => {
    test('Admin has Google Client ID settings section', async ({ page }) => {
      const email = `admin-gcid-${Date.now()}@test.local`;
      const password = process.env.ADMIN_PASSWORD || 'Test1234';
      await page.goto('/register.html');
      await page.locator('#email').fill(email);
      await page.locator('#password').fill(password);
      await page.locator('#password-confirm').fill(password);
      await page.locator('#register-form').getByRole('button', { name: /create/i }).click();
      await page.goto('/admin.html');
      await page.locator('#admin-email').fill(email);
      await page.locator('#admin-password').fill(password);
      await page.locator('#admin-login-form').getByRole('button', { name: /log in/i }).click();
      await expect(page.locator('#admin-content')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('#google-client-id')).toBeVisible();
      await expect(page.locator('#save-google-client-id')).toBeVisible();
    });
  });
});
