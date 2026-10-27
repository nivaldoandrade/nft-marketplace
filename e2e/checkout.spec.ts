import { expect, test } from './support/fixtures';

const RESULT_TIMEOUT = 10_000;

test.describe('compra', () => {
  test('do catálogo ao recibo confirmado', async ({ app, page }) => {
    await app.signIn();
    await page.goto('/');
    const name = await page.locator('article h3').first().innerText();
    await page.locator('article a').first().click();
    await expect(page).toHaveURL(/\/nft\//);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);

    await app.addToCart(page.url().split('/nft/')[1]);
    await page.goto('/carrinho');
    await page.getByRole('button', { name: /finalizar/i }).click();
    await expect(page).toHaveURL(/\/pagamento/);

    await app.openReview();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(name)).toBeVisible();
    await dialog.getByRole('button', { name: 'Assinar e pagar' }).click();

    await expect(page).toHaveURL(/\/pedidos\//);
    await expect(page.getByRole('status').filter({ hasText: 'Aguardando' })).toBeVisible();
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: RESULT_TIMEOUT,
    });
    await expect(page.getByText('ID da transação')).toBeVisible();
    await expect(page.getByText(name).first()).toBeVisible();

    await page.goto('/carrinho');
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();
  });

  test('pagamento recusado mantém os itens no carrinho', async ({ app, page }) => {
    await app.signIn();
    await app.addToCart('emerald-ape-042');
    await page.goto('/pagamento?scenario=fast,realtime-off,payment-declined');

    await app.openReview();
    await page.getByRole('button', { name: 'Assinar e pagar' }).click();
    await expect(page.getByText('Pagamento recusado').first()).toBeVisible({
      timeout: RESULT_TIMEOUT,
    });

    await page.getByRole('link', { name: 'Ver carrinho' }).click();
    await expect(
      page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }).filter({ visible: true }),
    ).toBeVisible();
  });

  test('clique repetido cria um único pedido', async ({ app, page }) => {
    await app.signIn();
    await app.addToCart('emerald-ape-042');
    await page.goto('/pagamento');

    await app.openReview();
    const pay = page.getByRole('button', { name: 'Assinar e pagar' });
    await pay.click({ clickCount: 3 });

    await expect(page).toHaveURL(/\/pedidos\//);
    expect(await app.ordersCount()).toBe(1);
  });

  test('timeout após criar o pedido recupera o mesmo pedido', async ({ app, page }) => {
    test.setTimeout(60_000);
    await app.signIn();
    await app.addToCart('emerald-ape-042');
    await page.goto('/pagamento?scenario=fast,realtime-off,order-timeout');

    await app.openReview();
    await page.getByRole('button', { name: 'Assinar e pagar' }).click();
    await expect(page.getByRole('button', { name: 'Aguardando a carteira…' })).toBeVisible();

    await expect(page).toHaveURL(/\/pedidos\//, { timeout: 20_000 });
    expect(await app.ordersCount()).toBe(1);
  });

  test('mudança de preço via Socket.IO exige nova confirmação', async ({ app, page }) => {
    await app.signIn();
    await app.addToCart('emerald-ape-042');
    await page.goto('/pagamento');
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled();

    await app.updateNft('emerald-ape-042', { price: '1.50' });
    await app.openReview();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Os valores mudaram' })).toBeVisible();
    await expect(dialog.getByText(/mudou de 1\.19 ETH para 1\.50 ETH/)).toBeVisible();

    await dialog.getByRole('button', { name: 'Aceitar novos valores' }).click();
    await dialog.getByRole('button', { name: 'Assinar e pagar' }).click();
    await expect(page).toHaveURL(/\/pedidos\//);
  });

  test('edição esgotada via Socket.IO bloqueia o envio', async ({ app, page }) => {
    await app.signIn();
    await app.addToCart('emerald-ape-042');
    await page.goto('/pagamento');
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled();

    await app.updateNft('emerald-ape-042', { editions: { '1/10': 0 } });
    await expect(page.getByText(/itens indisponíveis/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled();
  });
});
