import { test as base, expect, type Page } from '@playwright/test';

export const users = {
  ana: { email: 'ana@kurio.dev', password: 'Kurio@123', name: 'Ana Souza' },
  bruno: { email: 'bruno@kurio.dev', password: 'Kurio@123', name: 'Bruno Lima' },
};

type User = (typeof users)[keyof typeof users];

const SCENARIO_KEY = '@kurio:mock-scenario';
const TOKEN_KEY = '@kurio:access-token';

class App {
  constructor(private readonly page: Page) {}

  // signs in through the mocked API, so specs that are not about authentication skip the form
  // the app only renders after the mocks start, so requests made after this are mocked
  async waitForApp() {
    await this.page.locator('#conteudo').waitFor({ state: 'attached' });
  }

  async signIn(user: User = users.ana) {
    if (!this.page.url().startsWith('http')) {
      await this.page.goto('/');
    }

    await this.waitForApp();
    const token = await this.page.evaluate(async ({ email, password }) => {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      return ((await response.json()) as { accessToken: string }).accessToken;
    }, user);

    await this.page.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [TOKEN_KEY, token],
    );
  }

  async isSignedIn() {
    return this.page.evaluate((key) => !!localStorage.getItem(key), TOKEN_KEY);
  }

  // the header holds the account menu on desktop and the bottom navigation on mobile
  async openAccountMenu() {
    await this.page
      .getByRole('button', { name: /^Conta/ })
      .filter({ visible: true })
      .first()
      .click();
  }

  // desktop buys from the detail page; mobile uses the add-to-cart button of the bottom bar
  async addToCart(nftId: string) {
    await this.page.goto(`/nft/${nftId}`);

    const addButton = this.page.getByRole('button', { name: 'Adicionar ao carrinho' });

    if (await addButton.isVisible()) {
      await addButton.click();
      await this.page.getByText('Adicionado ao carrinho.').waitFor();
      return;
    }

    await this.page
      .getByRole('button', { name: /^Comprar/i })
      .filter({ visible: true })
      .click();
    await this.page.waitForURL('**/carrinho');
  }

  async ordersCount() {
    return this.page.evaluate(
      () =>
        Object.keys(JSON.parse(localStorage.getItem('@kurio:mock-db') ?? '{}').orders ?? {}).length,
    );
  }

  // from the payment page to the review dialog, connecting the wallet on the way
  async openReview() {
    await this.page.getByRole('button', { name: 'Confirmar compra' }).click();
    await this.page.getByRole('dialog').waitFor();
  }

  // events go through the simulated Socket.IO server, never straight to the UI
  async updateNft(nftId: string, changes: { price?: string; editions?: Record<string, number> }) {
    await this.page.evaluate(
      (body) =>
        fetch('/__mock/realtime/nft-updated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      { nftId, ...changes },
    );
  }

  async disconnectRealtime(downtimeMs = 0) {
    await this.page.evaluate(
      (body) =>
        fetch('/__mock/realtime/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      { downtimeMs },
    );
  }
}

type Fixtures = {
  scenario: string;
  app: App;
};

// each test runs in a fresh browser context, so the mock database and session start empty
export const test = base.extend<Fixtures>({
  scenario: ['fast,realtime-off', { option: true }],
  app: async ({ page, scenario }, use) => {
    await page.addInitScript(
      ([key, value]) => {
        if (!sessionStorage.getItem('e2e-scenario-set')) {
          localStorage.setItem(key, value);
          sessionStorage.setItem('e2e-scenario-set', '1');
        }
      },
      [SCENARIO_KEY, scenario],
    );
    await use(new App(page));
  },
});

export { expect };
