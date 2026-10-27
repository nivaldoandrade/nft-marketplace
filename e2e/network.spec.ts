import type { Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

const RETRIES_TIMEOUT = 15_000;

const firstCardName = (page: Page) => page.locator('article h3').first();

test.describe('rede e erros', () => {
  test('rede lenta mostra os skeletons antes dos NFTs', async ({ app: _app, page }) => {
    await page.goto('/?scenario=slow,realtime-off');

    await expect(page.getByLabel('Carregando NFTs')).toBeVisible();
    await expect(firstCardName(page)).toBeVisible({ timeout: RETRIES_TIMEOUT });
    await expect(page.getByLabel('Carregando NFTs')).toHaveCount(0);
  });

  test('respostas fora de ordem não sobrescrevem a página atual', async ({ app: _app, page }) => {
    await page.goto('/?page=3');
    const expected = await firstCardName(page).innerText();

    await page.goto('/?scenario=out-of-order,realtime-off');
    await expect(firstCardName(page)).toBeVisible();

    await page.getByRole('link', { name: 'Página 2' }).click();
    await page.getByRole('link', { name: 'Página 3' }).click();
    await expect(page).toHaveURL(/page=3/);

    // the slow response of page 2 arrives after page 3 and must be ignored
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(2500);
    await expect(firstCardName(page)).toHaveText(expected);
    await expect(page.getByRole('link', { name: 'Página 3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('erro do servidor mostra a mensagem e recupera ao tentar de novo', async ({ app, page }) => {
    await page.goto('/?scenario=fast,realtime-off,server-error');

    const alert = page.getByRole('alert').filter({ hasText: 'Não foi possível carregar os NFTs' });
    await expect(alert).toBeVisible({ timeout: RETRIES_TIMEOUT });

    // the error only shows after the automatic retries, so the next request comes from the button
    await app.setScenario('fast,realtime-off');
    await alert.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(firstCardName(page)).toBeVisible();
    await expect(alert).toBeHidden();
  });

  test('falha temporária é recuperada pela nova tentativa automática', async ({
    app: _app,
    page,
  }) => {
    await page.goto('/?scenario=fast,realtime-off,flaky');

    await expect(firstCardName(page)).toBeVisible({ timeout: RETRIES_TIMEOUT });
    await expect(page.getByText('Não foi possível carregar os NFTs')).toHaveCount(0);
  });
});
