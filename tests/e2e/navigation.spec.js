const { test, expect } = require('@playwright/test');

test('loads the home page and primary navigation', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /Plan your NUS degree, visually/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'My Tree', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore', exact: true })).toBeVisible();
});

test('opens the Explore gallery', async ({ page }) => {
  await page.goto('/Explore');

  await expect(
    page.getByRole('heading', { name: 'Explore Study Plans' }),
  ).toBeVisible();
  await expect(page.getByText('BComp AI Pathway')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'View Template' }).first(),
  ).toBeVisible();
});

test('opens the Tree workspace controls', async ({ page }) => {
  await page.goto('/Tree');

  await expect(
    page.getByRole('button', { name: '+ Add Module' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '+ Add Note' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Auto Arrange/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Auto Align Grid/ }),
  ).toBeVisible();
});
