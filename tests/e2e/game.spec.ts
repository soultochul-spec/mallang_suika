import { expect, test } from '@playwright/test';

test('renders and accepts pointer and keyboard drops', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '말랑 수박 합체' })).toBeVisible();
  await expect(page.locator('.game-canvas')).toBeVisible();
  await page.locator('.game-canvas').click({ position: { x: 180, y: 80 } });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  await page.keyboard.press('Space');
  await expect(page.getByText('다음 과일')).toBeVisible();
  await expect(page.getByText('점수', { exact: true })).toBeVisible();
});

test('fits the board within a mobile viewport', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('.game-canvas').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});
