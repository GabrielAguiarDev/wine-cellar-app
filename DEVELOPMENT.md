# IL DiVino — Adega Prime · Contexto de Desenvolvimento

> Arquivo mantido pelo agente **mobile-senior-dev**. Leia isto antes de continuar o desenvolvimento.
> **Última atualização: Refinamento nativo (Fases A–F) concluído — 2026-07-24**
> Fonte de design em uso: pasta **`design/`** → `design/project/IL DiVino.dc.html` (export Claude Design). É a fonte da verdade visual; reconstruir pixel-perfect, sem copiar a estrutura interna do protótipo.

---

## 1. Visão geral

App mobile de **adega premium (e-commerce de vinhos)** — catálogo curado, quiz de paladar, sommelier virtual por ocasião, busca por vinho/prato, sacola, checkout com gifting, acompanhamento de pedido, favoritos, perfil, fidelidade e acesso VIP. Estética de marca: **luxo sóbrio** (creme + bordô + dourado, tipografia serif). Público: consumidores de vinho de ticket alto. 15 telas + tab bar.

## 2. Stack & decisões

- **Expo SDK 57** (managed) + **Expo Router** (file-based) + **TypeScript strict**. React Native 0.86 / React 19.2.3 / Node ≥22.13.
- **Estilização: `@shopify/restyle`** (tema tipado). Decisão do usuário. Substitui o `StyleSheet` do plano original.
- **Estado: `zustand` agora** (carrinho/favoritos/quiz/pontos são mock) → **migrar para `@tanstack/react-query` + Context na Fase 16** (backend real). Decisão do usuário. **`useUserStore` é persistido** via `zustand/middleware persist` + `@react-native-async-storage/async-storage` (flag `onboarded` → quiz só no 1º acesso; `paladar`/`points`).
- **`@expo/ui` usado de forma PONTUAL** (decisão do usuário: "pontual"). Adotados os drop-ins cross-platform `@expo/ui/community/*` onde o controle nativo é superior e neutro à marca: **`SegmentedControl`** (pagamento no checkout; toggle vinho/prato na busca) e **`DateTimePicker`** (data do presente). A UI de marca (cards, botões, headers custom, `Toggle`) permanece em RN + restyle — o `Switch` nativo não expõe cor e viraria verde de sistema, então o `Toggle` bordô foi mantido.
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
- [x] **Fase 3 — Navegação & shell** — Stack único (sem Tabs) + **TabBar flutuante custom como overlay** (visibilidade + aba ativa por rota + badge da sacola), Toast global (`ToastHost`+store), 15 rotas como stubs navegáveis (`DevStub`), catálogo do DS movido p/ `/catalog`, `index`→redirect `/quiz`. **typecheck+lint+export OK.**
- [x] **Fase 4 — Onboarding (Quiz)** — `app/quiz.tsx` real: 3 perguntas (`QUIZ`), progresso "x / N", opções label+hint, dots, "Pular"; grava `paladar` (do `corpo`) no `useUserStore` e `router.replace('/home')`. typecheck+lint+export OK.
- [x] **Fase 5 — Home** — `app/home.tsx` real: header (logo + coração→favoritos), busca fake→/search, banner "Curadoria da semana", pills de categoria→/search, rail "Selecionados" (`WineCard`+`railSelecionados`, favoritar), card "Coleção reservada"→especiais, rail "Mais vendidos" (`WineRow`+`railMaisVendidos`), rodapé. Navega p/ `/product/[id]`. typecheck+lint+export OK.
- [x] **Fase 6 — Busca/Coleção** — `app/search.tsx` real: título dinâmico, `SegmentedToggle` vinho/prato, lê param `cat` da Home, `searchWines`/`searchByDish`, input (TextInput), chips de filtro (visuais), resultados `WineRow`, exemplos de prato, link Sommelier. typecheck+lint+export OK.
- [x] **Fase 7 — Produto (Padrão + Premium)** — `app/product/[id].tsx` real: escolhe layout por `destaque`. Premium (dark, nome+garrafa premium, rating→reviews, assinatura, vídeo play/pausa `useState`, harmoniza, estoque baixo, rodapé fixo Reservar/Adquirir) e Padrão (creme, garrafa central, infos, adquirir, harmoniza). `buyFromProduct` (reserva vs sacola+toast+ir p/ bag), favoritar. typecheck+lint+export OK.
- [x] **Fase 8 — Avaliações** — `app/reviews/[id].tsx` real: header com nome, média destaque (nota 64 + `StarRating` + total), form (estrelas editáveis + `TextInput` comentário + enviar→toast+back), lista `REVIEWS` (nome + glifos ★ + comentário itálico opcional). typecheck+lint+export OK.
- [x] **Fase 9 — Sommelier** — `app/sommelier.tsx` real (dark): "Qual é a ocasião?", grade 2×2 (`OCASIOES`) selecionável, lista de vinhos da ocasião (`winesByIds` + `WineRow` dark)→produto. typecheck+lint+export OK.
- [x] **Fase 10 — Favoritos** — `app/favorites.tsx` real: lista `WINES.filter(favs)` em `WineRow` com `rightSlot` (coração remove + "+" adiciona à sacola+toast), estado vazio, →produto. typecheck+lint+export OK.
- [x] **Fase 11 — Sacola** — `app/bag.tsx` real: vazio (ícone+"Explorar vinhos"), itens com stepper `setQty`±1 (remove em 0) + subtotal, rail "Combina com sua compra" (sugestões), resumo (`cartCount`/`cartSubtotal`) + "Finalizar compra"→/checkout. typecheck+lint+export OK.
- [x] **Fase 12 — Checkout + Gifting** — `app/checkout.tsx` real: endereço mock, pagamento (Pix/Cartão/Boleto), `Toggle` pontos, gifting expansível (mensagem+ocultar preço+data), resumo (`pointsDiscount`/`frete`/`checkoutTotal`), "Confirmar pedido"→`clear()`+`/tracking`. typecheck+lint+export OK.
- [x] **Fase 13 — Acompanhamento de pedido** — `app/tracking.tsx` real: toggle Status/Mapa; timeline de 4 etapas (feito/atual/futuro) com dots+linhas coloridos; mapa estilizado (rota SVG tracejada + pino + entregador) + card do entregador com botão telefone. typecheck+lint+export OK.
- [x] **Fase 14 — Perfil + Fidelidade + VIP** — `profile.tsx` (card VIP+pontos/progresso, acesso antecipado, paladar do `useUserStore`, pedidos recentes, links), `loyalty.tsx` (hero pontos, ganhar, resgatar+toast, histórico), `vip.tsx` (dark, `especiais()` em `WineRow` dark badge "Pré-lançamento"). **`DevStub` removido — não há mais stubs.** typecheck+lint+export OK.
- [x] **Fase 15 — Polimento** — reanimated: `Blip` (entregador/estoque), `PulseBar` (vídeo), fade-in de tela (`Screen`), dots do quiz (`LinearTransition`), expansão do gifting (`FadeInDown`); teclado (`keyboardShouldPersistTaps`/`on-drag`); a11y labels. typecheck+lint+27 testes+export OK.
- [ ] Fase 16 — Integração backend (react-query; substitui mocks) — opcional/futuro

### Refinamento nativo (pós-MVP, 2026-07-24) — Fases A–F

Objetivo do usuário: parecer/comportar-se como app nativo iOS/Android **sem perder a identidade** (bordô/creme/serif). Todas estabilizadas (tsc+eslint+27 testes+export iOS/Android).

- [x] **Fase A — Ajustes rápidos** — removido o fade-in de troca de tela (`Screen` sem `FadeIn`; `Stack` sem `animation:'fade'`); splash com fundo **creme** (não bordô) em `app.json` + `AnimatedSplash`; `StatusBar` global `dark` (+ `light` local em quiz/produto premium/sommelier/vip); removido o botão de menu (drawer) do header da Home.
- [x] **Fase B — Onboarding no 1º acesso** — `@react-native-async-storage/async-storage` + `persist`; `useUserStore.onboarded`/`completeOnboarding()`; `app/index.tsx` aguarda hidratação e redireciona (`onboarded ? /home : /quiz`); `quiz.finish()` marca onboarded (inclui "Pular").
- [x] **Fase C — Navegação (tabs) + Native Tabs** — grupo `app/(tabs)/` com pilhas aninhadas por aba. **iOS:** `expo-router/unstable-native-tabs` (SF Symbols, labels pt-BR, `tintColor` bordô, badge da sacola). **Android:** `<Stack>` + a `TabBar` flutuante custom (overlay do root, agora só fora do iOS). `sommelier/loyalty/vip` saíram do `VISIBLE_ON` → **tela cheia**.
- [x] **Fase D — Headers/title nativos** — `src/theme/navHeader.ts` (`brandHeaderOptions`: bg creme, tinta bordô, título Cormorant, `headerLargeTitle` iOS); `Screen` ganhou prop **`nativeHeader`** (sem inset manual + `contentInsetAdjustmentBehavior="automatic"`). Header nativo em: **abas** search/favorites/bag/profile e **pushes** checkout/reviews/loyalty (voltar nativo). Telas imersivas escuras (sommelier/vip/produto premium/quiz) mantêm título artístico custom.
- [x] **Fase E — Expo UI pontual** — `@expo/ui@57.0.7`; `community/segmented-control` (checkout + busca) e `community/datetime-picker` (data do presente, compact no iOS / diálogo no Android). `Toggle` custom mantido.
- [x] **Fase F — Estabilização + docs** — bateria completa verde; este documento atualizado.

## 5. Domínios & features implementados

Nenhum domínio/feature de negócio ainda. Base técnica + design system prontos:
- `src/theme/*` — tema restyle completo e tipado.
- **`src/components/` (design system, todos apresentacionais e via barrel `@components/index`):**
  - Primitivos: `Box`/`TouchableOpacityBox`/`PressableBox`, `Text`.
  - Infra: `AppProviders`, `AnimatedSplash` (Lottie + fade), `Screen` (safe area + fundo sólido/gradiente + scroll + footer).
  - **`BlocoCuradoria`** — a mesma peça visual em `variante="card"` (Home) e `variante="tela-cheia"` (fundo de `/curadoria/[id]`), com **shared element transition implementada**: separa **forma** (gradiente/raio/geometria, `nativeID`=`transitionId`, `collapsable={false}`) de **conteúdo** (irmão com `opacity` própria). O card mede a si mesmo (`measureInWindow`) e grava o retângulo em `useTransicaoStore` — **toda** saída para a tela cheia (toque no bloco e no CTA) passa por `abrirMedindo`, senão não há origem e o destino aparece de salto. O destino anima a forma dali até a janela inteira (reanimated, `.set()`/`.get()`), **morfando um único bloco de texto** (sai da posição/escala do texto do card e chega na do destino — as medidas da tela cheia são as do card × `ESCALA_TELA_CHEIA`, o mesmo fator em corpo/entrelinha/tracking/largura, o que mantém as quebras de linha idênticas; com dois blocos em crossfade o olho percebia que eram textos diferentes). O CTA, único elemento sem par no destino, acompanha a forma e sai em fade até 28%; o resto entra a partir de 45% e um scrim escurecendo a Home; voltar roda o inverso e só então navega (header + botão físico do Android). Conteúdo/cores vêm de `CURADORIAS` (`@data`). Em tela cheia: status bar `light` + visível (full bleed), tab bar escondida (rota fora de `(tabs)`).
  - **`ReentradaEmFade` + `Reaparecer`** — contrapartida da transição acima na VOLTA. Como `/curadoria/[id]` é um push com `animation:'none'`, a Stack também não tem animação de pop: a forma encolhia macia até o card e todo o resto da Home reaparecia seco, de um frame para o outro. `ReentradaEmFade` (provider, recebe o `transitionId`) publica um **relógio em ms** (shared value) e cada `Reaparecer ordem={n}` deriva dali sua janela (`n × 55ms` de atraso, 280ms de fade, 6px de subida, ease-out cúbico) — o provider não precisa saber quantos filhos tem. Gatilho: `abrirMedindo` grava `reentradas[transitionId]` em `useTransicaoStore` junto com a medida (mesma regra: toda saída passa por lá); o provider **zera a opacidade no BLUR** (já escondido sob o destino — zerar no foco arriscaria um frame em opacidade cheia) e anima ao reganhar o foco, consumindo a flag. A flag é o que restringe o fade à volta da tela cheia: as outras rotas (produto, busca, abas) têm animação de Stack própria e aparecem por baixo durante o gesto, onde zerar opacidade seria uma piscada. O **card fica fora** de `Reaparecer` — a forma aterrissa sobre ele, então precisa estar opaco no 1º frame. Sem provider, `Reaparecer` é um wrapper inerte.
  - **`organisms/wine-carousel`** (`CarrosselVinhos` + `FundoVinhos` + `useProgressoCarrossel`) — coleção da curadoria como carrossel horizontal com snap (um vinho por vez, garrafa grande + legenda) e fundo que assume a tonalidade do vinho em foco. Os dois dividem um `progresso` (shared value) criado pela tela; ele é normalizado em unidades de item no handler de scroll, então slides e fundo só raciocinam com índices. A tinta vem da cor do vidro com **alpha corrigido por luminância** (`conf.ts`) — sem isso um branco/espumante clarearia o bordô em vez de só sugerir a tonalidade. `FundoVinhos` entra como `fundoExtra` do `BlocoCuradoria`, ou seja DENTRO da forma, para ser recortado por ela durante a transição. Altura do slide é **medida** (`onLayout`), não fração da tela — com fração a legenda era cortada.
  - Marca: `Icon` (registry: search/heart/bag/home/profile/chevronLeft·Right/arrowRight/play/star/phone/check/plus), `StarRating` (leitura/editável), `BottleGraphic` (garrafa procedural; props `width/cor/capColor/showCap/premium/labelMode('initials'|'full')/iniciais/safra`), `Button` (primary/outline/outlineGold), `Pill`, `Chip`, `SectionTitle`, `WineCard` (+`WineCardData`), `WineRow` (light/dark, +`WineRowData`, `badge`/`subtitle`/`rightSlot`), `SegmentedToggle` (genérico), `Toggle`, `Toast`, `ScreenHeader` (light/dark).
- `src/hooks/{useAppTheme,useAppFonts}.ts`.
- `src/config/env*.ts` — env validado (API_URL opcional até a Fase 16).
- **`src/data/`** (barrel `@data`): `types.ts` (Wine/Review/QuizQuestion/Ocasiao), `wines.ts` (WINES, 10), `reviews.ts` (REVIEWS), `quiz.ts` (QUIZ, 3), `ocasioes.ts` (OCASIOES, 4), `curadorias.ts` (`CURADORIAS`/`CURADORIA_SEMANA`/`findCuradoria` — fonte única do conteúdo do `BlocoCuradoria` nos dois estados), `selectors.ts` (`findWine`, `railSelecionados`, `railMaisVendidos`, `especiais`, `winesByIds`, `searchWines`, `searchByDish`, `cartCount`, `cartSubtotal`, `CAT_ESPECIAIS`).
- **`src/utils/`** (barrel `@utils`): `format.ts` (`brl`/`nf`), `pricing.ts` (`pointsDiscount`/`frete`/`checkoutTotal` + constantes), `wineViewModel.ts` (`toWineCardData`/`toWineRowData`/`tipoUva`/`categoriaCompleta`/`capColorFor`).
- **`src/store/`** (barrel `@store`, zustand): `useCartStore` (items + addToCart/setQty/removeFromCart/clear), `useFavoritesStore` (favs + toggleFav/isFav; inicia com lumiere-blanche+corona-reale), `useUserStore` (paladar/points/setPaladar), `useToastStore` (message + show(auto-dismiss ~2,2s)/hide).
- `src/**/__tests__/` — 27 testes de lógica pura (format, pricing, selectors).
- **Navegação:** `src/components/TabBar.tsx` (overlay flutuante **só Android**, lê `usePathname`, `VISIBLE_ON`=as 5 abas/`ACTIVE_TAB`, badge via `useCartStore`); no **iOS** a barra é nativa (`app/(tabs)/_layout.tsx`). `ToastHost.tsx` consome `useToastStore`. `src/theme/navHeader.ts` = opções de header nativo de marca.
- **Rotas `app/`:** `_layout.tsx` (Stack raiz `headerShown:false` + `{Platform.OS!=='ios' && <TabBar/>}` + `<ToastHost/>` + `<AnimatedSplash/>`), `index.tsx` (aguarda hidratação → `onboarded ? /home : /quiz`), `quiz.tsx`. **Grupo `(tabs)/`**: `_layout.tsx` (iOS `<NativeTabs>` / Android `<Stack>`), e `home|search|favorites|bag|profile/{_layout.tsx (Stack, header nativo),index.tsx}`. **Pushes raiz (tela cheia):** `sommelier.tsx`, `product/[id].tsx`, `reviews/[id].tsx`, `checkout.tsx`, `tracking.tsx`, `loyalty.tsx`, `vip.tsx`, `curadoria/[id].tsx` (destino do bloco de curadoria — usa `BlocoCuradoria variante="tela-cheia"` como fundo, sem recriar o bordô; compõe o carrossel + o fundo tonal, é ela que cria o `progresso` compartilhado), `catalog.tsx` (revisão do DS — remover antes de publicar). URLs seguem iguais (grupos são transparentes: `/home`, `/search`…).

## 6. Pendências & próximos passos

**MVP + refinamento nativo completos.** O que resta é opcional.

0. **⚠️ Requer DEV BUILD (não Expo Go):** native-tabs (`expo-router/unstable-native-tabs`), `@expo/ui` e AsyncStorage são módulos nativos. Rodar com `npx expo run:ios` / `npx expo run:android` (há `expo-dev-client`). Num binário antigo dariam "módulo ausente".
1. **Calibrar no device (iOS+Android):** SF Symbols vs. ícones do design nas abas; cor/contraste do `SegmentedControl` e do large title; **Lottie da splash sobre o novo fundo creme** (foi desenhado p/ fundo escuro — pode precisar de ajuste); `paddingBottom="s108"` das telas de aba talvez sobre no iOS (native tabs já aplica inset via `contentInsetAdjustmentBehavior`); timing de Blip/PulseBar.
2. **Antes de publicar:** remover a rota `/catalog` (revisão do DS); revisar `bundleIdentifier` (`com.ydivino`) e `scheme` (`yydivinomobile`).
3. **a11y (aprofundar, se desejado):** varredura completa de `accessibilityRole`/labels e contraste.
4. **Fase 16 (backend):** quando houver API, criar os domínios (`Api/Adapter/Service/useCases` react-query) e trocar os mocks, **mantendo** os seletores (`@data`) e mappers (`@utils`) — a UI não muda. Usar a skill `sync-backend` para alinhar contratos.
5. **Performance da transição (decisões deliberadas — não desfazer sem medir):** durante a abertura, o único nó que relayouta é a forma; posição é `transform`, não `left`/`top`; o conteúdo pesado (garrafas + tintas) monta só em `onAberturaConcluida`; `fundoExtra` tem tamanho fixo dentro da forma. Medido no simulador: gap máximo da thread JS **durante** a animação caiu de 55ms para 20–25ms, e o stall do mount (~65ms) foi realocado para depois do movimento. Próximas alavancas, se um aparelho fraco ainda sofrer: (a) trocar o `overflow:hidden`+raio da forma por raio pintado no próprio gradiente, evitando o clip arredondado por frame no Android; (b) em coleções grandes, montar só uma janela de camadas de tinta / migrar o carrossel para `Animated.FlatList` virtualizada.
6. **Shared element da curadoria — calibrar no device:** durações (`DURACAO_ABERTURA` 560ms / `DURACAO_FECHAMENTO` 420ms), curva (`CURVA`), pontos de crossfade (`FIM_FADE_FANTASMA` 0.28 / `INICIO_FADE_CONTEUDO` 0.45) e `OPACIDADE_SCRIM` em `BlocoCuradoria.tsx`. Na volta, calibrar também a reentrada da Home em `ReentradaEmFade.tsx` (`DURACAO_ITEM` 280ms / `PASSO` 55ms / `DESLOCAMENTO` 6px) — deve ser quase imperceptível, o protagonista continua sendo o card. Ainda **não** entra em fade a `TabBar` custom do Android (overlay do root, montado/desmontado por rota): no iOS a barra é nativa e reaparece com o pop, então fadear só a do Android criaria divergência — reavaliar no device. Validado no simulador iOS (frame a frame). Conferir no Android se o `measureInWindow` bate com a janela edge-to-edge (a forma deve nascer exatamente sobre o card, sem salto).
7. Persistência de **onboarding já feita** (AsyncStorage). Falta persistir carrinho/favoritos, se desejado (mesmo padrão `persist`).

## 7. Notas / armadilhas

- **Só variáveis `EXPO_PUBLIC_*`** chegam ao bundle. `env.API_URL` é opcional agora (falha cedo se inválida).
- **Reanimated 4**: o plugin correto no `babel.config.js` é `react-native-worklets/plugin` (deve ser o último). `runOnJS` está **deprecado** → usar `scheduleOnRN` de `react-native-worklets`. E preferir `sv.get()` / `sv.set()` a `sv.value` — o eslint novo (`react-hooks/immutability`) barra a atribuição em `.value` quando o shared value já foi passado a outro hook.
- **Shared element (curadoria)**: a rota `curadoria/[id]` é declarada no `app/_layout.tsx` como push **normal** (`card`) + `animation: 'none'` + `contentStyle` no creme da Home + `gestureEnabled: false`. **Não usar `transparentModal`** (nem `containedTransparentModal`): mantinha a Home viva por baixo, mas no iOS toda tela empilhada depois de um modal também vira modal — a tela de produto aberta da coleção subia de baixo como sheet. `animation: 'fade'` também não serve (expõe Home e destino ao mesmo tempo, com o texto do card em dobro). O preço da solução atual é que o entorno da forma durante o crescimento é só a cor de fundo da Home, não o conteúdo dela; por isso o scrim foi removido (não há mais o que escurecer).
- **letterSpacing**: o design usa `em`; no RN é **px**. Já convertido nos `textVariants` (aproximação por variante); ajustar caso destoe.
- **Garrafas**: são formas desenhadas (não imagens). Props previstas: `cor`, `cap`(dourado se premium), `iniciais`, `safra`, e um `size` com presets (rail 46×150, lista 34×100, produto 96–110×320–340, sacola 30×92).
- **Navegação "voltar"**: o protótipo usa pilha própria (`prev[]`); no app usar a stack nativa do Expo Router.
- **Tab bar**: **iOS = Native Tabs** (`(tabs)/_layout.tsx`, split por `Platform`); **Android = TabBar flutuante custom** (overlay do root, visível só nas 5 abas). Telas secundárias (sommelier/loyalty/vip) e fluxos (checkout/tracking) abrem em tela cheia.
- **Native Tabs / `@expo/ui` / AsyncStorage = nativos → dev build.** Ícones das abas usam SF Symbols no iOS; validar API do pacote instalado antes de mexer (feito nesta rodada).
- **Header nativo**: `brandHeaderOptions` + `Screen nativeHeader`. Large title só colapsa no iOS e exige `ScrollView` com `contentInsetAdjustmentBehavior="automatic"` (a prop `nativeHeader` já faz isso). Telas escuras imersivas ficam sem header nativo de propósito.
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
Splash(Lottie) → index (hidrata) → 1º acesso: Quiz → Home · demais: Home direto
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
- [x] Splash · [x] Quiz · [x] Home · [x] Busca · [x] Sommelier · [x] Produto Padrão · [x] Produto Premium · [x] Avaliações · [x] Sacola · [x] Checkout+Gifting · [x] Acompanhamento · [x] Favoritos · [x] Perfil · [x] Fidelidade · [x] VIP  ← **todas as 15 telas prontas**
