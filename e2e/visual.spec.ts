import type { Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

// lazy images inside horizontal carousels never enter the viewport, so all images load eagerly here
async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => (image.loading = 'eager'));
    await Promise.race([
      Promise.all(images.map((image) => image.decode().catch(() => null))),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    await document.fonts.ready;
  });
}

const snapshotOptions = { fullPage: true, mask: [] as ReturnType<Page['locator']>[] };

test.describe('regressão visual', () => {
  test('início', async ({ app: _app, page }) => {
    await page.goto('/');
    await expect(page.getByText(/\d+ NFTs encontrados/).filter({ visible: true })).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('inicio.png', snapshotOptions);
  });

  test('detalhe', async ({ app: _app, page }) => {
    await page.goto('/nft/emerald-ape-042');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('detalhe.png', snapshotOptions);
  });

  test('carrinho', async ({ app, page }) => {
    await app.addToCart('emerald-ape-042');
    await page.goto('/carrinho');
    await expect(page.getByText('1.206 ETH').filter({ visible: true }).first()).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('carrinho.png', snapshotOptions);
  });

  test('pagamento', async ({ app, page }) => {
    await app.signIn();
    await app.addToCart('emerald-ape-042');
    await page.goto('/pagamento');
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled();
    await settle(page);
    await expect(page).toHaveScreenshot('pagamento.png', snapshotOptions);
  });
});
