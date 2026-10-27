import { expect, test } from './support/fixtures';

test.describe('detalhe do NFT', () => {
  test('abre por acesso direto com preço e edições', async ({ app: _app, page }) => {
    await page.goto('/nft/emerald-ape-042');

    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible();
    await expect(page.getByText('1.19 ETH').filter({ visible: true }).first()).toBeVisible();
    await expect(
      page.getByRole('radio', { name: /1\/10/ }).filter({ visible: true }).first(),
    ).toBeVisible();
  });

  test('mostra "NFT não encontrado" para um id inexistente', async ({ app: _app, page }) => {
    await page.goto('/nft/nao-existe-123');

    await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible();
    await page
      .getByRole('link', { name: /catálogo/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/(#.*)?$/);
  });
});
