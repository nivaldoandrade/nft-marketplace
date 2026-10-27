import { MOCK_SCENARIO_KEY } from '@/mocks/config';

export type Latency = 'none' | 'normal' | 'slow' | 'variable' | 'out-of-order';

export type ScenarioConfig = {
  latency: Latency;
  offline: boolean;
  timeout: boolean;
  serverError: 500 | 503 | null;
  flaky: boolean;
  emptyCatalog: boolean;
  shortSession: boolean;
  favoritesError: boolean;
};

export type Scenario = {
  id: string;
  label: string;
  config: Partial<ScenarioConfig>;
};

const defaultConfig: ScenarioConfig = {
  latency: 'normal',
  offline: false,
  timeout: false,
  serverError: null,
  flaky: false,
  emptyCatalog: false,
  shortSession: false,
  favoritesError: false,
};

export const scenarios: Scenario[] = [
  { id: 'default', label: 'Padrão', config: {} },
  { id: 'fast', label: 'Sem latência', config: { latency: 'none' } },
  { id: 'slow', label: 'Rede lenta', config: { latency: 'slow' } },
  { id: 'variable-latency', label: 'Latência variável', config: { latency: 'variable' } },
  { id: 'out-of-order', label: 'Respostas fora de ordem', config: { latency: 'out-of-order' } },
  { id: 'offline', label: 'Sem conexão', config: { offline: true } },
  { id: 'timeout', label: 'Timeout', config: { timeout: true } },
  { id: 'server-error', label: 'Erro 500', config: { serverError: 500 } },
  { id: 'unavailable', label: 'Serviço indisponível (503)', config: { serverError: 503 } },
  { id: 'flaky', label: 'Falha na primeira tentativa', config: { flaky: true } },
  { id: 'empty-catalog', label: 'Catálogo vazio', config: { emptyCatalog: true } },
  { id: 'short-session', label: 'Sessão curta (30s)', config: { shortSession: true } },
  {
    id: 'favorites-error',
    label: 'Falha ao alterar a lista de interesse',
    config: { favoritesError: true },
  },
];

function readInitialScenarioIds(): string[] {
  const fromUrl = new URLSearchParams(window.location.search).get('scenario');

  if (fromUrl) {
    localStorage.setItem(MOCK_SCENARIO_KEY, fromUrl);
    return fromUrl.split(',');
  }

  return (localStorage.getItem(MOCK_SCENARIO_KEY) ?? 'default').split(',');
}

const activeIds = readInitialScenarioIds();

export function getScenarioConfig(): ScenarioConfig {
  return activeIds.reduce<ScenarioConfig>(
    (config, id) => ({
      ...config,
      ...scenarios.find((scenario) => scenario.id === id)?.config,
    }),
    defaultConfig,
  );
}
