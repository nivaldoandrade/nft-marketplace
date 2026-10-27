import { expect, test } from './support/fixtures';

test.describe('tempo real', () => {
  test.describe('eventos duplicados e antigos', () => {
    test.use({ scenario: 'fast,realtime-off,realtime-duplicates' });

    test('não regridem o preço mais recente', async ({ app, page }) => {
      await page.goto('/nft/sage-nomad-009');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      await app.updateNft('sage-nomad-009', { price: '2.00' });
      await app.updateNft('sage-nomad-009', { price: '3.00' });

      const latest = page.getByText('3.00 ETH').filter({ visible: true }).first();
      await expect(latest).toBeVisible();
      // the duplicate and the stale event arrive 400 and 800ms later, with nothing to wait for on screen
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(1200);
      await expect(latest).toBeVisible();
      await expect(page.getByText('2.00 ETH').filter({ visible: true })).toHaveCount(0);
    });
  });

  test('reconecta e recupera as mudanças perdidas', async ({ app, page }) => {
    await page.goto('/nft/sage-nomad-009');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await app.disconnectRealtime(3000);
    await app.updateNft('sage-nomad-009', { price: '4.44' });
    await expect(page.getByText('Reconectando')).toBeVisible();

    await expect(page.getByText('4.44 ETH').filter({ visible: true }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Reconectando')).toBeHidden();
  });

  test('retoma o pedido pendente após recarregar', async ({ app, page }) => {
    await app.signIn();
    await app.addToCart('emerald-ape-042');
    await page.goto('/pagamento');
    await app.openReview();
    await page.getByRole('button', { name: 'Assinar e pagar' }).click();
    await expect(page).toHaveURL(/\/pedidos\//);
    const orderUrl = page.url();

    await page.goto('/pagamento');
    await expect(page).toHaveURL(orderUrl);
    await page.reload();
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 10_000,
    });
  });
});
