import { expect, test } from './support/fixtures';

test.describe('teclado, foco e formulários', () => {
  test('atalho para o conteúdo e foco visível', async ({ app: _app, page }) => {
    await page.goto('/');
    await page.locator('#conteudo').waitFor({ state: 'attached' });

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page.locator('#conteudo')).toBeFocused();
  });

  test('diálogo de login prende o foco e devolve ao fechar', async ({
    app: _app,
    page,
    isMobile,
  }) => {
    await page.goto('/');
    const trigger = isMobile
      ? page
          .getByRole('link', { name: 'Entrar' })
          .or(page.getByRole('button', { name: 'Entrar' }))
          .filter({ visible: true })
          .first()
      : page.getByRole('button', { name: 'Entrar' }).filter({ visible: true }).first();
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    for (let index = 0; index < 15; index += 1) {
      await page.keyboard.press('Tab');
      await expect(dialog.locator(':focus')).toHaveCount(1);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('erros de validação ficam associados aos campos', async ({ app: _app, page }) => {
    await page.goto('/?auth=login');
    const dialog = page.getByRole('dialog');
    await dialog.locator('button[type=submit]').click();

    const email = dialog.getByLabel('E-mail');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription('Informe um e-mail válido.');
  });
});
