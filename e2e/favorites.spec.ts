import { expect, test } from './support/fixtures';

test.describe('lista de interesse', () => {
  test('favorita pelo detalhe e a lista persiste para o usuário', async ({ app, page }) => {
    await app.signIn();
    await page.goto('/nft/emerald-ape-042');

    const favorite = page
      .getByRole('button', { name: /^(Favoritar|Adicionar à lista de interesse)$/ })
      .filter({ visible: true })
      .first();
    await favorite.click();
    await expect(page.getByText('Adicionado à lista de interesse.')).toBeVisible();

    await page.goto('/perfil/lista-de-interesse');
    await expect(page.getByText('Emerald Ape #042').first()).toBeVisible();

    await page.reload();
    await expect(page.getByText('Emerald Ape #042').first()).toBeVisible();
  });

  test('desfaz a alteração quando a API falha', async ({ app, page }) => {
    await app.signIn();
    await page.goto('/nft/emerald-ape-042?scenario=fast,realtime-off,favorites-error');

    const favorite = page
      .getByRole('button', { name: /^(Favoritar|Adicionar à lista de interesse)$/ })
      .filter({ visible: true })
      .first();
    await expect(favorite).toHaveAttribute('aria-pressed', 'false');
    await favorite.click();

    await expect(page.getByText(/Não foi possível adicionar à lista de interesse/)).toBeVisible();
    await expect(favorite).toHaveAttribute('aria-pressed', 'false');
  });
});
