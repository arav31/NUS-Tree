const { test, expect } = require('@playwright/test');

test('loads the home page and primary navigation', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /NUS Tree: Welcome to Your Academic Planner/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'My Tree' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore' })).toBeVisible();
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
    page.getByRole('button', { name: /Auto Topo Sort/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Auto Align Grid/ }),
  ).toBeVisible();
});
