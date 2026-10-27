# Kurio — NFT Marketplace

Marketplace de NFTs em React 19 + TypeScript, com catálogo, detalhe, carrinho, pagamento com carteira, confirmação de pedido, conta do colecionador e atualizações em tempo real. A API REST e o servidor Socket.IO são simulados no navegador com MSW, então a aplicação roda sem backend.

- **Aplicação publicada:** https://kurio.nivaldoandrade.dev.br
- **Decisões, contratos e desvios do Figma:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Stack

React 19 · TypeScript (strict) · Vite · TanStack Router · TanStack Query · Axios · Socket.IO (`socket.io-client`) · Tailwind CSS 4 · shadcn/ui · React Hook Form + Zod · MSW (+ `@mswjs/socket.io-binding`) · Playwright · Lighthouse

## Setup

Requisitos: Node 22 e Yarn 1.

```bash
yarn            # instala as dependências (yarn.lock)
yarn dev        # http://localhost:5173, com os mocks ativos
```

A partir de um checkout limpo não é preciso nenhum serviço externo: os dados, a sessão, o carrinho, os pedidos e os eventos em tempo real vêm da camada de mocks e ficam salvos no `localStorage` do navegador.

## Variáveis de ambiente

Todas são opcionais; os valores padrão estão em [`.env.example`](./.env.example).

| Variável            | Padrão       | Uso                                                                                    |
| ------------------- | ------------ | -------------------------------------------------------------------------------------- |
| `VITE_API_URL`      | `/api`       | URL base da API REST (interceptada pelo MSW quando os mocks estão ativos)              |
| `VITE_SOCKET_URL`   | mesma origem | URL do servidor Socket.IO                                                              |
| `VITE_ENABLE_MOCKS` | `true`       | Ativa a camada de mocks (REST e Socket.IO). Fica ativa também no build de demonstração |

## Comandos

| Comando                       | Descrição                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `yarn dev`                    | Desenvolvimento com mocks                                                                     |
| `yarn build`                  | Verificação de tipos e build de produção                                                      |
| `yarn preview`                | Serve o build de produção                                                                     |
| `yarn typecheck`              | Verificação de tipos                                                                          |
| `yarn lint` / `yarn lint:fix` | ESLint                                                                                        |
| `yarn format`                 | Prettier                                                                                      |
| `yarn test:e2e`               | Testes Playwright (desktop e mobile) contra o build de produção                               |
| `yarn test:e2e:update`        | Atualiza as baselines de regressão visual                                                     |
| `yarn test:e2e:report`        | Abre o relatório HTML dos testes                                                              |
| `yarn lighthouse`             | Auditoria Lighthouse (3 medições por página e perfil) com relatórios em `lighthouse/reports/` |
| `yarn lighthouse:deploy`      | A mesma auditoria na URL publicada, com relatórios em `lighthouse/reports/deploy/`            |

Na primeira execução dos testes, instale o navegador com `yarn playwright install chromium`.

## Credenciais fictícias

| Usuário    | E-mail            | Senha       | Observação                                            |
| ---------- | ----------------- | ----------- | ----------------------------------------------------- |
| Ana Souza  | `ana@kurio.dev`   | `Kurio@123` | Carteiras principal (Ethereum) e secundária (Polygon) |
| Bruno Lima | `bruno@kurio.dev` | `Kurio@123` | Só carteira principal                                 |

Também é possível criar uma conta pelo cadastro.

**Cupons:** `KURIO10` (10%), `GENESIS15` (15%) e `EXPIRADO20` (expirado).

## Cenários dos mocks

O cenário é escolhido pelo parâmetro `?scenario=` em qualquer página. Ele fica salvo no navegador até ser trocado, e vários cenários podem ser combinados com vírgula (por exemplo, `?scenario=slow,payment-declined`). O parâmetro é lido ao carregar a página, então use a barra de endereço ou recarregue.

| Cenário                    | Efeito                                                             |
| -------------------------- | ------------------------------------------------------------------ |
| `default`                  | Latência de 250 ms e eventos automáticos de tempo real a cada 30 s |
| `fast`                     | Sem latência                                                       |
| `slow`                     | Latência de 2,5 s                                                  |
| `variable-latency`         | Latência entre 0,1 e 2 s                                           |
| `out-of-order`             | Respostas alternando entre lentas e rápidas (fora de ordem)        |
| `offline`                  | Sem conexão (REST e Socket.IO)                                     |
| `timeout`                  | Requisições que não respondem a tempo                              |
| `server-error`             | Erro 500                                                           |
| `unavailable`              | Erro 503                                                           |
| `flaky`                    | Falha na primeira tentativa de cada requisição                     |
| `empty-catalog`            | Catálogo vazio                                                     |
| `short-session`            | Sessão expira em 30 s                                              |
| `favorites-error`          | Falha ao alterar a lista de interesse                              |
| `realtime-off`             | Sem eventos automáticos de tempo real                              |
| `realtime-duplicates`      | Eventos repetidos e eventos antigos depois dos novos               |
| `realtime-unstable`        | A conexão em tempo real cai a cada 12–25 s                         |
| `wallet-rejected`          | A carteira recusa a primeira conexão                               |
| `payment-declined`         | O pagamento é recusado                                             |
| `price-change-on-checkout` | O preço muda no envio do pedido                                    |
| `sold-out-on-checkout`     | A edição esgota no envio do pedido                                 |
| `order-timeout`            | O pedido é criado, mas a resposta se perde                         |

**Reset:**

- `?scenario=default` volta ao cenário padrão.
- `?reset-mocks` descarta os dados salvos (usuários, carrinho, pedidos, carteiras, preços) e recomeça das fixtures.

**Eventos sob demanda:** os eventos de tempo real podem ser disparados pelo console do navegador, passando pelo servidor Socket.IO simulado:

```js
// muda o preço e/ou a disponibilidade de um NFT
fetch('/__mock/realtime/nft-updated', {
  method: 'POST',
  body: JSON.stringify({ nftId: 'emerald-ape-042', price: '1.50', editions: { '1/10': 0 } }),
});

// derruba a conexão em tempo real e recusa novas conexões por 5 s
fetch('/__mock/realtime/disconnect', {
  method: 'POST',
  body: JSON.stringify({ downtimeMs: 5000 }),
});
```

## Como reproduzir os fluxos de falha

| Fluxo                                | Como reproduzir                                                             | Resultado esperado                                                          |
| ------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Rede lenta e respostas fora de ordem | `/?scenario=slow` ou `/?scenario=out-of-order` e troque filtros rapidamente | Skeletons, sem resultado de um filtro antigo sobrescrever o atual           |
| Erros HTTP e indisponibilidade       | `/?scenario=server-error`, `unavailable` ou `offline`                       | Mensagem de erro com "Tentar novamente"                                     |
| Falha seguida de recuperação         | `/?scenario=flaky`                                                          | A nova tentativa automática recupera os dados                               |
| Sessão expirada                      | Entre na conta com `?scenario=short-session` e aguarde 30 s                 | Aviso de sessão expirada e login sobre a página atual                       |
| Falha ao favoritar                   | Entre na conta com `?scenario=favorites-error` e favorite um NFT            | O coração volta ao estado anterior, com aviso                               |
| Cupom inválido ou expirado           | No carrinho, aplique `NAOEXISTE` ou `EXPIRADO20`                            | Mensagem no campo do cupom                                                  |
| Carteira recusa a conexão            | `/pagamento?scenario=wallet-rejected` e "Confirmar compra"                  | A conexão é recusada; a segunda tentativa funciona                          |
| Preço alterado no checkout           | `/pagamento?scenario=price-change-on-checkout` e "Assinar e pagar"          | "Os valores mudaram", exigindo nova confirmação                             |
| Edição esgotada no checkout          | `/pagamento?scenario=sold-out-on-checkout` e "Assinar e pagar"              | Revisão bloqueada com "Ajustar carrinho"                                    |
| Timeout ao criar o pedido            | `/pagamento?scenario=order-timeout` e "Assinar e pagar"                     | Após ~10 s, a nova tentativa recupera o mesmo pedido (sem duplicar)         |
| Pagamento recusado                   | `/pagamento?scenario=payment-declined` e "Assinar e pagar"                  | Pedido recusado e itens mantidos no carrinho                                |
| Preço alterado em tempo real         | Com o carrinho ou o detalhe aberto, dispare `nft-updated` pelo console      | Preço atualizado com aviso                                                  |
| Eventos duplicados e antigos         | `?scenario=realtime-duplicates` e dispare dois `nft-updated` seguidos       | Fica o valor mais recente                                                   |
| Queda da conexão em tempo real       | Dispare `disconnect` com `downtimeMs: 5000`                                 | "Reconectando…" e, ao voltar, as mudanças perdidas são recuperadas pela API |
| Pedido pendente após refresh         | Envie um pedido e recarregue `/pagamento` em menos de 4 s                   | Redireciona para o pedido pendente, que é concluído                         |

## Testes e auditoria

- **Playwright:** 68 testes cobrindo os 11 fluxos pedidos, além de rede lenta, respostas fora de ordem e erros com recuperação, em desktop (1440×900) e mobile (Pixel 7), com regressão visual de início, detalhe, carrinho e pagamento (`e2e/__screenshots__/`). Cada teste parte de um estado isolado. Relatório HTML com traces das falhas em `playwright-report/`.
- **Lighthouse:** início e detalhe, mobile e desktop, mediana de 3 medições. Na URL publicada: Performance 90 no mobile e 100 no desktop, com Accessibility, Best Practices e SEO entre 97 e 100. Resultados, ambiente e análise em [`lighthouse/reports/deploy/summary.md`](./lighthouse/reports/deploy/summary.md), [`lighthouse/reports/summary.md`](./lighthouse/reports/summary.md) (local) e no `ARCHITECTURE.md`.

## Estrutura

```
src/
  app/     lógica: services (Axios), hooks de queries e mutations, contextos, tempo real, rotas
  ui/      apresentação: páginas, componentes e estilos
  mocks/   MSW: handlers REST, servidor Socket.IO simulado, banco, fixtures e cenários
e2e/       testes Playwright
lighthouse/ script e relatórios da auditoria
```
