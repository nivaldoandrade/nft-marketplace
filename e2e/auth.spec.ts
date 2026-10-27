import type { Page } from '@playwright/test';

import { expect, test, users } from './support/fixtures';

const dialog = (page: Page) => page.getByRole('dialog');

async function signInWithForm(page: Page, email: string, password: string) {
  await dialog(page).getByLabel('E-mail').fill(email);
  await dialog(page).getByPlaceholder('Senha', { exact: true }).fill(password);
  await dialog(page).locator('button[type=submit]').click();
}

test.describe('conta e sessão', () => {
  test('cadastro valida campos, trata conflito e cria a conta', async ({ app, page }) => {
    await page.goto('/?auth=cadastro');

    await dialog(page).locator('button[type=submit]').click();
    await expect(dialog(page).getByText('Informe um e-mail válido.')).toBeVisible();

    await dialog(page).getByLabel('Nome de usuário').fill('nova.colecionadora');
    await dialog(page).getByLabel('E-mail').fill(users.ana.email);
    await dialog(page).getByPlaceholder('Senha', { exact: true }).fill('Senha1234');
    await dialog(page).getByPlaceholder('Confirmar senha').fill('Senha1234');
    await dialog(page).locator('button[type=submit]').click();
    await expect(dialog(page).getByText(/e-mail já/i)).toBeVisible();

    await dialog(page).getByLabel('E-mail').fill('nova@kurio.dev');
    await dialog(page).locator('button[type=submit]').click();
    await expect(dialog(page)).toBeHidden();
    await expect.poll(() => app.isSignedIn()).toBe(true);
  });

  test('login volta ao fluxo anterior e logout limpa os dados privados', async ({ app, page }) => {
    await page.goto('/perfil/lista-de-interesse');
    await expect(page).toHaveURL(/auth=login/);

    await signInWithForm(page, users.ana.email, 'senha-errada1');
    await expect(dialog(page).getByText('E-mail ou senha incorretos.')).toBeVisible();

    await signInWithForm(page, users.ana.email, users.ana.password);
    await expect(page).toHaveURL(/\/perfil\/lista-de-interesse/);
    await expect(page.getByText('Sage Nomad #009').first()).toBeVisible();

    await app.openAccountMenu();
    await page.getByRole('menuitem', { name: 'Sair' }).click();
    await expect.poll(() => app.isSignedIn()).toBe(false);
    await expect(page).toHaveURL(/\/$|\/\?/);

    // another user never sees the previous user's private data
    await page.goto('/perfil/lista-de-interesse');
    await signInWithForm(page, users.bruno.email, users.bruno.password);
    await expect(page.getByText('Golden Beat #207').first()).toBeVisible();
    await expect(page.getByText('Sage Nomad #009')).toHaveCount(0);
  });

  test('sessão expirada pede login novamente', async ({ app, page }) => {
    await page.clock.install();
    await page.goto('/?scenario=fast,realtime-off,short-session');
    await app.signIn();
    await page.goto('/perfil/dados');
    await expect(page.getByLabel('Nome de exibição')).toBeVisible();

    await page.clock.fastForward('00:31');
    await expect(
      page.getByText('Sua sessão expirou. Entre novamente para continuar.'),
    ).toBeVisible();
    await expect(dialog(page)).toBeVisible();
  });
});
