// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Auth', () => {
  test.describe('Login page', () => {
    test('login page has clear Google setup instructions', async ({ page }) => {
      await page.goto('/login.html');
      await expect(page.locator('.auth-google-setup')).toContainText(/admin/i);
      await expect(page.locator('.auth-google-setup a[href="admin.html"]')).toBeVisible();
    });

    test('login page shows local/demo mode notice', async ({ page }) => {
      await page.goto('/login.html');
      await expect(page.locator('.auth-local-notice')).toContainText(/local|demo/i);
      await expect(page.locator('.auth-local-notice')).toContainText(/device only|stored on this device/i);
      await expect(page.locator('.auth-local-notice a[href="auth-setup.html#architecture"]')).toBeVisible();
    });
  });

  test.describe('Register page', () => {
    test('register page shows local/demo mode notice', async ({ page }) => {
      await page.goto('/register.html');
      await expect(page.locator('.auth-local-notice')).toContainText(/local|demo/i);
      await expect(page.locator('.auth-local-notice')).toContainText(/device only|stored on this device/i);
    });
  });

  test.describe('Session expiry', () => {
    test('session expiry note element exists when logged in', async ({ page }) => {
      const email = `auth-test-${Date.now()}@test.local`;
      const password = 'Test1234';
      await page.goto('/register.html');
      await page.locator('#email').fill(email);
      await page.locator('#password').fill(password);
      await page.locator('#password-confirm').fill(password);
      await page.locator('#register-form').getByRole('button', { name: /create/i }).click();
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
      await page.locator('#email').fill(email);
      await page.locator('#password').fill(password);
      await page.locator('#login-form').getByRole('button', { name: /log in/i }).click();
      await expect(page).not.toHaveURL(/login/);
      const expiryNote = page.locator('#session-expiry-note');
      await expect(page.locator('#auth-user-wrap')).toBeVisible();
      expect(await expiryNote.count()).toBe(1);
    });
  });
});
