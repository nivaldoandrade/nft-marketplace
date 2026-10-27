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
  async signIn(user: User = users.ana) {
    await this.page.goto('/');
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
