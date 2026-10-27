import type { Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

const facet = (page: Page, label: string) =>
  page.getByRole('button', { name: new RegExp(`^${label}`) }).filter({ visible: true });

const results = (page: Page) => page.getByText(/\d+ NFTs? encontrados?/).filter({ visible: true });

test.describe('catálogo', () => {
  test('busca, filtros combinados, ordenação, paginação e histórico', async ({
    app: _app,
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'os filtros do desktop ficam na barra lateral; o mobile é coberto abaixo');

    await page.goto('/');
    await expect(results(page)).toBeVisible();

    await page.getByRole('button', { name: 'Abrir busca' }).click();
    await page.getByRole('searchbox', { name: 'Buscar NFTs ou coleções' }).fill('Ape');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=Ape/);
    await expect(page.locator('article h3').first()).toContainText('Ape');

    await page.goto('/');
    await facet(page, 'Arte digital').click();
    await facet(page, 'Ethereum').click();
    await expect(page).toHaveURL(/category=.*digital-art/);
    await expect(page).toHaveURL(/network=.*ethereum/);
    await expect(facet(page, 'Arte digital')).toHaveAttribute('aria-pressed', 'true');

    await page
      .getByRole('combobox', { name: /Ordenar por/ })
      .filter({ visible: true })
      .click();
    await page.getByRole('option', { name: 'Menor preço' }).click();
    await expect(page).toHaveURL(/sort=price-asc/);
    const prices = await page
      .locator('article p span:first-child')
      .allInnerTexts()
      .then((texts) => texts.map((text) => Number.parseFloat(text)));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    await page.goto('/');
    await page.getByRole('link', { name: 'Página 2' }).click();
    await expect(page).toHaveURL(/page=2/);
    const firstOnPage2 = await page.locator('article h3').first().innerText();

    // a filter change restarts the pagination
    await facet(page, 'Polygon').click();
    await expect(page).not.toHaveURL(/page=/);

    await page.goBack();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('article h3').first()).toHaveText(firstOnPage2);

    await page.reload();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('article h3').first()).toHaveText(firstOnPage2);
  });

  test('busca e filtros no mobile', async ({ app: _app, page, isMobile }) => {
    test.skip(!isMobile, 'fluxo específico do mobile');

    await page.goto('/');
    await page.getByPlaceholder('Explorar coleções').fill('Nomad');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=Nomad/);

    await page.getByRole('button', { name: 'Abrir filtros' }).click();
    const sheet = page.getByRole('dialog');
    await sheet.getByRole('button', { name: /^Solana/ }).click();
    await expect(page).toHaveURL(/network=.*solana/);
    await expect(results(page)).toBeVisible();
  });

  test('mostra o estado vazio com o catálogo vazio', async ({ app: _app, page }) => {
    await page.goto('/?scenario=empty-catalog');

    await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible();
  });
});
