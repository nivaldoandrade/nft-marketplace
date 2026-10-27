import type { Page } from '@playwright/test';

import { expect, test, users } from './support/fixtures';

const stepper = (page: Page, name: string) =>
  page.getByRole('group', { name: `Quantidade de ${name}` }).filter({ visible: true });

test.describe('carrinho', () => {
  test('altera quantidade, remove item e aplica cupom', async ({ app, page }) => {
    await app.addToCart('emerald-ape-042');
    await app.addToCart('sage-nomad-009');
    await page.goto('/carrinho');

    await stepper(page, 'Emerald Ape #042')
      .getByRole('button', { name: 'Aumentar quantidade' })
      .click();
    await expect(stepper(page, 'Emerald Ape #042').locator('output')).toHaveText('2');

    await page
      .getByRole('button', { name: 'Remover Sage Nomad #009 do carrinho' })
      .filter({ visible: true })
      .click();
    await expect(stepper(page, 'Sage Nomad #009')).toHaveCount(0);

    const coupon = page.getByPlaceholder(/código promocional/);
    await coupon.fill('NAOEXISTE');
    await page.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByText('Cupom inválido.')).toBeVisible();

    await coupon.fill('EXPIRADO20');
    await page.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByText('Este cupom expirou.')).toBeVisible();

    await coupon.fill('kurio10');
    await page.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByText('KURIO10').first()).toBeVisible();
    await expect(page.getByText('(-) 0.238')).toBeVisible();

    await page.reload();
    await expect(stepper(page, 'Emerald Ape #042').locator('output')).toHaveText('2');
    await expect(page.getByText('(-) 0.238')).toBeVisible();
  });

  test('mantém os itens do visitante ao entrar na conta', async ({ app, page }) => {
    await app.addToCart('golden-beat-207');
    await page.goto('/carrinho?auth=login');

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('E-mail').fill(users.ana.email);
    await dialog.getByPlaceholder('Senha', { exact: true }).fill(users.ana.password);
    await dialog.locator('button[type=submit]').click();

    await expect.poll(() => app.isSignedIn()).toBe(true);
    await expect(stepper(page, 'Golden Beat #207')).toBeVisible();
    await page.reload();
    await expect(stepper(page, 'Golden Beat #207')).toBeVisible();
  });
});
