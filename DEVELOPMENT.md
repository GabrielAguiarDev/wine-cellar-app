# IL DiVino — Adega Prime · Plano de Desenvolvimento

> Documento de referência para iniciar o desenvolvimento do app **IL DiVino** em Expo (SDK 57).
> Extraído integralmente do protótipo de design em `design/project/IL DiVino.dc.html` (Claude Design handoff).
> O protótipo é HTML/CSS/JS — serve como **fonte da verdade visual**. Reconstruir pixel-perfect em React Native, sem copiar a estrutura interna do protótipo.

---

## 0. Antes de escrever qualquer código (obrigatório)

- **Ler os docs versionados do Expo SDK 57** antes de codar: <https://docs.expo.dev/versions/v57.0.0/> (o `AGENTS.md` do projeto exige isso — a API do Expo mudou).
- Stack confirmada do SDK 57: **React Native 0.86**, **React 19.2.3**, **Node ≥ 22.13**.
- Criar projeto e instalar libs sempre com `npx create-expo-app` / `npx expo install`.

### ⚠️ Decisão de arquitetura sobre "Expo UI" (`@expo/ui`)

O `@expo/ui` renderiza componentes **nativos** (SwiftUI no iOS / Jetpack Compose no Android) que **seguem a aparência da plataforma** e, segundo a própria doc, **não é adequado para UIs de marca fortemente customizadas**. O design do IL DiVino é justamente isso: identidade visual própria (creme + bordô + dourado), tipografia serif (Cormorant Garamond), garrafas desenhadas proceduralmente, cards e botões com estilo autoral. **Não dá para atingir esse visual com componentes nativos puros.**

**Estratégia adotada:**

- **Camada visual de marca** → React Native padrão (`View`/`Text`/`Pressable` + `StyleSheet`), com tokens de tema próprios. É aqui que vive 90% das telas.
- **`@expo/ui` usado de forma cirúrgica**, só onde o primitivo nativo ajuda e não quebra a marca:
  - `DateTimePicker` → data de entrega no gifting (checkout).
  - `BottomSheet` → filtros da busca, seleção de endereço/pagamento (opcional).
  - `Switch`/`Toggle` → "usar pontos", "é presente", "ocultar preço".
  - `ContextMenu`/`SwipeActions` → ações em itens da sacola/favoritos (opcional).
  - Listas de alta performance quando necessário (`List`/`LazyColumn`).
- Se em qualquer ponto o componente nativo comprometer o visual, usar a versão custom em RN.

> Registrar essa decisão para o backend/time e revalidar cada componente `@expo/ui` contra a doc v57 no momento de usar.

---

## 1. Identidade visual (Design System)

### 1.1 Paleta de cores

| Token | Hex | Uso |
|---|---|---|
| `bg` (creme claro) | `#F3ECDD` | Fundo padrão das telas claras |
| `surface` (creme card) | `#FBF7EE` | Cards, inputs, linhas de lista |
| `bgOuter` | `#e7e0d2` | Fundo externo do body |
| `toggleTrack` | `#eadfce` | Trilho dos toggles segmentados (busca/tracking) |
| `mapBg` | `#e4ddcd` | Fundo do mapa de entrega |
| `wine` (bordô principal) | `#431018` | Texto sobre creme, botões primários, ícones |
| `wineDeep` | `#2c0a10` / `#320b12` | Gradientes escuros, fundo de telas dark |
| `wineLight` | `#5a1622` | Topo de gradientes radiais |
| `wineAlt` | `#3a0e18` | Gradiente do quiz |
| `gold` (dourado) | `#B08D57` | Cor de acento, bordas, labels, estrelas |
| `goldDark` | `#8a6c40` | Hover / dourado mais escuro, links |
| `ink` (texto) | `#2A211C` | Texto principal sobre creme |
| `mutedIcon` | `#8a7d70` | Ícone de busca, cinza-marrom |
| `cream` | `#F3ECDD` | Texto sobre fundos escuros |

Opacidades muito usadas: `rgba(42,33,28,.5/.55/.6)` (texto secundário no claro), `rgba(243,236,221,.6/.7)` (texto secundário no escuro), `rgba(176,141,87,.3–.6)` (bordas douradas).

Fundos "dark" (splash, quiz, sommelier, VIP, produto premium):
`radial-gradient(120% 90% at 50% 18%, #5a1622, #431018 45%, #2c0a10 100%)` e variações.

### 1.2 Tipografia

- **Cormorant Garamond** (serif) — títulos, nomes de vinho, preços, citações em itálico. Pesos 400/500/600/700 + itálico. Instalar via `expo-font` (Google Fonts).
- **Jost** (sans-serif) — UI, botões, labels, corpo. Pesos 300/400/500/600.
- **Labels/CTAs**: caixa alta com `letter-spacing` alto (`.16em`–`.46em`), tamanhos pequenos (8–12px).
- **Números/preços/nome de vinho**: Cormorant, tamanhos grandes (19–64px).

### 1.3 Espaçamento e forma

- Padding horizontal padrão das telas: **22px**. Produto/checkout usam 24–30px em alguns blocos.
- Padding vertical topo: **56px** (área do notch); rodapé com tab bar: **~108px**.
- Border-radius: chips/pills `8–9px`, cards `12–16px`, tab bar `20px`, botões `6–11px`.
- Device de referência do protótipo: **402 × 874** (iPhone). Usar `react-native-safe-area-context`.

### 1.4 Componentes reutilizáveis a criar

| Componente | Descrição |
|---|---|
| `BottleGraphic` | **Garrafa desenhada proceduralmente** (Views posicionadas): gargalo, cápsula, corpo com `border-radius`, rótulo creme com iniciais + safra. Props: `cor`, `cap`, `iniciais`, `safra`, tamanho (variações: rail 46×150, lista 34×100, produto 96–110×320–340, sacola 30×92, etc.). Reutilizado em quase todas as telas. |
| `Bottle` (destaque) | Variação premium com sombra interna (`inset shadow`) e cápsula dourada. |
| `WineCard` | Card vertical (rail "Selecionados"): garrafa + nome + tipo·uva + preço + nota, badge "Especial", botão coração. |
| `WineRow` | Linha horizontal (mais vendidos, busca, favoritos, sommelier, VIP): garrafa + infos + preço. Variações clara e escura. |
| `Pill` | Botão-chip de categoria (Todos/Tinto/Branco/Rosé/Espumante), estados ativo/inativo. |
| `Chip` | Chip de filtro com "⌄" (Uva, País, Preço, Corpo, Harmonização). |
| `StarRating` | 5 estrelas (SVG) preenchidas conforme nota; versões: leitura (dourada), leitura sobre escuro, e editável (avaliação). |
| `PrimaryButton` / `OutlineButton` | Botões CTA (fundo bordô ou contorno dourado/bordô, caixa alta espaçada). |
| `SectionTitle` | Título de seção em Cormorant 25px bordô. |
| `Toggle` | Switch custom (trilho + knob) — ou `@expo/ui` Switch. |
| `SegmentedToggle` | Alternador de 2 opções (busca vinho/prato, tracking status/mapa). |
| `Toast` | Notificação flutuante inferior (fundo `#2c0a10`, borda dourada), auto-some em ~2.2s. |
| `TabBar` | Barra inferior flutuante com 5 ícones SVG + badge de contagem na sacola. |
| `ScreenHeader` | Cabeçalho com botão "voltar" (chevron) + título. |
| `Icon` | Ícones em SVG (`react-native-svg`): busca, coração, sacola, home, perfil, seta, play, chevrons, telefone, etc. |

> Todos os ícones do protótipo são **SVG inline** → usar `react-native-svg`. As garrafas são **Views/CSS**, não imagens.

---

## 2. Modelo de dados (mock inicial)

Todo o conteúdo é mockado no protótipo. Estruturar em `data/` + tipos TypeScript. Substituível por API depois (ver Fase 16).

### 2.1 `Wine`
```ts
type WineTipo = 'Tinto' | 'Branco' | 'Rosé' | 'Espumante';
interface Wine {
  id: string;              // ex: 'notte-eterna'
  nome: string;            // 'Notte Eterna'
  safra: number;           // 2019
  tipo: WineTipo;
  uva: string;             // 'Nebbiolo'
  regiao: string;          // 'Piemonte'
  assinatura: string;      // frase descritiva ("...")
  preco: number;           // 489 (BRL, inteiro)
  destaque: boolean;       // true = produto premium (vídeo + reserva)
  notaMedia: number;       // 4.7
  totalAvaliacoes: number; // 128
  estoqueBaixo: boolean;   // true = "restam poucas unidades" + fluxo de reserva
  harmonizacoes: string[]; // ['carnes vermelhas', ...]
  cor: string;             // '#4a121c' cor da garrafa
  iniciais: string;        // 'NE'
  videoDur?: string;       // '0:48' (só destaques)
}
```

**Catálogo (10 vinhos)** — copiar exatamente do protótipo (`this.wines`, linhas 980–991 do HTML):
`Notte Eterna` (destaque), `Perla Nera` (destaque), `Corona Reale` (destaque), `Aurora del Sud`, `Lumière Blanche`, `Rosa dei Venti`, `Sangue di Terra`, `Fiore d'Inverno`, `Velluto Rosso`, `Alba Serena`.

### 2.2 `Review`
Mapa `wineId → Review[]`:
```ts
interface Review { nome: string; nota: number; comentario: string; } // comentario pode ser ''
```
(dados em `this.reviews`, linhas 992–1010).

### 2.3 `QuizQuestion` (3 perguntas)
```ts
interface QuizQuestion {
  key: 'estilo' | 'corpo' | 'momento';
  pergunta: string; desc: string;
  opcoes: { label: string; hint: string; val: string }[];
}
```
Perguntas: seco/suave, encorpado/leve, jantar/solo (linhas 1011–1021).

### 2.4 `Ocasiao` (sommelier — 4 ocasiões)
```ts
interface Ocasiao { key: string; label: string; desc: string; ids: string[]; }
```
Romântico, Presente, Churrasco, Comemoração (linhas 1022–1027).

### 2.5 Estado global (app)
```ts
{
  cart: Record<string, number>;      // { [wineId]: qty }
  favs: Record<string, boolean>;     // favoritos ({'lumiere-blanche':true,'corona-reale':true} iniciais)
  paladar: string;                   // resultado do quiz (default 'encorpado')
  points: number;                    // 320 (fidelidade)
  // efêmeros de UI: searchMode, searchQuery, dishQuery, catFilter, sommelier,
  // tracking('status'|'mapa'), isGift, giftMsg, hidePrice, giftDate, usePoints,
  // pm(pagamento), videoPlaying, draft(estrelas), draftMsg, toast
}
```
Sugestão: **Zustand** (ou Context + reducer) para `cart/favs/paladar/points`; estado local por tela para o resto.

### 2.6 Regras de negócio (formatters & lógica)
- `brl(n)` → `"R$ " + n.toLocaleString('pt-BR')`.
- `nf(n)` → nota com 1 casa e vírgula (`4,7`).
- **Rail "Selecionados para você"**: `tipo==='Tinto' || destaque`, primeiros 5.
- **Rail "Mais vendidos"**: ordenar por `totalAvaliacoes` desc, top 4.
- **VIP / Curadoria reservada / Especiais**: `destaque === true`.
- **Busca por prato**: casa `dishQuery` contra `harmonizacoes`.
- **`buyFromProduct`**: se `destaque && estoqueBaixo` → **reservar** (toast "Reservado por 24h…"), senão adiciona à sacola e vai para a sacola.
- **Fidelidade**: `320` pontos, meta `500` → `progressPct = 64%`; `320 pts = R$ 64` de desconto.
- **Frete**: grátis acima de `R$ 300`, senão `R$ 29`.
- **Checkout total**: `max(0, subtotal - desconto) + frete`.
- Ao `placeOrder`: limpa carrinho, reseta gift/pontos, vai para tracking.

---

## 3. Mapa de telas e navegação

15 telas + tab bar + toast. Fluxo (da tela "Mapa de navegação" do próprio protótipo):

```
Splash → Quiz de paladar → Home
Home ├─ Buscar (vinho / prato / filtros)
     ├─ Sommelier (por ocasião)
     ├─ Favoritos
     └─ Curadoria / Especiais
              ↓
        Tela de Produto ── Padrão (destaque:false)
                        └─ Premium (destaque:true → vídeo + reserva)
                              ↓
                          Avaliações
              ↓
     Sacola → Checkout + Gifting → Pedido feito → Acompanhamento (Status · Mapa ao vivo)
              ↓
        Perfil ├─ Fidelidade
               └─ Acesso VIP
```

**Tab bar (5 itens)**: Início, Buscar, Favoritos, Sacola (com badge de qtd), Perfil.
Mapeamento tab por tela: `home→home`, `search/sommelier→search`, `favorites→fav`, `bag/checkout→bag`, `profile/loyalty/vip/tracking→profile`.
**Tab bar visível em**: home, search, sommelier, favorites, bag, profile, loyalty, vip. **Oculta em**: splash, quiz, product, reviews, checkout, tracking, navmap.

**Estrutura sugerida com Expo Router (file-based):**
```
app/
  _layout.tsx            # Stack raiz + providers (fonts, safe area, store)
  index.tsx              # Splash
  quiz.tsx               # Quiz (fora das tabs)
  (tabs)/
    _layout.tsx          # Tab bar custom
    home.tsx
    search.tsx
    favorites.tsx
    bag.tsx
    profile.tsx
  sommelier.tsx
  product/[id].tsx       # decide layout padrão vs premium por wine.destaque
  reviews/[id].tsx
  checkout.tsx
  tracking.tsx
  loyalty.tsx
  vip.tsx
```
> A tab bar do design é **flutuante e custom** (não a padrão do Expo Router). Renderizar via `tabBar` custom no `(tabs)/_layout.tsx`. A navegação "voltar" do protótipo usa uma pilha própria (`prev[]`) → no RN usar a stack nativa do router.

---

## 4. Fases de desenvolvimento

Cada fase tem **objetivo**, **entregáveis** e **critério de conclusão (DoD)**. Ao final de cada fase, atualizar um `DEVELOPMENT.md` vivo (resumo do que existe, decisões, próximos passos) para retomar sem reler tudo.

---

### Fase 0 — Fundação do projeto
**Objetivo:** projeto Expo rodando, com fontes, tema e navegação vazia.
- `npx create-expo-app` (SDK 57) + TypeScript.
- Instalar (`npx expo install`): `expo-router`, `expo-font`, `react-native-svg`, `react-native-safe-area-context`, `react-native-reanimated`, `react-native-gesture-handler`, e `@expo/ui`.
- Carregar fontes **Cormorant Garamond** + **Jost** (`expo-font`), splash screen segurando até fontes prontas.
- Criar `theme/` com tokens (§1.1–1.3): cores, tipos de texto, espaçamentos, radii.
- Configurar `app.json` (nome "IL DiVino", ícone/splash com o bordô), safe area provider.

**DoD:** app abre com fontes carregadas e uma tela em branco usando os tokens.

---

### Fase 1 — Design System & primitivos
**Objetivo:** biblioteca de componentes de marca (§1.4) isolada em `components/`.
- `Text` tipado por variante (heading serif, label caixa-alta, body Jost…).
- `BottleGraphic` (+ variação premium) com prop de tamanho.
- `WineCard`, `WineRow` (clara/escura), `Pill`, `Chip`, `StarRating` (leitura/editável), `PrimaryButton`/`OutlineButton`, `SectionTitle`, `ScreenHeader`, `Toast`, `SegmentedToggle`, `Toggle`.
- Ícones SVG num `Icon` central.
- (Opcional) tela de "storybook" interna para revisar os primitivos.

**DoD:** todos os componentes renderizam corretamente com dados de exemplo, em tema claro e escuro.

---

### Fase 2 — Dados & estado
**Objetivo:** catálogo e store prontos.
- `data/wines.ts`, `data/reviews.ts`, `data/quiz.ts`, `data/ocasioes.ts` (copiar valores exatos do protótipo).
- Tipos TS (§2).
- Formatters `brl`, `nf` e seletores derivados (railSelecionados, railMaisVendidos, vipWines, dishSearch, etc.).
- Store (Zustand): `cart`, `favs`, `paladar`, `points` + ações (`addToCart`, `setQty`, `removeFromCart`, `toggleFav`, `answerQuiz`, `placeOrder`) e toast global.

**DoD:** funções de seleção e regras (§2.6) cobertas por testes simples; store manipulável.

---

### Fase 3 — Navegação & shell
**Objetivo:** esqueleto navegável.
- Estrutura de rotas (§3) com Expo Router.
- Tab bar flutuante custom com estados ativos e badge da sacola.
- Regra de visibilidade da tab bar por rota.
- `ScreenHeader`/voltar padronizados.

**DoD:** navegar entre todas as telas (mesmo vazias) e a tab bar acende/some conforme especificado.

---

### Fase 4 — Onboarding (Splash + Quiz)
**Objetivo:** entrada do app.
- **Splash** (dark radial): logo "IL / DiVino / Adega Prime", citação em itálico, botões "Entrar" (→ quiz) e "Ver mapa de navegação". Animação `fade`.
- **Quiz de paladar** (3 perguntas): progresso "x / 3", opções (label+hint), dots animados, botão "Pular". Ao fim, grava `paladar` e vai para Home.

**DoD:** fluxo splash→quiz→home funcionando, com "Pular" e "Refazer" (a partir do perfil).

---

### Fase 5 — Home
**Objetivo:** vitrine principal.
- Header (menu, logo central, coração→favoritos).
- Barra de busca (fake, → tela de busca).
- Banner "Curadoria da semana" (→ Especiais).
- Pills de categoria (→ busca com filtro).
- Rail "Selecionados para você" (`WineCard` horizontais).
- Card "Coleção reservada" (→ Especiais).
- Rail "Mais vendidos" (`WineRow`).
- Rodapé "— curadoria IL DiVino —".

**DoD:** rails populados pelas regras corretas; toques navegam certo; favoritar no card funciona.

---

### Fase 6 — Busca / Coleção
**Objetivo:** descoberta.
- Título dinâmico (categoria / "Especiais" / "Coleção").
- `SegmentedToggle` **Buscar vinho / Buscar por prato**.
- Modo vinho: input de busca + chips de filtro (Uva/País/Preço/Corpo/Harmonização) + lista de resultados (`WineRow`), filtrando por categoria e texto (nome/uva/região/tipo).
- Modo prato: input + exemplos rápidos (salmão, risoto, churrasco, queijos) + resultados por harmonização.
- Link "Sommelier virtual".

**DoD:** filtros e busca textual/prato retornam resultados corretos; chips presentes (podem abrir `BottomSheet` na fase de polish).

---

### Fase 7 — Produto (Padrão + Premium)
**Objetivo:** página de detalhe, dois layouts por `destaque`.
- **Premium** (dark): nome grande sobre garrafa, safra, categoria, estrelas (→ avaliações), assinatura em itálico, **"Palavra do sommelier"** (vídeo com play/pausa — placeholder animado), harmonizações, aviso de **estoque baixo** (blip animado), rodapé fixo com preço + CTA (**"Reservar por 24h"** se reserva, senão "Adquirir").
- **Padrão** (creme): garrafa central grande, safra/nome/uva·região/categoria, estrelas, assinatura, preço, "Adquirir", bloco "Harmoniza com".
- Lógica `buyFromProduct` (reserva vs sacola) + toasts.

**DoD:** ambos layouts corretos; reserva e compra disparam toast/nav corretos; vídeo alterna play/pausa.

---

### Fase 8 — Avaliações
**Objetivo:** ver e enviar avaliações.
- Média destaque (nota grande + estrelas + total).
- Form "Deixe sua avaliação": estrelas editáveis + textarea + enviar (toast + volta).
- Lista de avaliações (nome, estrelas em glifos, comentário opcional em itálico).

**DoD:** enviar avaliação mostra toast e retorna; comentário vazio não quebra layout.

---

### Fase 9 — Sommelier virtual
**Objetivo:** recomendação por ocasião.
- Header voltar; título "Qual é a ocasião?".
- Grade 2×2 de ocasiões (selecionável).
- Ao escolher, lista de vinhos daquela ocasião (`WineRow` escura) → abre produto.

**DoD:** seleção de ocasião mostra os vinhos corretos (por `ids`).

---

### Fase 10 — Favoritos
**Objetivo:** garrafeira salva.
- Título + subtítulo.
- Estado vazio ("Nenhum vinho salvo ainda.").
- Lista de favoritos (`WineRow`) com botão coração (remover) e "+" (adicionar à sacola + toast).

**DoD:** favoritar/desfavoritar reflete aqui e nos cards; "+" adiciona à sacola.

---

### Fase 11 — Sacola
**Objetivo:** carrinho.
- Estado vazio (ícone + "Explorar vinhos").
- Itens com garrafa, nome, tipo·uva, stepper de quantidade (− / qty / +), subtotal.
- Rail "Combina com sua compra" (sugestões).
- Resumo (subtotal + qtd) + "Finalizar compra" (→ checkout).

**DoD:** somas e stepper corretos; badge da tab atualiza; remover ao chegar em 0.

---

### Fase 12 — Checkout + Gifting
**Objetivo:** finalização.
- Bloco de endereço (mock "Helena Prado · Casa").
- Pagamento: Pix / Cartão / Boleto (seleção).
- Toggle "Usar 320 pontos de fidelidade" (desconto R$ 64).
- **Gifting**: toggle "Isso é um presente?" → mensagem do cartão, "Ocultar preço na nota", **data de entrega** (`@expo/ui` `DateTimePicker`). Animação de expansão.
- Resumo (subtotal, desconto pontos, frete, total) + "Confirmar pedido" (→ tracking, limpa carrinho).

**DoD:** descontos/frete/total conforme regras; gifting expande e persiste; pedido zera a sacola.

---

### Fase 13 — Acompanhamento de pedido
**Objetivo:** pós-compra.
- Cabeçalho "Seu pedido a caminho" + "#ILD-4821 · Chega em ~25 min".
- `SegmentedToggle` **Status / Mapa**.
- **Status**: timeline de 4 etapas (Confirmado, Preparando, Saiu para entrega [atual], Entregue) com dots/linhas coloridos.
- **Mapa**: mapa estilizado (grid + rota tracejada SVG + pino destino + entregador com blip animado) + card do entregador (Bruno) com botão de ligação.

**DoD:** as duas abas renderizam; timeline destaca a etapa atual; animações do mapa rodando.

---

### Fase 14 — Perfil, Fidelidade e VIP
**Objetivo:** conta e programa.
- **Perfil**: card VIP (avatar HP, "Membro Prime", 320 pts, barra de progresso, "Ver programa"), acesso antecipado (→ VIP), "Seu paladar" (tags + "Refazer"→quiz), "Pedidos recentes" (→ tracking), links (Dados pessoais, Endereços, Pagamento, Notificações), link "Mapa de navegação".
- **Fidelidade**: hero de pontos (320, barra Prime→VIP), "Como ganhar pontos", "Resgatar" (recompensas com estado ok/insuficiente + toast), "Histórico".
- **VIP**: lista de lançamentos antecipados (vinhos `destaque`, badge "Pré-lançamento").

**DoD:** navegação entre os três; resgates disparam toast correto; "Refazer" reabre o quiz.

---

### Fase 15 — Polimento, animações e acessibilidade
**Objetivo:** acabamento de produto.
- Animações: `fade`/`rise` de entrada de tela, `pulse` (vídeo), `blip` (estoque/entregador), toggles suaves. Usar `react-native-reanimated`.
- Toast global (auto-dismiss ~2.2s).
- Scroll reseta ao topo em troca de tela (comportamento do protótipo).
- Acessibilidade: `accessibilityLabel` nos ícones/botões (já há `aria-label` no protótipo), tamanho de toque ≥44px, contraste.
- Ajuste fino de safe area (notch/home indicator) e teclado (inputs).
- (Opcional) avaliar `@expo/ui` `BottomSheet` para filtros e seleção de endereço/pagamento.

**DoD:** app fluido em iOS e Android, sem quebras de layout; revisão visual contra os `shots/` do design.

---

### Fase 16 — Integração com backend (opcional / futuro)
**Objetivo:** trocar mocks por API real.
- Alinhar contratos com o backend (usar o fluxo/skill `sync-backend` do projeto).
- Catálogo, avaliações (GET/POST), carrinho/pedido, fidelidade, autenticação, rastreio real de entrega.
- Camada de dados (React Query/TanStack) mantendo os mesmos seletores da Fase 2.

**DoD:** telas consumindo API sem mudança visual; mocks removíveis por feature flag.

---

## 5. Referências no repositório

- **Design fonte da verdade:** `design/project/IL DiVino.dc.html` (markup + estilos por tela nas linhas 32–962; lógica/dados nas linhas 967–1269).
- **Screenshots:** `design/project/shots/` (`splash`, `premium`, `01/02/03-premium`, scrolls) — para conferência visual.
- **Infra do protótipo (ignorar p/ produção):** `support.js` (runtime do Claude Design) e `ios-frame.jsx` (moldura do device).
- **Regras do projeto:** `AGENTS.md` (ler docs Expo v57 antes de codar).

## 6. Checklist rápido de telas (15)

- [ ] Splash · [ ] Quiz · [ ] Home · [ ] Busca/Coleção · [ ] Sommelier ·
- [ ] Produto Padrão · [ ] Produto Premium · [ ] Avaliações · [ ] Sacola ·
- [ ] Checkout+Gifting · [ ] Acompanhamento (Status/Mapa) · [ ] Favoritos ·
- [ ] Perfil · [ ] Fidelidade · [ ] VIP · ([ ] Mapa de navegação — só dev)
