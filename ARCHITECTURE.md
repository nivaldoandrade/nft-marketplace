# Arquitetura

Este documento descreve a organização do código, os contratos da API simulada, a sessão, o carrinho, o cache e a sincronização em tempo real, e registra as decisões de UX, os desvios do Figma e as limitações conhecidas.

## Visão geral

- **Camadas:** `src/app` concentra a lógica (services Axios, hooks de queries e mutations do TanStack Query, contextos de autenticação e tempo real, rotas do TanStack Router); `src/ui` concentra a apresentação (páginas, componentes e estilos); `src/mocks` contém toda a simulação (MSW, servidor Socket.IO, banco, fixtures e cenários). Nenhum componente, hook ou o cliente Axios contém dados fictícios.
- **Fluxo de dados:** página → hook `use<Feature>` → hook de query/mutation → service (`XService`, classe estática com contratos tipados em `namespace XService`) → Axios.
- **Rotas:** `/` (início e catálogo, com busca, filtros, ordenação e página na URL), `/nft/$nftId`, `/carrinho`, `/pagamento`, `/pedidos/$orderId`, `/perfil/dados`, `/perfil/carteiras` e `/perfil/lista-de-interesse`. `/pagamento`, `/pedidos/*` e `/perfil/*` exigem login; `/login` e `/cadastro` abrem o modal de autenticação sobre o início.
- **Mocks:** ativados por `VITE_ENABLE_MOCKS` (padrão `true`, inclusive no build de demonstração). O banco simulado fica no `localStorage` (`@kurio:mock-db`), então os dados sobrevivem a recarregar; `?reset-mocks` volta às fixtures. Os cenários (`?scenario=`) estão descritos no README.

## Contratos REST

Base `VITE_API_URL` (`/api`). Respostas em JSON; valores em ETH trafegam como strings decimais e as contas usam aritmética exata (`src/app/utils/eth.ts`). Os tipos ficam em `src/app/types` e nos `namespace` de cada service.

| Método e rota                                                               | Auth                       | Descrição                                                                                                                                                         |
| --------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/sign-up` · `POST /auth/sign-in`                                 | —                          | Cria a conta ou entra; devolve `{ accessToken, user, expiresAt }`                                                                                                 |
| `GET /auth/session` · `POST /auth/sign-out`                                 | Bearer                     | Valida a sessão atual · invalida o token                                                                                                                          |
| `GET /nfts`                                                                 | —                          | Catálogo paginado (`q`, `category[]`, `network[]`, `minPrice`, `maxPrice`, `tab`, `sort`, `page`, `perPage`), com facetas e faixa de preço                        |
| `GET /nfts/featured` · `GET /nfts/:id`                                      | —                          | Destaques do início · detalhe com edições e disponibilidade                                                                                                       |
| `GET /nfts/:id/related` · `GET /nfts/:id/reviews`                           | —                          | Relacionados · avaliações                                                                                                                                         |
| `GET /me/favorites` · `PUT`/`DELETE /me/favorites/:nftId`                   | Bearer                     | Lista de interesse                                                                                                                                                |
| `GET /cart` · `POST /cart/items` · `PATCH`/`DELETE /cart/items/:id`         | opcional                   | Carrinho do usuário ou do visitante (header `X-Guest-Cart-Id`)                                                                                                    |
| `PUT`/`DELETE /cart/coupon` · `POST /cart/merge`                            | opcional · Bearer          | Cupom · junta o carrinho do visitante ao do usuário                                                                                                               |
| `GET /cart/quote?network=`                                                  | opcional                   | Cotação: itens, subtotal, desconto, taxa de rede, total e pendências (`PRICE_CHANGED`, `UNAVAILABLE`, `QUANTITY_EXCEEDED`, `COUPON_EXPIRED`)                      |
| `GET /me/wallets` · `PUT /me/wallets/:slot`                                 | Bearer                     | Carteiras principal e secundária e a conexão atual · cadastro/edição (`sameAsPrimary` copia a principal)                                                          |
| `POST /me/wallets/:id/connect` · `POST /me/wallets/disconnect`              | Bearer                     | Conexão simulada com a carteira (pode ser recusada)                                                                                                               |
| `POST /orders`                                                              | Bearer + `Idempotency-Key` | Cria o pedido a partir do `quoteId` revisado; 409 `QUOTE_OUTDATED` (com a cotação nova), `QUANTITY_UNAVAILABLE`, `WALLET_NOT_CONNECTED` ou `IDEMPOTENCY_CONFLICT` |
| `GET /orders?status=` · `GET /orders/:id`                                   | Bearer                     | Pedidos do usuário; pedido inexistente responde 404 e pedido de outro usuário, 403 `FORBIDDEN`                                                                    |
| `GET`/`PATCH /me/profile` · `PUT`/`DELETE /me/avatar` · `POST /me/password` | Bearer                     | Perfil, avatar e troca de senha                                                                                                                                   |

- **Erros:** `{ error: { code, message, fields? } }`. `code` segue `ErrorCode` (`src/app/errors/apiErrors.ts`), com mensagem em português; `fields` traz erros por campo, exibidos nos formulários. Respostas que não são JSON viram `INVALID_RESPONSE`; falhas de rede e timeout (10 s) viram `NETWORK_ERROR` e `TIMEOUT`.
- **Controle dos mocks (fora de `/api`):** `POST /__mock/realtime/nft-updated` e `POST /__mock/realtime/disconnect`, que passam pelo servidor Socket.IO simulado, nunca direto pela interface, e `POST /__mock/scenario` (`{ scenario }`), que troca o cenário sem recarregar a página (o mesmo valor de `?scenario=`). São usados pelos testes e por quem demonstra.

## Eventos em tempo real

Conexão `socket.io-client` na mesma origem (ou `VITE_SOCKET_URL`), só por WebSocket, com o token da sessão no handshake (`auth.token`). Envelope comum:

```ts
{ eventId: string; type: string; resource: { type: string; id: string }; version: number; occurredAt: string; data: ... }
```

| Evento          | Destino                          | `data`                                | Efeito no cliente                                                                                                                   |
| --------------- | -------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `nft.updated`   | Todas as conexões                | `{ price, compareAtPrice, editions }` | Atualiza detalhe, catálogo, destaques, relacionados e lista de interesse; recarrega carrinho e cotação se o NFT estiver no carrinho |
| `order.updated` | Só as conexões do dono do pedido | O pedido completo                     | Atualiza o pedido aberto (pendente → confirmado/recusado); se confirmado, recarrega carrinho e cotação                              |

O cliente descarta `eventId` repetido e versões menores ou iguais à última aplicada, e só altera o cache se a versão do evento for maior que a do dado em cache.

## Política de sessão

- Token opaco no `localStorage`, enviado como `Authorization: Bearer`, com expiração de 1 hora (`expiresAt`).
- Ao abrir a aplicação, a sessão é validada em `GET /auth/session` antes de renderizar as rotas; token inválido deixa o usuário deslogado.
- Durante a navegação, a expiração é detectada no horário de `expiresAt` e em qualquer 401 de sessão; o usuário é avisado e o login abre sobre a página atual, preservando o contexto (o rascunho do pagamento fica no `sessionStorage`).
- Logout e troca de usuário removem do cache todas as consultas privadas e encerram a conexão em tempo real da sessão anterior. Detalhes em "Autenticação".

## Estado do carrinho

- O carrinho vive na API simulada. Visitantes têm um carrinho identificado por um id guardado no navegador e enviado no header `X-Guest-Cart-Id`; usuários têm um carrinho próprio. Ao entrar, `POST /cart/merge` soma os itens do visitante ao carrinho da conta, respeitando disponibilidade e limite por pedido.
- Cada item guarda o preço de quando foi adicionado (`addedUnitPrice`), para avisar sobre mudanças de preço. Os totais nunca são calculados na interface: vêm da cotação (`GET /cart/quote`), cujo id é um hash dos valores cotados e é exigido na criação do pedido.
- Alterações de quantidade e remoções são otimistas e executadas em fila (mesmo `scope`), na ordem dos cliques; só a resposta da última alteração substitui o estado otimista. Em erro, o carrinho é recarregado da API.
- Após um pedido confirmado, saem do carrinho apenas os itens e quantidades comprados.

## Estratégia de cache

- **Chaves centralizadas** em `src/app/libs/queryKeys.ts`: dados públicos em `['nfts', ...]`, do visitante em `['guest', ...]` e privados em `['user', userId, ...]`, o que isola os dados por usuário e pelos parâmetros da consulta.
- **Tempo de validade:** 30 s por padrão; destaques, relacionados e avaliações, 5 min; sessão, até ser invalidada; pedidos pendentes, sempre revalidados.
- **Respostas obsoletas:** o `AbortSignal` do TanStack Query é repassado ao Axios, então trocar filtros cancela a requisição anterior; listas e cotação usam `placeholderData` para manter o resultado anterior visível durante a atualização em segundo plano.
- **Novas tentativas:** consultas tentam de novo até 2 vezes apenas em erro transitório (rede, timeout, 408, 429, 5xx), com backoff; mutations não tentam de novo, exceto a criação de pedido (uma vez, com a mesma chave de idempotência).
- **Atualizações:** favoritos e carrinho são otimistas com rollback; as demais mutations atualizam o cache com a resposta da API ou invalidam as consultas afetadas.

## Reconciliação entre REST e Socket.IO

- A API REST é a fonte da verdade. Os eventos apenas antecipam mudanças no cache, sempre conferindo a versão, e o carrinho e a cotação são sempre recarregados da API em vez de recalculados a partir do evento.
- Ao reconectar, catálogo, detalhes, lista de interesse, carrinho e cotação são invalidados (as consultas na tela são recarregadas), recuperando o que mudou durante a queda.
- Os pedidos do usuário são reconsultados a cada conexão, inclusive a primeira, porque um pedido pode ter sido concluído antes de a conexão abrir. Abrir `/pagamento` com um pedido pendente leva a ele, e a página do pedido se atualiza por evento ou pela API.
- Antes de criar o pedido, a cotação é refeita e comparada com a que o usuário viu; o servidor também recusa `quoteId` desatualizado. Assim, uma mudança recebida por evento (ou perdida durante uma queda) nunca é cobrada sem nova confirmação.

## Decisões de UX e desvios do Figma

O Figma define dois tamanhos de tela por página: desktop (1440px) e mobile (414px). A implementação preserva tipografia, cores, espaçamentos, hierarquia, imagens, proporções e composição desses frames. Quando fidelidade visual, acessibilidade e responsividade entram em conflito, acessibilidade e responsividade prevalecem. As diferenças em relação ao Figma estão agrupadas abaixo para facilitar a conferência.

### Inconsistências encontradas no Figma

#### Corrigidas (conteúdo e dados)

Erros de conteúdo ou de dados no próprio Figma. A correção não altera nenhum aspecto visual (tipografia, posição, espaçamento e componentes continuam iguais ao frame).

| Página             | No Figma                                                                                             | Na implementação                                                                                                    | Motivo                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Detalhe (desktop)  | "Contrato:" mostra o texto de direitos autorais e "Direitos autorais:" mostra o endereço do contrato | Cada rótulo exibe o conteúdo correspondente                                                                         | Rótulo e conteúdo estavam trocados                        |
| Detalhe (mobile)   | Edições "1/10, 1/10, 1/50, ABERTA"                                                                   | "1/1, 1/10, 1/50, ABERTA", como no desktop                                                                          | "1/10" repetido e "1/1" ausente                           |
| Detalhe            | "Mais desta coleção" lista NFTs de coleções diferentes                                               | Lista apenas NFTs da mesma coleção                                                                                  | O título promete NFTs da mesma coleção                    |
| Detalhe            | A descrição cita a coleção "Kurio Editions" para um NFT da coleção "Kurio Apes"                      | Textos gerados a partir dos dados do NFT                                                                            | Coleção divergente no mesmo frame                         |
| Início             | Contagens dos filtros (categorias e redes) não batem entre si                                        | Contagens calculadas a partir dos dados do catálogo                                                                 | Os números precisam refletir o resultado real dos filtros |
| Carrinho           | Painel de valores intitulado "Resumo da carteira"                                                    | "Resumo do pedido"                                                                                                  | O painel resume o pedido, não uma carteira                |
| Carrinho (desktop) | Coluna "Edições" exibindo o seletor de quantidade; a edição do item não aparece                      | Coluna "Quantidade"; a edição aparece em uma terceira linha, abaixo do ID do token ("Edição: 1/50", como no mobile) | O mesmo NFT pode estar no carrinho em edições diferentes  |
| Carrinho           | Contador do ícone do carrinho com "6", para itens que somam 17 unidades em 3 linhas                  | O contador mostra o total de unidades                                                                               | Número inconsistente com o conteúdo                       |
| Carrinho           | Desconto zerado como "(-) 00.00"                                                                     | "(-) 0.00", sem "ETH" como no Figma; leitores de tela ouvem "ETH" (texto oculto)                                    | Mesmo formato numérico dos demais valores                 |

#### Padronizadas (variações visuais)

Variações de medida entre elementos que representam o mesmo componente. Foram padronizadas para manter consistência entre itens e entre tamanhos de tela.

| Página                     | No Figma                                                                                                                                          | Na implementação                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Início                     | Cards da grade: linhas 2 e 3 são 6px mais baixas que a primeira (página com 3668px)                                                               | Todos os cards com 258×300 (página com 3682px)                                                                                              |
| Início                     | Imagem dentro dos cards da grade com distância variável até o topo (12 a 31px)                                                                    | Imagem centralizada em todos os cards                                                                                                       |
| Detalhe                    | "Mais desta coleção": 1º card com imagem vertical (190×243, recuo 4/12/8/20); demais quadradas com recuos diferentes entre si (212×212 e 213×213) | Os cinco cards usam o mesmo componente, com imagem quadrada centralizada. A lista muda conforme o NFT aberto e todas as artes são quadradas |
| Detalhe                    | Edição selecionada "1/50" com 46px de largura; demais de 4 caracteres com 42px                                                                    | Todas com 42px, para não deslocar as opções ao trocar a seleção                                                                             |
| Cadastro (mobile)          | Placeholder de "Nome de usuário" centralizado; demais campos alinhados à esquerda                                                                 | Todos os campos alinhados à esquerda                                                                                                        |
| Login e cadastro (desktop) | Modal de login sem cantos arredondados; modal de cadastro com 8px                                                                                 | Os dois modais com 8px                                                                                                                      |

#### Mantidas como no Figma

Espaçamentos que parecem inconsistentes, mas foram conferidos no Figma e mantidos como estão no frame, para preservar a fidelidade visual.

| Página    | Elemento                      | No Figma (e na implementação)                                                                                                                                                                                                                                                             |
| --------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Início    | Banners promocionais          | A descrição começa a 6px da imagem, e o botão "Explorar" fica encostado no fim da descrição: no Figma o texto ultrapassa a própria caixa e chega a 2px do botão no primeiro banner e passa por cima dele no segundo. Na implementação o botão fica logo abaixo do texto, sem sobreposição |
| Início    | Diário da Cunhagem            | 4 cards de 268px com 24px entre eles (1144px), alinhados à esquerda na área de 1200px: sobram 56px à direita, enquanto as demais seções ocupam a largura toda                                                                                                                             |
| Rodapé    | Botão "Enviar" da newsletter  | 85px de largura, com 16px de espaço à esquerda e 4px à direita, então o texto não fica centralizado                                                                                                                                                                                       |
| Rodapé    | Faixa "Carteiras compatíveis" | 228px de largura, com cerca de 10px de espaço à esquerda e 2px à direita do texto                                                                                                                                                                                                         |
| Carteiras | Botão "Salvar carteira"       | 131px de largura para um texto de 127px, com cerca de 2px de cada lado                                                                                                                                                                                                                    |

### Outros desvios conscientes

- **NFT em destaque (início):** 476px contra 470px; no Figma o próprio conteúdo ultrapassa a caixa.
- **Segundo preço nos cards (início):** o Figma mostra alguns cards com dois valores lado a lado, sem legenda (por exemplo, Neon Vessel #552 com "1.99 ETH" em destaque e "2.29 ETH" em cor apagada). Foi interpretado como preço "de/por" de promoção: o segundo valor é o preço anterior (`compareAtPrice`). O visual segue o Figma (sem risco), e leitores de tela ouvem "Preço anterior: 2.29 ETH" (texto oculto), para os dois valores não serem lidos sem distinção. Além dos NFTs do Figma, os gerados pelo mock têm 15% de chance de ter preço anterior 15% maior. Se um evento em tempo real levar o preço a igualar ou superar o preço anterior, o preço anterior é removido.
- **Filtro selecionado (início):** no Figma, a coleção ou rede selecionada só muda de cor (`#cfb28c` para `#e89b55`), e o contraste entre as duas cores é de 1,12:1. A implementação mantém essa cor e acrescenta um sublinhado no nome, para o estado ativo não depender só da cor (WCAG 1.4.1). Leitores de tela recebem o estado por `aria-pressed`.
- **Altura da barra inferior (mobile):** no Figma, a barra tem 95px, incluindo os 34px da área do indicador de início do iPhone. A implementação usa 61px de conteúdo mais um espaço inferior de pelo menos 34px, ou a área segura do aparelho (`env(safe-area-inset-bottom)`), se for maior; assim, no Chrome e no Android a barra tem os 95px do Figma. No iOS (detectado por `@supports (-webkit-touch-callout: none)`), a barra de ferramentas do navegador já fica logo abaixo da barra, então o mínimo cai para 24px: com a barra do navegador visível a área segura é zero e a barra fica com 85px; sem ela, a área segura é de 34px e a barra volta aos 95px.
- **Botão central da barra inferior (mobile):** o gradiente do Figma começa com 40% de opacidade, e o conteúdo da página aparece através dele. Durante o scroll, o conteúdo nítido passando por trás dava a impressão de que o botão tremia. A implementação mantém o gradiente translúcido e aplica um desfoque leve no fundo (`backdrop-blur-sm`), o que preserva a cor e a transparência do Figma e suaviza o movimento atrás do botão.
- **Nota da avaliação (detalhe):** exibida como "4.8" (ponto decimal), como no Figma e no padrão dos preços em ETH. As estrelas preenchidas correspondem à parte inteira da nota.
- **Imagens dos NFTs:** o Figma tem apenas 4 artes. Os 120 NFTs do mock reutilizam essas artes com nomes diferentes, como o próprio Figma; pelo mesmo motivo, as 4 imagens da galeria de cada NFT são a mesma arte. As imagens foram convertidas para WebP em 400 e 800px.
- **Ícones:** extraídos do Figma como SVG em vez de uma biblioteca de ícones, para manter o traço original. No detalhe, estrela, menos, mais, e-mail e coração contornado vêm da geometria dos vetores; a seta de voltar foi redesenhada com o mesmo traço, porque o vetor original tem rotação que a exportação não preserva.
- **Máscara do campo de senha (login e cadastro):** o Figma mostra a senha oculta como asteriscos (`***********`). A implementação mantém o caractere nativo do navegador (bolinhas), porque a máscara de um `<input type="password">` é definida pelo navegador e pelo sistema, sem propriedade CSS padrão para asteriscos. Simular asteriscos exigiria trocar o campo para texto comum (quebrando preenchimento automático, gerenciadores de senha, o anúncio do campo como senha para leitores de tela e expondo o valor no DOM) ou carregar uma fonte específica só para isso.

### Estados e conteúdos não desenhados

Seguem o mesmo padrão visual do Figma, como pede o enunciado.

- **Aba "Avaliações de colecionadores" (detalhe):** o Figma mostra a aba sem conteúdo; a implementação exibe uma lista simples (autor, nota, comentário e data) vinda da API, carregada apenas quando a aba é aberta.
- **Edição esgotada:** desabilitada, riscada e anunciada como "esgotada" para leitores de tela (não depende só de cor). A primeira edição disponível vem selecionada.
- **Limite de quantidade:** o máximo é o menor valor entre a disponibilidade da edição e o limite por pedido; no limite, o botão de aumentar fica desabilitado e uma mensagem explica o motivo.
- **Galeria:** no desktop, a lupa abre a imagem ampliada em um diálogo (foco preso, Esc fecha e devolve o foco); no mobile, carrossel com deslize e indicadores.
- **Skeletons:** mantêm as dimensões do conteúdo; o do detalhe inclui abas e relacionados para não deslocar o layout ao carregar.
- **NFT inexistente e falha de rede (detalhe):** mensagem de "NFT não encontrado" com link para o catálogo; em falha, mensagem de erro com "Tentar novamente".

### Responsividade fora dos frames

- **Hero no mobile (início):** altura mínima de 190px com o espaçamento do frame (5px no topo, 16px até os indicadores, 6px no fundo). Abaixo de 390px a imagem encolhe (até 96px) e o card cresce em vez de cortar o texto.
- **Banners promocionais (início):** não existem no frame mobile. Abaixo de 640px a imagem fica em cima e o texto alinhado à esquerda; a partir de 640px seguem o desktop (texto à direita).
- **Header entre 768 e 1023px:** o botão "Entrar" mostra só o ícone (o texto continua disponível para leitores de tela e como `title`), liberando espaço para o campo de busca (200px). O campo encolhe até 120px se faltar espaço. A área de 160px da logo só vale a partir de 1280px.
- **Rodapé:** em tablet, os destaques ficam em 3 colunas e a newsletter ocupa a linha inteira (texto e campo lado a lado, campo com até 400px); no mobile, tudo centralizado.
- **Abas em telas estreitas:** rolam horizontalmente dentro da própria faixa, sem quebrar a página.
- **Detalhe no tablet:** abaixo de 1024px as miniaturas da galeria ficam abaixo da imagem principal; entre 768 e 1023px o texto da avaliação é encurtado para "19 avaliações".
- **Detalhe no mobile:** o frame não tem a barra de navegação inferior; a barra fixa de compra a substitui e o botão "voltar" do topo cobre a navegação. O rodapé recebe um recuo maior para não ficar coberto pela barra.
- **Conteúdo abaixo da primeira tela no mobile (detalhe):** o frame mobile tem a altura de uma tela (896px) e termina nos atributos, sob a barra de compra. O conteúdo seguinte — "Compartilhar este NFT", abas de detalhes e avaliações, "Mais desta coleção" e rodapé — segue o desktop, para manter as mesmas funções em todos os tamanhos de tela.
- **Cards de "Mais desta coleção":** usam o card do catálogo em versão compacta (nome 15px, preço 16px), como no Figma.

### Comportamento e acessibilidade

- **Ações fora do escopo** (Criadores, Aprenda, links editoriais do rodapé e newsletter) exibem um aviso de "indisponível" em vez de simular sucesso.
- **Navegação para o detalhe:** o card inteiro do catálogo é clicável (link no nome estendido sobre o card, com foco visível no card); a imagem do hero e o NFT em destaque também levam ao detalhe.
- **Busca do header:** o valor espelha o parâmetro `q` da URL. O campo fica aberto enquanto há busca ativa; o botão "X" limpa a busca e mantém o campo aberto; Esc cancela a busca, fecha o campo e devolve o foco para a lupa. Os demais filtros são preservados.
- **Restauração de rolagem ao voltar:** ao voltar no histórico (incluindo o botão "voltar" do detalhe mobile), a página reabre na posição em que estava, de forma instantânea (`scrollRestorationBehavior: 'instant'`). A rolagem suave do `html` continua valendo para os links de âncora, como "Mercado".
- **Página fora do intervalo (catálogo):** se a URL pedir uma página maior que o total (link antigo ou URL editada), o catálogo substitui a entrada do histórico pela última página existente, depois que a resposta dos parâmetros atuais chega (dados provisórios da busca anterior são ignorados). Na paginação, só a página atual recebe `aria-current`.
- **Rolagem até o catálogo:** ocorre ao enviar a busca, não ao abrir o campo, para não mover a página sem ação explícita do usuário.
- **Recuo da rolagem:** o recuo para o header fixo fica nas seções de destino (`scroll-margin`), e não no `html` (`scroll-padding`), que fazia a página subir a cada tecla digitada no campo do header.
- **Compartilhar (detalhe):** LinkedIn, e-mail e X abrem os links reais de compartilhamento com a URL do NFT (nova aba; e-mail via `mailto:`).
- **Cursor:** o Tailwind v4 removeu o `cursor: pointer` padrão dos botões; a regra foi restaurada globalmente para botões habilitados, e o slider usa `grab`/`grabbing`.
- **Título da aba:** cada página define o próprio título (`usePageTitle`), como "Emerald Ape #042 | Kurio", "Carrinho | Kurio" ou "Página não encontrada | Kurio"; o início usa "Kurio | Marketplace de NFTs", que também é o título do `index.html` antes de o JavaScript carregar. Isso identifica a página para leitores de tela, no histórico e nas abas (WCAG 2.4.2).
- **Retorno ao toque:** utilitário `pressable` (opacidade ao pressionar, sem realce cinza do iOS e sem seleção de texto) nos botões principais.

### Tratamento de falhas

- **Resposta que não é JSON:** o cliente axios rejeita respostas da API sem `Content-Type: application/json` (exceto 204) com o código `INVALID_RESPONSE`. A tela mostra o estado de erro com "Tentar novamente", em vez de quebrar ao ler um formato inesperado (por exemplo, o HTML da aplicação quando a requisição não chega à API).
- **Erros de renderização:** o router usa uma tela de erro padrão (`defaultErrorComponent`), em português e no visual do projeto, exibida dentro do layout (header e rodapé continuam visíveis). "Tentar novamente" limpa o cache de consultas (exceto a sessão, para não deslogar nem bloquear a renderização) e recarrega a rota; "Voltar para o início" recarrega a aplicação.
- **Pré-carregamento nas rotas:** os loaders usam `queryClient.query(...).catch(noop)` (substituto do `prefetchQuery`, depreciado no TanStack Query 5). Uma falha no pré-carregamento não interrompe a navegação; o erro é exibido pela própria página.

### Particularidades de navegadores

- **Campos no mobile** usam fonte de 16px para evitar o zoom automático do iOS ao focar.
- **Cor da barra superior do Safari (detalhe mobile):** o Safari 26 pinta a área sob a barra de endereço com o `background-color` do `body`, ignorando `theme-color`, o fundo do `html` e elementos fixos pequenos (testado no simulador do iPhone). No detalhe mobile, o `body` recebe a cor do topo do hero como `background-color`, coberta por uma imagem de fundo na cor da página. Como o gradiente do hero no Figma é diagonal, uma camada sólida na cor do topo esmaece nos primeiros 120px do hero, deixando a borda superior uniforme e emendada com a faixa do Safari; o restante mantém o gradiente diagonal.
- **Recuo inferior da barra de compra (detalhe mobile):** o Figma reserva 36px abaixo dos botões, que correspondem à área do indicador de início do iPhone. A implementação usa `max(16px, env(safe-area-inset-bottom))`: no aparelho, a área segura real (34px) aproxima o Figma; com a barra de ferramentas do Safari visível, a área segura é 0 e o Safari 26 pinta a região da própria barra com a cor do elemento fixo, então um recuo fixo deixava a barra visualmente alta demais.
- **Mocks exigem contexto seguro para autenticação:** o mock de login e cadastro usa a Web Crypto (`crypto.subtle` para o hash SHA-256 das senhas e `crypto.randomUUID` para tokens e salts), disponível apenas em contexto seguro (HTTPS ou `localhost`). Ao acessar o servidor de desenvolvimento pelo IP da rede por HTTP (por exemplo, `yarn dev --host` para testar no celular), essas APIs não existem e o login das contas de teste falha com erro genérico; o catálogo continua funcionando, porque sem service worker o MSW intercepta as requisições diretamente na página. O deploy é servido por HTTPS e não é afetado. Para testar a autenticação em um aparelho físico, use um túnel HTTPS (`cloudflared` ou `ngrok`), o simulador do iOS (que acessa `localhost`) ou o deploy de preview.
- **MSW e cache de voltar/avançar (Chrome):** o MSW desregistra a página no `beforeunload`, que também dispara quando o Chrome guarda a página no cache de voltar/avançar (bfcache). Ao restaurar a página, as requisições deixavam de ser interceptadas e chegavam ao servidor como HTML, quebrando a tela. O `enableMocking` reativa o worker no `pageshow` com `persisted`, mantendo os mocks ativos também no ambiente publicado.

## Decisões por funcionalidade

### Autenticação

- **Modal sobre a página atual:** login e cadastro abrem como modal sobre a página em que o usuário está, controlados pelo parâmetro `?auth=login` ou `?auth=cadastro` (validado na rota raiz). Recarregar ou compartilhar o link mantém o modal aberto sobre a mesma página. As rotas `/login` e `/cadastro` existem para acesso direto e redirecionam para a home com o modal aberto, como no frame do Figma. A abordagem de renderizar a home dentro da rota `/login` foi descartada porque os componentes da home dependem dos parâmetros da rota `/`.
- **Fechar e retornar:** fechar (X, Esc, clique fora ou "voltar" do navegador) mantém o usuário na mesma página. Quando o modal foi aberto pela aplicação, fechar volta no histórico, para o "voltar" do navegador não reabri-lo; em acesso direto, o parâmetro é removido da URL. Após entrar ou criar a conta, o usuário permanece na página; se houver `?redirect=` (apenas caminhos internos), é levado para ele. O foco volta para o elemento que abriu o modal.
- **Sessão:** o token fica no `localStorage` e é validado na API (`GET /auth/session`) ao recarregar; se estiver expirado, o usuário fica deslogado, sem aviso. Durante a navegação, a expiração é tratada de duas formas: no horário de `expiresAt` retornado pela API e em qualquer resposta 401 de sessão expirada. Nos dois casos, o usuário é deslogado, avisado e o modal de login abre sobre a página atual, preservando o contexto. O cenário `short-session` reduz a sessão a 30 segundos para testes.
- **Armazenamento do token:** o token de acesso fica no `localStorage`, o que mantém a sessão após recarregar e em novas abas. Com um backend real, o recomendado seria o servidor emitir os tokens (acesso e refresh) em cookies `HttpOnly`, `Secure` e `SameSite`, inacessíveis ao JavaScript da página e, portanto, protegidos contra leitura por XSS. Isso não é possível aqui porque a API é simulada pelo MSW em um service worker, que não consegue criar cookies `HttpOnly`. O `sessionStorage` foi descartado por não trazer ganho de segurança (também é legível pelo JavaScript) e exigir login a cada nova aba. O risco é limitado por: token opaco, expiração em 1 hora, invalidação no servidor (mock) ao sair, nenhum outro dado sensível armazenado e nenhuma injeção de HTML de terceiros na página.
- **Logout e troca de usuário:** removem do cache todas as consultas, exceto a da sessão, que é marcada como vazia (os componentes que já a observavam passam a ver o usuário deslogado).
- **Senhas:** o mock armazena apenas hash SHA-256 com salt; nenhuma senha fica em texto puro. Usuários de teste: `ana@kurio.dev` e `bruno@kurio.dev`, ambos com a senha `Kurio@123`.
- **Fora do escopo:** "Continuar com Google/Facebook" e "Esqueceu a senha?" exibem o aviso de "indisponível".
- **Fundo do modal:** no Figma, o modal fica sobre a home sem escurecer o fundo (a camada "BG" do frame não tem preenchimento); a implementação segue isso, mantendo a camada transparente para capturar o clique fora.
- **Foco inicial:** no desktop, o foco vai para o primeiro campo; em telas de toque, para o próprio modal, para não abrir o teclado sobre a tela antes de o usuário tocar em um campo.
- **Mostrar senha:** o Figma tem apenas o ícone de ocultar senha; o ícone de mostrar foi desenhado com o mesmo traço (1,5px).
- **Voltar no mobile:** os frames mobile de login e cadastro não têm como sair da tela; foi adicionado um botão "voltar" no topo, igual ao do detalhe.
- **Textos do botão de cadastro:** "Criar conta" no desktop e "Criar perfil" no mobile, como em cada frame.
- **Header logado:** o Figma mostra "Entrar" também nas telas logadas. Logado, o botão dá lugar a um botão de conta: avatar circular de 35px com as iniciais (fundo `secondary`, borda `primary`, iniciais em `accent`) e uma seta indicando o menu, em todas as larguras a partir de 768px. O nome não aparece no botão porque, no espaço do "Entrar" (100px), nomes com mais de três letras seriam cortados; o nome completo e o e-mail ficam no topo do menu, e o rótulo do botão para leitores de tela é "Conta de {nome}". O menu tem "Meu perfil", "Minhas carteiras", "Lista de interesse" e "Sair". No mobile, o ícone de perfil da barra inferior leva ao login ou, logado, abre o mesmo menu. Ao sair, um aviso confirma o logout e o usuário permanece na página atual.

### Lista de interesse (favoritos)

- **Nome:** a interface usa "Lista de interesse", como no menu do perfil e no rodapé do Figma; no detalhe, os botões dizem "Favoritar" e "Favoritado".
- **Atualização otimista:** favoritar ou remover altera o estado na hora; se a API falhar, o estado anterior é restaurado e um aviso informa o erro. Cliques seguidos são enfileirados. O cenário `favorites-error` força a falha para testes.
- **Onde favoritar:** botão "Favoritar" no detalhe (desktop), coração no topo do detalhe (mobile) e coração no canto da imagem dos cards. No Figma, o coração aparece apenas nos cards do mobile; ele foi estendido aos cards do desktop sem alterar o estado de repouso do frame: em dispositivos com mouse (`pointer: fine`), o coração fica oculto e aparece no hover ou quando o foco do teclado (`:focus-visible`) entra no card — o foco deixado por um clique do mouse não o mantém visível depois que o mouse sai; em dispositivos de toque (celular e tablet, inclusive acima de 1024px), fica sempre visível. Quando o NFT está na lista, o coração preenchido fica sempre visível, como indicador. A decisão usa o tipo de ponteiro, e não a largura da tela, porque tablets na horizontal passam de 1024px e não têm hover.
- **Estado do coração:** o Figma mostra o coração em contorno (NFT fora da lista); o estado "na lista", não desenhado, usa o mesmo coração preenchido, na mesma cor. Os botões informam o estado também a leitores de tela (`aria-pressed` e rótulo "Adicionar à"/"Remover da lista de interesse"); no detalhe, o texto muda de "Favoritar" para "Favoritado".
- **Sem login:** favoritar abre o modal de login; após entrar, o NFT é adicionado automaticamente (ou um aviso informa que ele já estava na lista), preservando o contexto. Fechar o modal sem entrar descarta a ação. Abrir a página da lista sem login usa o `redirect` do modal, levando à página após entrar.
- **Remoção na página:** como os cards do desktop não têm coração, cada card da página tem o botão "Remover da lista".
- **Página:** `/perfil/lista-de-interesse`, com o menu lateral do frame de perfil no desktop e título com grade de cards no mobile (sem frame). Exige login: sem sessão, abre o modal de login e retorna à página após entrar. Acessível pelo menu da conta, pelo coração da barra inferior e pelo link do rodapé.
- **Menu lateral do perfil:** segue os itens do Figma. "Dados do perfil" e "Carteiras" levam às páginas correspondentes; Atividade, Ofertas, Arquivos baixados e Suporte exibem "indisponível" por estarem fora do escopo. Ao sair a partir de uma página do perfil, o usuário volta para a home. Abaixo de 1024px o menu lateral fica oculto e dá lugar às abas do topo (detalhes em "Perfil e carteiras").

### Carrinho

- **Acesso:** `/carrinho` funciona sem login (carrinho de visitante, identificado por um ID guardado no navegador e enviado no header `X-Guest-Cart-Id`). Ao entrar ou criar a conta, os itens do visitante são somados ao carrinho do usuário, respeitando disponibilidade e limite por pedido.
- **Moeda única:** todos os preços, descontos e taxas são cotados em ETH, como pede o README ("Valores em ETH devem trafegar como strings decimais"). A rede (Ethereum, Polygon, Solana) indica a blockchain do NFT e, no checkout, define a taxa de rede da cotação. Preços em moedas nativas de cada rede (SOL, POL) exigiriam conversão e somas em várias moedas no mesmo pedido, o que está fora do escopo do desafio e do Figma.
- **Valores:** subtotal, desconto, taxa de rede e total vêm da cotação da API (`GET /cart/quote`), com valores em ETH trafegando como strings decimais. A taxa exibida no carrinho é a estimada para a rede Ethereum ("Taxa estimada", como no Figma); a rede de pagamento é escolhida no checkout.
- **Edição de itens:** alterar a quantidade e remover respondem na hora e revertem com aviso se a API recusar (por exemplo, por falta de estoque).
- **Cupom:** aplicar e remover pela API; código inválido ou vencido exibe o erro no próprio campo. Cupons de teste: `KURIO10`, `GENESIS15` e `EXPIRADO20` (vencido).
- **Remover no mobile:** no Figma, apenas um dos cards tem lixeira, sobreposta ao botão "+". Na implementação, quando a quantidade é 1, o botão "−" do seletor muda para a cor coral e passa a remover o item (rótulo "Remover {nome} do carrinho" para leitores de tela, com aviso de confirmação); com quantidade maior, volta a diminuir a quantidade. A cor coral, e não o cinza de desabilitado, indica que o botão continua ativo. O card fica sem elementos extras, e o foco do teclado é preservado, pois é o mesmo botão. No desktop, a coluna de lixeira do Figma é mantida.
- **Mobile:** o frame não tem a barra de navegação inferior; o carrinho usa o botão "voltar" do topo e o resumo fica no fim da página.
- **Largura do resumo do carrinho:** até 479px, cupom e botão ocupam a largura toda, como no frame mobile; entre 480 e 767px, o painel mantém o fundo de ponta a ponta, mas o conteúdo fica limitado a 400px e centralizado; entre 768 e 1023px, o resumo fica abaixo da tabela, alinhado à direita, com 332px e o visual do desktop; a partir de 1024px, ao lado da tabela, com 332px fixos (a tabela ocupa o restante).
- **Carrinho abaixo de 400px:** a posição do seletor de quantidade do frame (à direita, no meio do card) só cabe a partir de cerca de 400px; abaixo disso ele desce para a linha do preço, alinhado à direita. Abaixo de 360px, as margens laterais passam de 28px para 16px e a imagem do card de 100px para 80px de largura, para que preço e seletor caibam lado a lado. Valores do resumo nunca quebram linha (se faltar espaço, quebra o rótulo).
- **Cliques rápidos na quantidade:** as alterações do carrinho são enviadas em fila, na ordem dos cliques. A tela mantém o valor otimista até a última resposta chegar, e só então aplica o carrinho e a cotação vindos da API, evitando que o número volte a valores intermediários. Em caso de erro, o carrinho é recarregado da API.
- **Colunas da tabela do carrinho (desktop):** cabeçalho e linhas compartilham as mesmas colunas (CSS subgrid), que crescem conforme o conteúdo, como o título "Quantidade" ou um seletor com 2 dígitos. Assim, todas as linhas ficam alinhadas e nada se sobrepõe em telas de 1024px. Em 1440px, as colunas ficam a até 11px das posições do Figma (Preço 426 em vez de 431, Quantidade 559 em vez de 570, Total 711 em vez de 706).
- **Detalhe → carrinho:** "Comprar" adiciona e leva ao carrinho; o ícone de carrinho do mobile apenas adiciona, com aviso e atalho "Ver carrinho".
- **Limite somando o carrinho:** o seletor do detalhe limita a quantidade pela disponibilidade da edição; ao adicionar, a API considera também o que já está no carrinho e recusa o excedente com "Quantidade indisponível para esta edição."
- **"Conectar e finalizar":** exige login (sem sessão, abre o login com retorno ao carrinho) e leva ao pagamento (detalhes em "Pagamento e pedidos").
- **"Colecionadores também viram":** NFTs da aba "Em alta", excluindo os que já estão no carrinho.

### Pagamento e pedidos

- **Fluxo:**
  1. **Carrinho:** "Conectar e finalizar" sem carteira conectada e "Finalizar compra" com carteira conectada levam a `/pagamento`, que exige login. Sem sessão, o login abre sobre a página atual e volta ao pagamento.
  2. **"Confirmar compra":** valida o formulário e simula a conexão da carteira (~1s, `POST /me/wallets/:id/connect`).
  3. **Revisão:** uma cotação nova abre o diálogo de revisão.
  4. **"Assinar e pagar":** cria o pedido (`POST /orders`), que nasce pendente e é confirmado ou recusado em ~4s pelo evento `order.updated`.
- **Formulário (desktop):** "Perfil do colecionador" vem preenchido com os dados da conta e da carteira escolhida. É editável e enviado como snapshot no pedido, sem alterar a carteira cadastrada.
  - **"Usar outra carteira?":** troca para a carteira secundária e recarrega os campos, preservando a observação. Sem secundária, fica desabilitada com uma dica.
  - **"Tipo de carteira" e "Carteira e rede":** o Figma mostra os dois controles; ambos escolhem o mesmo provedor e ficam sincronizados.
  - **Primeira opção de "Carteira e rede":** no Figma mostra a faixa de logos "METAMASK · WALLETCONNECT · COINBASE"; foi tratada como WalletConnect, como no mobile.
  - **"Nome ENS":** o Figma do pagamento mostra só o seletor ".eth"; foi adicionado o campo de texto ao lado do seletor, como no frame de Carteiras.
  - **"Tem um código promocional? Aplique aqui":** leva ao carrinho, onde fica o campo de cupom; com cupom aplicado, mostra "Cupom X aplicado".
- **Mobile:** segue o frame, sem formulário. Os dados do colecionador vêm da carteira escolhida, e a rede é a da carteira.
  - **"Trocar carteira":** desconecta a carteira atual.
  - **Menu "⋮" dos cards:** oferece "Editar carteira", que leva à página de Carteiras.
- **Revisão e mudanças:** antes de enviar, o diálogo mostra itens, carteira, rede e valores. O "valor visto" é a primeira cotação exibida para a rede escolhida.
  - **Mudanças de preço, disponibilidade, cupom ou taxa:** o diálogo lista as mudanças e exige "Aceitar novos valores" antes de "Assinar e pagar".
  - **Itens indisponíveis:** o envio fica bloqueado com "Ajustar carrinho".
- **Cotação validada no servidor:** o id da cotação é um hash dos valores cotados. O pedido envia o id revisado, e se algo mudou (por exemplo, um `nft.updated` no meio do caminho), a API responde 409 `QUOTE_OUTDATED` com a cotação nova, e a revisão reabre com as diferenças.
- **Idempotência:** o envio usa o header `Idempotency-Key`, guardado no `sessionStorage` junto com uma impressão do payload. Cliques repetidos, a nova tentativa automática após timeout e reenvios manuais com o mesmo payload reutilizam a chave, e a API devolve o pedido já criado; a mesma chave com outro payload responde 409 `IDEMPOTENCY_CONFLICT`. A criação de pedido é a única mutation com nova tentativa automática (uma vez, só em erro transitório). Enquanto o envio está em andamento, e depois que o pedido foi criado nesta visita, o pagamento não redireciona para o carrinho vazio: com o timeout, o pedido pode ser confirmado (esvaziando o carrinho) antes de a nova tentativa devolver o pedido, e a página de pagamento continua montada durante a navegação até ele.
- **Pedido pendente:** ao abrir `/pagamento` com um pedido pendente, o usuário vai direto para ele. A página do pedido atualiza pelo evento `order.updated`, enviado só às conexões autenticadas como o dono do pedido. Também consulta a API a cada conexão do socket, inclusive a primeira, porque o pedido pode ter sido resolvido antes de a conexão abrir. Após recarregar, o mock reagenda os pedidos pendentes.
- **Após a confirmação:** saem do carrinho só os itens e quantidades comprados (e o cupom usado), e o estoque cai, gerando `nft.updated`. Pedido recusado mantém o carrinho intacto.
- **Rascunho:** o formulário e a carteira escolhida ficam no `sessionStorage` enquanto a página está aberta. Se a sessão expirar no meio do pagamento, o fluxo continua de onde parou depois do login. O rascunho é apagado quando o pedido é criado.
- **Sem carteira cadastrada:** o pagamento mostra "Cadastre uma carteira para continuar", com um link para a página de Carteiras.
- **Confirmação (`/pedidos/:id`):** o Figma mostra a confirmação como um modal sobre a página de pagamento escurecida. Foi implementada como página com o mesmo card centralizado, para funcionar com acesso direto e após recarregar.
  - **"X":** volta ao catálogo.
  - **Linha de desconto:** aparece quando houve cupom (o Figma não tem).
  - **Mobile (sem frame):** abaixo de 640px, o subtotal fica acima da quantidade, à direita do item, e nome e ID do token quebram linha em vez de serem cortados. As margens laterais diminuem (16px na página e 20px no card) para caber o nome completo em telas de ~400px. A partir de 640px, vale o layout do Figma.
  - **"Ver no Etherscan":** como a transação é simulada, o botão avisa que ela não existe na rede, em vez de abrir uma página "não encontrada". Polygon e Solana usam o nome do explorador da própria rede (Polygonscan, Solscan).
  - **Estados não desenhados:** pendente (indicador de progresso e "Aguardando confirmação na rede…") e recusado (motivo, "Voltar ao pagamento" e "Ver carrinho"). A mudança de estado é anunciada por `role="status"` e por toast.
- **Cenários de pagamento:**

| Cenário                    | Efeito                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `wallet-rejected`          | A primeira conexão é recusada; a segunda funciona                                    |
| `payment-declined`         | O pedido é recusado                                                                  |
| `price-change-on-checkout` | O preço do primeiro item sobe 0.05 ETH no envio, via evento                          |
| `sold-out-on-checkout`     | A edição do primeiro item esgota no envio                                            |
| `order-timeout`            | O pedido é criado, mas a resposta se perde; a nova tentativa recupera o mesmo pedido |

Os cenários de uso único valem uma vez por carregamento da página.

### Perfil e carteiras

- **Rotas:** `/perfil` leva a `/perfil/dados`. "Dados do perfil" e "Carteiras" passam a ser links no menu lateral e no menu da conta. "Atividade", "Ofertas", "Arquivos baixados" e "Suporte" continuam fora do escopo, com aviso de indisponível.
- **Mobile (sem frame):** o menu lateral do Figma só aparece a partir de 1024px. Abaixo disso, abas roláveis ("Dados", "Carteiras", "Lista de interesse") ficam no topo das páginas do perfil.
- **Perfil:** um único "Salvar" atualiza os dados e, se os campos de senha estiverem preenchidos, também troca a senha.
  - **Campos de senha:** são opcionais. Basta preencher um deles para exigir os três: senha atual, nova senha válida e confirmação igual. O texto "Preencha apenas se quiser trocar a senha" foi adicionado para explicar isso.
  - **Erros da API:** nome de usuário ou e-mail em uso e senha atual incorreta aparecem no próprio campo.
  - **"Apelido da carteira":** o Figma coloca esse campo no perfil, sem explicar o uso. Foi mantido como dado do perfil, independente do apelido de cada carteira cadastrada.
- **Avatar:** "Alterar" abre o seletor de arquivos e envia a imagem na hora (PNG, JPEG ou WebP, até 1,5 MB, validado no cliente e no mock). A imagem também aparece no botão da conta no header. A regra de formato e tamanho só aparece como aviso quando o arquivo é recusado, porque o Figma não a mostra. "Remover" fica sempre com a aparência do Figma; sem avatar, avisa que não há o que remover.
- **Nome ENS:** o seletor `.eth` com a seta do Figma é um select real, mas com uma única opção, porque `.eth` é o único domínio oferecido. O mesmo componente é usado no pagamento, no perfil e nas carteiras.
- **Carteiras:** o formulário segue o frame, com os mesmos campos e validações no cliente e no mock.
  - **"Adicionar":** aparece só quando a carteira ainda não existe e abre o formulário vazio, já preenchido com nome, e-mail e usuário da conta.
  - **"Igual à carteira principal":** copia a principal para a secundária, mantendo um apelido próprio ("Reserva") para distinguir as duas no pagamento. O círculo fica marcado quando os endereços são iguais. Sem carteira principal, fica desabilitado.
- **Persistência:** perfil, senha, avatar e carteiras ficam no banco do mock e permanecem após recarregar. As carteiras salvas aparecem no pagamento na hora, porque compartilham a mesma consulta.

### Tempo real (Socket.IO)

- **Transporte simulado:** o servidor Socket.IO é simulado pelo MSW com `@mswjs/socket.io-binding`, que traduz o protocolo do Socket.IO sobre o WebSocket interceptado. O cliente é o `socket.io-client` real, conectado à mesma origem da aplicação (ou a `VITE_SOCKET_URL`).
- **Limitações do transporte nos mocks:**
  - **Só WebSocket:** o cliente usa `transports: ['websocket']`, porque o MSW intercepta conexões WebSocket, mas não o long-polling HTTP que o Socket.IO usa por padrão.
  - **Interceptação na página:** diferente do REST, que passa pelo service worker, o WebSocket é interceptado substituindo a classe global `WebSocket` na própria página.
  - **`socket.io-client` carregado depois dos mocks:** o `socket.io-client` guarda a classe `WebSocket` que encontra ao ser importado. Por isso ele é importado sob demanda, só ao abrir a conexão em tempo real, quando os mocks já estão ativos; importado junto com o app, a conexão iria para o servidor real.
  - **Sem salas nem namespaces:** a binding não implementa salas, namespaces nem difusão. O servidor simulado mantém a lista de conexões e envia os eventos para cada uma.
  - **Heartbeat manual:** o servidor simulado envia os pings do engine.io a cada 20s. Sem eles, o cliente encerraria a conexão por timeout.
  - **Recusa de conexão:** quando o servidor está indisponível, o mock sinaliza erro antes de fechar o socket, para o cliente tentar de novo com o backoff normal em vez de esperar o timeout de conexão (20s).
  - **Caminho da conexão:** o MSW remove o caminho padrão `/socket.io/` antes de comparar URLs, então o link do mock aponta para a origem. Outras conexões na mesma origem, como o HMR do Vite, seguem para o servidor real.
- **Evento `nft.updated`:** `{ eventId, type, resource: { type: 'nft', id }, version, occurredAt, data: { price, compareAtPrice, editions } }`. O NFT tem `version` também nas respostas REST, para comparar com o cache.
- **Coerência com o REST:** cada alteração simulada muda o NFT no banco do mock (persistido no navegador) antes de emitir o evento, então REST e evento sempre mostram o mesmo estado.
- **Disparo dos eventos:**
  - **Automático:** a cada 30s, enquanto houver conexão aberta, um NFT muda de preço (±3–12%) ou de disponibilidade. Os NFTs que estão em algum carrinho têm preferência, para o efeito aparecer na demonstração.
  - **Controlado:** `POST /__mock/realtime/nft-updated` (`{ nftId, price?, editions? }`) e `POST /__mock/realtime/disconnect` (`{ downtimeMs? }`). Ficam fora de `/api`, então não sofrem os cenários de rede, e passam pelo servidor simulado, nunca direto pela interface.
- **Cenários:**

| Cenário               | Efeito                                                                               |
| --------------------- | ------------------------------------------------------------------------------------ |
| `realtime-off`        | Sem eventos automáticos (para demonstrações controladas e testes)                    |
| `realtime-duplicates` | Cada evento é reenviado, e o evento anterior do mesmo NFT é reenviado depois do novo |
| `realtime-unstable`   | A conexão cai entre 12 e 25s depois de aberta                                        |
| `offline`             | Também recusa a conexão em tempo real                                                |

- **Duplicatas e eventos antigos:** o cliente ignora `eventId` já processado e versões menores ou iguais à última aplicada. Além disso, só altera o cache se a versão do evento for maior que a do dado em cache, inclusive quando o dado veio de uma resposta REST mais nova.
- **Aplicação no cache:**
  - **Detalhe:** atualiza preço e edições.
  - **Catálogo, destaques, relacionados e lista de interesse:** atualizam o preço no próprio item.
  - **Listas filtradas ou ordenadas por preço:** ficam marcadas como desatualizadas (sem recarregar na hora, para os itens não mudarem de lugar sob o cursor) e são recarregadas na próxima visita.
  - **Carrinho e cotação:** são recarregados da API, que é a referência para finalizar. Se houver uma alteração de quantidade em andamento, a recarga é dispensada, porque a resposta dessa alteração já traz o carrinho atualizado.
- **Reconexão:** ao reconectar, o catálogo, os detalhes, a lista de interesse, o carrinho e a cotação são invalidados (os que estão na tela são recarregados), recuperando eventos perdidos durante a queda.
- **Isolamento por sessão:** há uma conexão por sessão, com o token no handshake. Ao entrar, sair ou trocar de usuário, a conexão anterior e seus listeners são encerrados antes de abrir a nova.
- **Feedback (não há no Figma):**
  - **Carrinho:** toast quando o preço de um item muda ou ele esgota ou fica com menos unidades que a quantidade escolhida. A linha do item mostra "Preço atualizado de X para Y ETH desde que foi adicionado", em cor neutra, por ser informativo; esgotado e quantidade acima do disponível continuam em coral, porque bloqueiam a compra.
  - **Detalhe:** toast quando o preço muda ou quando a edição exibida esgota (a seleção passa para a próxima edição disponível).
  - **Catálogo:** atualiza sem aviso, para não gerar uma sequência de toasts.
  - **Conexão perdida:** aviso "Reconectando…" no topo da tela, só se a reconexão demorar mais de 1,5s. Para leitores de tela, a mensagem completa é "Reconectando às atualizações em tempo real".
  - **Acessibilidade:** os toasts são anunciados por leitores de tela, e o aviso de conexão usa `role="status"`.

## Qualidade

### Testes E2E (Playwright)

- **Ambiente:** os testes rodam contra o build de produção com os mocks ligados (`yarn build && yarn preview`, porta 4317), como a demo publicada, nos projetos `desktop` (1440×900) e `mobile` (Pixel 7).
- **Isolamento:** cada teste usa um contexto de navegador novo, então o banco do mock, a sessão e o carrinho começam vazios. O cenário padrão é `fast,realtime-off` (sem latência e sem eventos aleatórios); cada teste pode trocar o cenário.
- **Controle de tempo, latência e eventos:** a expiração de sessão usa `page.clock`; latência, falhas e timeout vêm dos cenários do MSW. Eventos de tempo real são disparados pelos endpoints de controle do servidor Socket.IO simulado e chegam pelo `socket.io-client`, nunca direto na interface.
- **Atalhos:** fora do teste de autenticação, o login é feito pela API simulada, sem passar pelo formulário.
- **Regressão visual:** início, detalhe, carrinho e pagamento nos dois viewports, com animações desligadas, `prefers-reduced-motion` e todas as imagens carregadas antes da captura. As baselines ficam versionadas em `e2e/__screenshots__/` e são atualizadas com `yarn test:e2e:update`.
- **Relatório:** HTML (`yarn test:e2e:report`), com trace, vídeo e captura das falhas.
- **Cobertura dos 12 fluxos do enunciado:**

| Fluxo                                                                 | Spec                    |
| --------------------------------------------------------------------- | ----------------------- |
| 1. Busca, filtros, ordenação, paginação e histórico                   | `catalog.spec.ts`       |
| 2. Acesso direto e recurso inexistente                                | `nft-details.spec.ts`   |
| 3. Cadastro, login, expiração, logout e troca de usuário              | `auth.spec.ts`          |
| 4. Favoritos com falha e recuperação                                  | `favorites.spec.ts`     |
| 5. Carrinho, quantidades, remoção, cupom e persistência               | `cart.spec.ts`          |
| 6. Compra do catálogo ao recibo                                       | `checkout.spec.ts`      |
| 7. Pagamento recusado, clique repetido e timeout com o mesmo pedido   | `checkout.spec.ts`      |
| 8. Perfil, avatar, senha e carteiras                                  | `account.spec.ts`       |
| 9. Preço e disponibilidade via Socket.IO no checkout                  | `checkout.spec.ts`      |
| 10. Eventos duplicados ou antigos, desconexão e pedido pendente       | `realtime.spec.ts`      |
| 11. Teclado, foco de diálogos e validação                             | `accessibility.spec.ts` |
| 12. Skeletons com rede lenta, falha e recuperação após nova tentativa | `network.spec.ts`       |

- **Além dos 12 fluxos:** `network.spec.ts` também cobre respostas fora de ordem na paginação e a recuperação automática de uma falha temporária; `checkout.spec.ts` confirma que o pedido de outro usuário não é exibido (403).
- **Larguras avaliadas:** 390, 768 e 1440px em todas as rotas (início, detalhe existente e inexistente, carrinho, pagamento, perfil, carteiras, lista de interesse, rota inexistente e modais de login e cadastro), logado e com itens no carrinho, sem overflow horizontal.

### Performance e Lighthouse

- **Como medir:** `yarn lighthouse` gera o build de produção, sobe o `vite preview` (porta 4318, com gzip e os mocks ativos no cenário padrão) e roda o Lighthouse 13.5.0 três vezes por página (início e detalhe) e perfil (mobile e desktop). `yarn lighthouse:deploy` faz as mesmas medições na URL publicada. Cada categoria é a mediana das três medições. Os relatórios HTML e JSON da medição mediana, o `summary.md` e o `summary.json` (com versões, ambiente e as três medições) ficam em `lighthouse/reports/` (local) e `lighthouse/reports/deploy/` (URL publicada).
- **Resultado na URL publicada (mediana):**

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO |   LCP | CLS |   TBT |
| ------- | ------- | ----------: | ------------: | -------------: | --: | ----: | --: | ----: |
| Início  | mobile  |          90 |           100 |            100 | 100 | 3,1 s |   0 | 35 ms |
| Início  | desktop |         100 |            97 |            100 | 100 | 0,6 s |   0 |  0 ms |
| Detalhe | mobile  |          90 |            97 |            100 | 100 | 3,1 s |   0 | 34 ms |
| Detalhe | desktop |         100 |           100 |            100 | 100 | 0,6 s |   0 |  0 ms |

- **Resultado local, com `vite preview` (mediana):**

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO |   LCP | CLS |   TBT |
| ------- | ------- | ----------: | ------------: | -------------: | --: | ----: | --: | ----: |
| Início  | mobile  |          77 |           100 |            100 | 100 | 4,4 s |   0 | 29 ms |
| Início  | desktop |          98 |            97 |            100 | 100 | 1,0 s |   0 |  0 ms |
| Detalhe | mobile  |          77 |            97 |            100 | 100 | 4,4 s |   0 | 24 ms |
| Detalhe | desktop |          98 |           100 |            100 | 100 | 1,0 s |   0 |  0 ms |

- **Ambiente:** Apple M1, macOS (Darwin 24.6), Node 22.23, Chrome headless 156; perfil mobile com a simulação padrão do Lighthouse (4G lento e CPU 4× mais lenta) e desktop com o preset de desktop.
- **Diferença entre o deploy e a medição local:** a Vercel entrega os arquivos com Brotli, por HTTP/2 e a partir do cache da CDN; o `vite preview` usa gzip e HTTP/1.1. Com menos bytes e as requisições em paralelo na mesma conexão, a primeira pintura e o LCP no mobile caem cerca de 1,4 s, e a Performance passa de 77 para 90, dentro da meta.
- **O que ainda pesa no mobile:** CLS é zero e o TBT fica abaixo de 100 ms; o que limita a nota é o tempo até a primeira pintura (~2,7 s no deploy) e o LCP (~3,1 s). As causas identificadas:
  - **JavaScript inicial:** ~300 KB gzip antes da primeira pintura, interpretados com a CPU 4× mais lenta. O maior trecho é o próprio MSW (~175 KB gzip), que precisa carregar e registrar o service worker antes de qualquer requisição, porque a API inteira é simulada no navegador.
  - **Latência do cenário padrão:** cada chamada da API simulada tem 250 ms de atraso, intencional, para que os estados de carregamento sejam visíveis. O LCP depende da lista do catálogo ou do detalhe, então soma esse atraso.
  - **Cadeia em série:** HTML → JavaScript → service worker do MSW → API → imagem. Na simulação de 4G lento, cada etapa custa uma ida e volta.
  - Em produção, com uma API real, o MSW sairia do bundle e da cadeia crítica. A auditoria segue o README e não remove os mocks, as imagens nem as fontes da entrega.
- **Melhorias aplicadas:**
  - **`socket.io-client` sob demanda:** carregado só ao abrir a conexão em tempo real. Isso permite importar o app diretamente, em paralelo com os mocks, sem perder a interceptação do WebSocket.
  - **Imagens prioritárias:** os quatro primeiros cards do catálogo (a área visível sem rolar, no desktop e no mobile) carregam com prioridade. Antes, o LCP do início era um card com `loading="lazy"`.
  - **`robots.txt`:** o servidor devolvia o HTML do app no lugar dele. Com o arquivo, o SEO foi de 92 para 100.
- **Tentativas descartadas:**
  - **Pintar antes dos mocks:** renderizar a interface antes de o MSW ficar pronto, com as requisições esperando no cliente Axios, não melhorou a primeira pintura (o gargalo é o JavaScript inicial), e foi revertido para não complicar o cliente.
  - **MSW junto do bundle principal:** importar o MSW de forma estática também não trouxe ganho além da variação entre medições.

## Limitações conhecidas

- **API e pagamentos simulados:** não há blockchain, extensão de carteira nem gateway reais. Conexão, assinatura e confirmação são simuladas pelo mock, e o "Ver no Etherscan" avisa que a transação não existe na rede.
- **Dados por navegador:** o banco simulado fica no `localStorage` de cada navegador. Os dados não são compartilhados entre aparelhos, e cada aba mantém sua própria cópia em memória (uma mudança feita em uma aba aparece nas outras só depois de recarregar).
- **Transporte do Socket.IO nos mocks:** apenas WebSocket, interceptado na própria página, sem salas nem namespaces (detalhes em "Tempo real").
- **Performance no mobile depende da entrega:** na URL publicada fica em 90 (meta atingida), mas no `vite preview` local, sem Brotli e HTTP/2, cai para 77. O que limita a nota é o JavaScript do MSW e a cadeia de carregamento da API simulada (detalhes em "Performance e Lighthouse").
- **Autenticação exige contexto seguro:** pelo IP da rede local via HTTP, o login dos mocks não funciona (detalhes em "Particularidades de navegadores").
- **Fora do escopo:** páginas editoriais, criadores, aprenda, atividade, ofertas, downloads, suporte, newsletter e login social exibem o aviso de "indisponível", sem simular sucesso.
