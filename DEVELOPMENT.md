# IL DiVino — Adega Prime · Contexto de Desenvolvimento

> Arquivo mantido pelo agente **mobile-senior-dev**. Leia isto antes de continuar o desenvolvimento.
> **Última atualização: Fase 2 concluída — 2026-07-23**
> Fonte de design em uso: pasta **`design/`** → `design/project/IL DiVino.dc.html` (export Claude Design). É a fonte da verdade visual; reconstruir pixel-perfect, sem copiar a estrutura interna do protótipo.

---

## 1. Visão geral

App mobile de **adega premium (e-commerce de vinhos)** — catálogo curado, quiz de paladar, sommelier virtual por ocasião, busca por vinho/prato, sacola, checkout com gifting, acompanhamento de pedido, favoritos, perfil, fidelidade e acesso VIP. Estética de marca: **luxo sóbrio** (creme + bordô + dourado, tipografia serif). Público: consumidores de vinho de ticket alto. 15 telas + tab bar.

## 2. Stack & decisões

- **Expo SDK 57** (managed) + **Expo Router** (file-based) + **TypeScript strict**. React Native 0.86 / React 19.2.3 / Node ≥22.13.
- **Estilização: `@shopify/restyle`** (tema tipado). Decisão do usuário. Substitui o `StyleSheet` do plano original.
- **Estado: `zustand` agora** (carrinho/favoritos/quiz/pontos são mock) → **migrar para `@tanstack/react-query` + Context na Fase 16** (backend real). Decisão do usuário.
- **`@expo/ui` NÃO é usado para a UI de marca** (componentes nativos seguem a aparência da plataforma e não reproduzem o visual creme/bordô/dourado). Reservado só para primitivos pontuais quando fizer sentido (ex.: date picker do gifting). Preferir componentes custom em RN + restyle.
- **Tema de marca fixo** (NÃO dirigido pelo modo claro/escuro do SO): o design define fundo claro vs. escuro **por tela** (ex.: splash/quiz/produto premium são dark; home/busca são creme), não por preferência do sistema. Por isso há um único `theme` com tokens claros e escuros disponíveis simultaneamente.
- **Splash animada = Lottie** (`assets/lottie/wine.json`, ~5,4s/60fps, vetor puro). Fluxo: splash nativo **só cor sólida bordô** (sem logo) → ao carregar o JS, overlay `AnimatedSplash` (mesma cor, sem flash) toca o Lottie 1x em tela cheia (**sem texto/logo**) via `lottie-react-native` → **fade out** (reanimated) revela o app. Decisão do usuário: o Lottie **é** a splash (não há tela de marca "Entrar"; o fluxo do design que tinha Splash→Quiz vira **AnimatedSplash→Quiz**). `speed` ~1.8x (~3s) — ajustável em `AnimatedSplash.tsx`.
- Gradientes via **`expo-linear-gradient`**; ícones e garrafas via **`react-native-svg`** (garrafas serão desenhadas com Views/SVG, não imagens). Animações: **`react-native-reanimated` 4** (plugin `react-native-worklets/plugin` no babel). Gestos: **`react-native-gesture-handler`**. Fontes: **`@expo-google-fonts/cormorant-garamond` + `@expo-google-fonts/jost`** via `expo-font`. Env validado com **`zod`**.
- **Desvio consciente da persona**: a arquitetura padrão dela é *RN bare + react-navigation + yarn*; aqui o usuário pediu explicitamente **Expo + Expo Router** (npm). Mantidos: TS strict, restyle, aliases `@`, domínio Api/Adapter/Service/useCases (Fase 16), pt-BR, barrels.

## 3. Estrutura & convenções específicas deste projeto

- **Rotas em `app/`** (raiz — padrão Expo Router). **Todo o resto em `src/`.**
```
app/                      # rotas expo-router
  _layout.tsx             # splash hold + providers + Stack (headerShown:false)
  index.tsx               # placeholder Fase 0 (vira Splash na Fase 4)
src/
  components/             # design system + AppProviders  (Box, Text, ...)
  theme/                  # palette.ts (bruta+alpha) · theme.ts (restyle) · index.ts
  config/                 # env.ts + env.schema.ts (zod)
  hooks/                  # useAppTheme, useAppFonts
  data/ domain/ services/ store/ utils/   # (vazios — próximas fases)
assets/                   # fonts/images/lottie (mantidos na raiz)
```
- **Path aliases** (tsconfig, resolvidos pelo Metro do Expo): `@/*`→`src/*`, `@components`, `@theme`, `@config`, `@data`, `@domain`, `@services`, `@store`, `@hooks`, `@utils`, `@assets`. Sem `baseUrl` (deprecado no TS 6).
- **restyle**: usar `Box`/`TouchableOpacityBox`/`PressableBox` e `Text` (variantes). Props de tema (`padding="s22"`, `backgroundColor="surface"`). `spacing` = `sNN` em px; `borderRadii` = `rNN`; cores **sempre semânticas** (nunca hex direto — a paleta bruta e os rgba estão mapeados em `theme.colors`).
- **Fontes** (chaves registradas): serif `CormorantGaramond_{400,500,600,700}[_Italic]`; sans `Jost_{300,400,500,600}`. Aliases em `theme/theme.ts → fonts`.
- **Testes**: `jest` puro (config em `jest.config.js`, `babel-jest` + aliases; **sem** preset jest-expo pois testamos lógica pura). Co-localizados em `__tests__/`, importam globals de `@jest/globals`. Rodar: `npm test`. Typecheck: `npm run typecheck`.
- Componentes: **functional + named export** (`export function Nome`), sem default (exceto telas expo-router, que exigem default export). Prettier: aspas simples, `trailingComma:all`, `arrowParens:avoid`, `bracketSameLine:true`. ESLint flat (`eslint-config-expo`) + `import/order`. **Strings de UI em pt-BR.**

## 4. Mapa de progresso (fases)

- [x] **Fase 0 — Fundação** — Expo+Router reestruturado p/ `src/`, deps, aliases, env(zod), **tema restyle** (palette+semantic+textVariants+spacing+radii), fontes carregando com splash hold, providers, primitivos `Box`/`Text`, tela placeholder. **Typecheck limpo + `expo export` iOS OK.**
- [x] **Fase 1 — Design System & primitivos** — `Icon`(12 ícones SVG), `StarRating`, `BottleGraphic`(+premium/full), `Button`(primary/outline/outlineGold), `Pill`, `Chip`, `SectionTitle`, `WineCard`, `WineRow`(claro/escuro), `SegmentedToggle`, `Toggle`, `Toast`, `ScreenHeader`, `Screen`(+gradiente/scroll/footer). Catálogo temporário em `app/index.tsx`. **Typecheck+lint+export OK.**
- [x] **Fase 2 — Dados & estado** — data/ (10 vinhos, reviews, quiz, ocasiões), tipos, formatters (`brl`/`nf`), regras de preço, seletores (rails/busca/carrinho), view-model mappers, stores zustand (cart/favorites/user/toast). **27 testes (jest) + typecheck + lint OK.**
- [ ] **Fase 3 — Navegação & shell** — PRÓXIMA. tab bar flutuante custom, rotas, visibilidade por tela
- [ ] Fase 4 — Onboarding (Quiz) — splash animada Lottie já pronta na fundação; falta o Quiz + navegação AnimatedSplash→Quiz→Home
- [ ] Fase 5 — Home
- [ ] Fase 6 — Busca/Coleção (vinho/prato/filtros)
- [ ] Fase 7 — Produto (Padrão + Premium)
- [ ] Fase 8 — Avaliações
- [ ] Fase 9 — Sommelier
- [ ] Fase 10 — Favoritos
- [ ] Fase 11 — Sacola
- [ ] Fase 12 — Checkout + Gifting
- [ ] Fase 13 — Acompanhamento de pedido (Status/Mapa)
- [ ] Fase 14 — Perfil + Fidelidade + VIP
- [ ] Fase 15 — Polimento (animações, a11y, safe area)
- [ ] Fase 16 — Integração backend (react-query; substitui mocks)

## 5. Domínios & features implementados

Nenhum domínio/feature de negócio ainda. Base técnica + design system prontos:
- `src/theme/*` — tema restyle completo e tipado.
- **`src/components/` (design system, todos apresentacionais e via barrel `@components/index`):**
  - Primitivos: `Box`/`TouchableOpacityBox`/`PressableBox`, `Text`.
  - Infra: `AppProviders`, `AnimatedSplash` (Lottie + fade), `Screen` (safe area + fundo sólido/gradiente + scroll + footer).
  - Marca: `Icon` (registry: search/heart/bag/home/profile/chevronLeft·Right/arrowRight/play/star/phone/check/plus), `StarRating` (leitura/editável), `BottleGraphic` (garrafa procedural; props `width/cor/capColor/showCap/premium/labelMode('initials'|'full')/iniciais/safra`), `Button` (primary/outline/outlineGold), `Pill`, `Chip`, `SectionTitle`, `WineCard` (+`WineCardData`), `WineRow` (light/dark, +`WineRowData`, `badge`/`subtitle`/`rightSlot`), `SegmentedToggle` (genérico), `Toggle`, `Toast`, `ScreenHeader` (light/dark).
- `src/hooks/{useAppTheme,useAppFonts}.ts`.
- `src/config/env*.ts` — env validado (API_URL opcional até a Fase 16).
- **`src/data/`** (barrel `@data`): `types.ts` (Wine/Review/QuizQuestion/Ocasiao), `wines.ts` (WINES, 10), `reviews.ts` (REVIEWS), `quiz.ts` (QUIZ, 3), `ocasioes.ts` (OCASIOES, 4), `selectors.ts` (`findWine`, `railSelecionados`, `railMaisVendidos`, `especiais`, `winesByIds`, `searchWines`, `searchByDish`, `cartCount`, `cartSubtotal`, `CAT_ESPECIAIS`).
- **`src/utils/`** (barrel `@utils`): `format.ts` (`brl`/`nf`), `pricing.ts` (`pointsDiscount`/`frete`/`checkoutTotal` + constantes), `wineViewModel.ts` (`toWineCardData`/`toWineRowData`/`tipoUva`/`categoriaCompleta`/`capColorFor`).
- **`src/store/`** (barrel `@store`, zustand): `useCartStore` (items + addToCart/setQty/removeFromCart/clear), `useFavoritesStore` (favs + toggleFav/isFav; inicia com lumiere-blanche+corona-reale), `useUserStore` (paladar/points/setPaladar), `useToastStore` (message + show(auto-dismiss ~2,2s)/hide).
- `src/**/__tests__/` — 27 testes de lógica pura (format, pricing, selectors).
- `app/_layout.tsx` (providers+splash) + `app/index.tsx` (**catálogo temporário do DS** — some na Fase 3/4).

## 6. Pendências & próximos passos

1. **Iniciar a Fase 3 (Navegação & shell).** Criar a estrutura de rotas (ver "Mapa de telas" abaixo): `app/quiz`, `app/(tabs)/{home,search,favorites,bag,profile}`, `app/sommelier`, `app/product/[id]`, `app/reviews/[id]`, `app/checkout`, `app/tracking`, `app/loyalty`, `app/vip`. Telas podem ficar como stubs navegáveis.
2. **Tab bar flutuante custom** no `app/(tabs)/_layout.tsx` (não a padrão): 5 ícones (`Icon`), estado ativo em bordô, badge de contagem na Sacola via `useCartStore`+`cartCount`. Regra de visibilidade por rota (ver Notas).
3. Ligar o `Toast` global (via `useToastStore`) num ponto único (provavelmente no `_layout` ou num overlay), consumido pelas telas.
4. Só depois (Fase 4+) preencher as telas com dados reais via seletores + `toWineCardData`/`toWineRowData`.
5. Pendência menor de UI: revisar o catálogo rodando o app (`npx expo start`) para calibrar `letterSpacing`/proporções das garrafas.

## 7. Notas / armadilhas

- **Só variáveis `EXPO_PUBLIC_*`** chegam ao bundle. `env.API_URL` é opcional agora (falha cedo se inválida).
- **Reanimated 4**: o plugin correto no `babel.config.js` é `react-native-worklets/plugin` (deve ser o último).
- **letterSpacing**: o design usa `em`; no RN é **px**. Já convertido nos `textVariants` (aproximação por variante); ajustar caso destoe.
- **Garrafas**: são formas desenhadas (não imagens). Props previstas: `cor`, `cap`(dourado se premium), `iniciais`, `safra`, e um `size` com presets (rail 46×150, lista 34×100, produto 96–110×320–340, sacola 30×92).
- **Navegação "voltar"**: o protótipo usa pilha própria (`prev[]`); no app usar a stack nativa do Expo Router.
- **Tab bar**: é flutuante e custom (não a padrão) — implementar via `tabBar` custom na Fase 3. Visível em home/search/sommelier/favorites/bag/profile/loyalty/vip; oculta nas demais.
- TS 6 + Expo: `tsc --noEmit` é o typecheck; Metro resolve os aliases do tsconfig automaticamente.

---

# Referência de Design (fonte da verdade — não apagar)

## Paleta (→ `src/theme/palette.ts` e cores semânticas em `theme.ts`)

| Semântico (theme) | Hex | Uso |
|---|---|---|
| `background` | `#F3ECDD` | Fundo telas claras |
| `surface` | `#FBF7EE` | Cards, inputs, linhas |
| `backgroundOuter` | `#E7E0D2` | Fundo externo |
| `toggleTrack` | `#EADFCE` | Trilho de toggles |
| `mapBackground` | `#E4DDCD` | Fundo do mapa |
| `primary` | `#431018` | Bordô principal (texto/botões/ícones no claro) |
| `primaryLight` | `#5A1622` | Topo de gradientes radiais |
| `primaryAlt` | `#3A0E18` | Gradiente do quiz |
| `primaryDeep` | `#2C0A10` | Fundo dark profundo |
| `primaryDeeper` | `#320B12` | Variação mais escura |
| `accent` | `#B08D57` | Dourado (acento, bordas, labels, estrelas) |
| `accentDark` | `#8A6C40` | Dourado escuro / links |
| `textPrimary` | `#2A211C` | Texto sobre creme |
| `textOnDark` | `#F3ECDD` | Texto sobre fundo escuro |
| `mutedIcon` | `#8A7D70` | Ícone de busca |

Transparências recorrentes mapeadas em `alpha` (ex.: `inkA50/55/60`, `cremeA*`, `goldA*`, `wineA*`). Fundos dark = `radial-gradient(120% 90% at 50% 18%, #5A1622, #431018 45%, #2C0A10 100%)` e variações (usar `expo-linear-gradient`).

## Tipografia
- **Cormorant Garamond** (serif): títulos, nomes de vinho, preços, citações itálicas. Variantes: `brand`(58), `h1`(44), `h2`(34), `sectionTitle`(25), `wineName`(20), `wineNameSm`(16), `price`, `quote`(italic).
- **Jost** (sans): UI/labels/corpo. Variantes: `body`(14), `bodySm`(12), `label`(11 caps), `eyebrow`(9 caps dourado), `button`(12 caps).

## Espaçamento & forma
- Padding horizontal padrão **22** (`s22`); topo **56** (`s56`, notch); rodapé tab **~108** (`s108`). Radii: chips/pills `r8/r9`, cards `r12–r16`, tab bar `r20`, botões `r6–r11`. Device ref: **402×874**.

## Modelo de dados (Fase 2 — copiar valores exatos do HTML)

`Wine` = `{ id, nome, safra, tipo:'Tinto'|'Branco'|'Rosé'|'Espumante', uva, regiao, assinatura, preco:number, destaque:boolean, notaMedia, totalAvaliacoes, estoqueBaixo:boolean, harmonizacoes:string[], cor:hex, iniciais, videoDur? }`.
**10 vinhos** (`this.wines`, linhas 980–991): Notte Eterna*, Perla Nera*, Corona Reale*, Aurora del Sud, Lumière Blanche, Rosa dei Venti, Sangue di Terra, Fiore d'Inverno, Velluto Rosso, Alba Serena. (* = `destaque`.)
`Review` = `{ nome, nota, comentario }` mapeado por wineId (linhas 992–1010).
`QuizQuestion` (3): estilo(seco/suave), corpo(encorpado/leve), momento(jantar/solo) (linhas 1011–1021).
`Ocasiao` (sommelier, 4): romântico, presente, churrasco, comemoração → `ids[]` (linhas 1022–1027).
Estado global (zustand): `cart:{[id]:qty}`, `favs:{[id]:true}` (inicia com lumiere-blanche + corona-reale), `paladar` (default 'encorpado'), `points:320`.

### Regras de negócio
- `brl(n)`→`"R$ "+n.toLocaleString('pt-BR')`; `nf(n)`→1 casa com vírgula.
- Rail "Selecionados": `tipo==='Tinto' || destaque`, 5 primeiros. Rail "Mais vendidos": sort `totalAvaliacoes` desc, top 4. Especiais/VIP/Curadoria: `destaque===true`.
- Busca por prato: casa `dishQuery` com `harmonizacoes`.
- `buyFromProduct`: se `destaque && estoqueBaixo` → **reservar** (toast 24h); senão add à sacola + vai p/ sacola.
- Fidelidade: 320 pts, meta 500 → 64%; 320 pts = R$ 64 desconto. Frete: grátis > R$ 300, senão R$ 29. Total = `max(0, subtotal − desconto) + frete`. `placeOrder` limpa carrinho/gift/pontos → tracking.

## Mapa de telas & navegação
```
Splash → Quiz → Home
Home ├─ Buscar (vinho/prato/filtros) ├─ Sommelier ├─ Favoritos └─ Curadoria/Especiais
        → Produto (Padrão destaque:false / Premium destaque:true → vídeo+reserva) → Avaliações
Sacola → Checkout+Gifting → Pedido feito → Acompanhamento (Status·Mapa)
Perfil ├─ Fidelidade └─ Acesso VIP
```
Tab bar (5): Início · Buscar · Favoritos · Sacola(badge) · Perfil.
Estrutura de rotas planejada (Fase 3): `app/index`(splash), `app/quiz`, `app/(tabs)/{home,search,favorites,bag,profile}`, `app/sommelier`, `app/product/[id]`, `app/reviews/[id]`, `app/checkout`, `app/tracking`, `app/loyalty`, `app/vip`.

## Referências no repositório
- Design: `design/project/IL DiVino.dc.html` (estilos por tela 32–962; lógica/dados 967–1269). Screenshots: `design/project/shots/`.
- Infra do protótipo (ignorar p/ produção): `support.js`, `ios-frame.jsx`.
- Regras do projeto: `AGENTS.md` (ler docs Expo v57 antes de codar).

## Checklist de telas (15)
- [ ] Splash · [ ] Quiz · [ ] Home · [ ] Busca · [ ] Sommelier · [ ] Produto Padrão · [ ] Produto Premium · [ ] Avaliações · [ ] Sacola · [ ] Checkout+Gifting · [ ] Acompanhamento · [ ] Favoritos · [ ] Perfil · [ ] Fidelidade · [ ] VIP
