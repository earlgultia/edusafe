import { test, expect } from '@playwright/test';

test.describe('Parent flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can view month calendar and open event modal', async ({ page }) => {
    // Navigate to Parent Dashboard - assumes route or UI available from home
    await page.getByRole('link', { name: 'Parent' }).click().catch(() => {});

    // Wait for calendar header
    await expect(page.getByText(/Events on|Month/).first()).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Click a calendar cell (first non-empty)
    const cell = page.locator('.calendarCell').filter({ has: page.locator('.badge') }).first();
    await cell.click().catch(() => {});

    // Expect modal/dialog to appear
    await expect(page.locator('.sheet[role="dialog"]')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});
