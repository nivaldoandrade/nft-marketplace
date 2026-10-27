import type { Page } from '@playwright/test';

import { expect, test, users } from './support/fixtures';

const textbox = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true });

test.describe('perfil e carteiras', () => {
  test('edita o perfil com validação e erros da API', async ({ app, page }) => {
    await app.signIn();
    await page.goto('/perfil/dados');

    await textbox(page, 'Nome de usuário').fill('');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText(/pelo menos 3 caracteres/)).toBeVisible();

    await textbox(page, 'Nome de usuário').fill('bruno.nft');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText('Nome de usuário indisponível.')).toBeVisible();

    await textbox(page, 'Nome de usuário').fill('ana.colecionadora');
    await textbox(page, 'Nome de exibição').fill('Ana Lima');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText('Perfil atualizado.')).toBeVisible();

    await page.reload();
    await expect(textbox(page, 'Nome de exibição')).toHaveValue('Ana Lima');
  });

  test('troca o avatar e a senha', async ({ app, page }) => {
    await app.signIn();
    await page.goto('/perfil/dados');

    await page.setInputFiles('input[type=file]', {
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      ),
    });
    await expect(page.getByRole('img', { name: /Avatar de/ })).toBeVisible();

    await textbox(page, 'Senha atual').fill('Errada123');
    await textbox(page, 'Nova senha').fill('Nova12345');
    await textbox(page, 'Confirmar nova senha').fill('Outra12345');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText('As senhas não coincidem.')).toBeVisible();

    await textbox(page, 'Confirmar nova senha').fill('Nova12345');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText('Senha atual incorreta.')).toBeVisible();

    await textbox(page, 'Senha atual').fill(users.ana.password);
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText('Perfil e senha atualizados.')).toBeVisible();
  });

  test('cadastra e edita carteiras com validação', async ({ app, page }) => {
    await app.signIn(users.bruno);
    await page.goto('/perfil/carteiras');

    await page.getByRole('button', { name: 'Adicionar' }).click();
    const secondary = page.getByRole('region', { name: 'Carteira secundária' });
    await secondary.getByRole('button', { name: 'Salvar carteira' }).click();
    await expect(secondary.getByText('Informe o apelido da carteira.')).toBeVisible();

    await textbox(page, 'Apelido da carteira').last().fill('Reserva');
    await textbox(page, 'Nome do perfil').last().fill('bruno.nft');
    await textbox(page, 'Endereço da carteira').last().fill('0x123');
    await secondary.getByRole('button', { name: 'Salvar carteira' }).click();
    await expect(secondary.getByText(/40 caracteres hexadecimais/)).toBeVisible();

    await textbox(page, 'Endereço da carteira')
      .last()
      .fill('0x1111111111111111111111111111111111111111');
    await secondary.getByRole('combobox', { name: 'Rede' }).click();
    await page.getByRole('option', { name: 'Polygon' }).click();
    await secondary.getByRole('combobox', { name: 'Tipo de carteira' }).click();
    await page.getByRole('option', { name: 'MetaMask' }).click();
    await textbox(page, 'Código de indicação').last().fill('KURIO-BRUNO');
    await textbox(page, 'Nome ENS').last().fill('bruno.reserva');
    await secondary.getByRole('button', { name: 'Salvar carteira' }).click();
    await expect(page.getByText('Carteira adicionada.')).toBeVisible();

    await page.reload();
    await expect(textbox(page, 'Apelido da carteira').last()).toHaveValue('Reserva');
  });
});
