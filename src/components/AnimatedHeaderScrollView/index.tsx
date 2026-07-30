import { memo, useCallback, useRef } from 'react';

import {
  type LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  type TextLayoutEventData,
  View,
  type NativeSyntheticEvent,
} from 'react-native';

import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, palette } from '@theme/index';

import { useScrollableSearchOptional } from '../ScrollableSearch';
import {
  ANDROID_BLUR_METHOD,
  Colors,
  HEADER_HEIGHT,
  MAX_BLUR_INTENSITY,
  spacing,
  TITLE_WIDTH_SAFETY,
} from './conf';
import { type AnimatedHeaderProps } from './types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AnimatedHeaderScrollView — título grande que colapsa em barra compacta
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Porte do componente do reacticx
 * (https://www.reacticx.com/docs/components/animated-header-scrollview), o
 * padrão de large title do iOS reconstruído em Reanimated.
 *
 * ── Por que não o header nativo ──────────────────────────────────────────────
 *
 * O iOS tem isso nativo (`headerLargeTitleEnabled`), mas o colapso depende do
 * `react-native-screens` ACHAR o ScrollView da tela, e a busca dele exige o
 * scroll como filho direto do content wrapper (ou da safe area view que o iOS 26
 * insere no meio). Qualquer view entre os dois — fundo, wrapper de tema — mata o
 * colapso silenciosamente: o header nasce aberto e nunca fecha. Além disso o
 * Android não tem large title nativo, e o nativo não suporta subtítulo.
 *
 * Em JS o comportamento é o mesmo nas duas plataformas, com subtítulo, e não
 * depende da árvore de views.
 *
 * ── Os quatro elementos que animam ──────────────────────────────────────────
 *
 * 1. Título grande: rola com o conteúdo (não é fixo) e sai em fade em [0, 60].
 *    Em overscroll (puxar para baixo) ele CRESCE até o que couber em uma linha,
 *    com teto em `maxOverscrollGrowth` — daí `largeHeaderTitleStyle` precisar de
 *    um `fontSize`. Isso é desligável por `growOnOverscroll`, para quando o
 *    título é um logo (a Home).
 * 2. Fundo do header: gradiente + blur entrando em opacidade sobre [0, 80].
 *    Mascarado por um gradiente eased, o que dá a borda inferior difusa (sem
 *    linha de corte) — é o papel do `MaskedView` aqui.
 * 3. Título compacto: entra em [40, 80], com `withTiming` por cima da
 *    interpolação. Envolver interpolate em withTiming a cada frame é do
 *    original: dá uma inércia que o fade puro não tem.
 * 4. Subtítulo compacto: entra em mola depois de 100px, em opacidade 0.5.
 *
 * ── Desvios do original, deliberados ────────────────────────────────────────
 *
 * - Cores em creme/bordô (ver `conf.ts`); o original é dark.
 * - `styles.content` sem padding horizontal: as telas deste app já controlam o
 *   próprio padding (22). Manter o do original dobraria a margem.
 * - O blur do fundo do header ANIMA (0 → `headerBlurConfig.intensity`). No
 *   original o `useAnimatedProps` para isso existe mas não é ligado a nenhuma
 *   view — a `BlurView` recebe intensidade fixa. Aqui está ligado.
 * - Prop `largeTitleBlurIntensity` não foi portada: no original ela também não
 *   chega a nenhuma view, e o que ela calcula é blur no título grande EM
 *   REPOUSO, saindo ao rolar — o inverso do que a referência mostra.
 * - `pointerEvents="none"` no fundo do header. Ele é 50px mais alto que a barra
 *   e puramente decorativo; sem isso engole toques no topo do conteúdo.
 * - `rightComponent` fica FORA da barra que faz fade, sempre visível (no
 *   original ele desaparece em repouso junto com o título compacto). Ver o
 *   comentário no JSX.
 * - O crescimento do título grande no overscroll é LIMITADO pela largura da
 *   linha, não só pelo teto de 2× do original: títulos longos ("Notificações")
 *   quebravam linha ao puxar. Ver `maxOverscrollGrowth` e as medições abaixo.
 * - Props novas `largeTitleSlot` / `smallTitleSlot`: trocam o texto do título por
 *   um nó — é o que permite usar o logo na Home em vez do nome da tela.
 * - Prop nova `leftComponent`: o voltar de telas EMPILHADAS (`/notifications`).
 *   No original só existe ação à direita, porque ele só cobre raiz de aba. Com
 *   ela o título grande deixa de nascer na faixa da nav bar (senão o botão cairia
 *   sobre a primeira linha) e todo o colapso é adiado por `collapseOffset` — o
 *   ponto em que o título começa a sumir e a barra a entrar continua sendo o
 *   mesmo, relativo ao título.
 */

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const AnimatedHeaderScrollView = memo<AnimatedHeaderProps>(
  ({
    largeTitle,
    subtitle,
    children,
    largeTitleSlot,
    smallTitleSlot,
    rightComponent,
    leftComponent,
    showsVerticalScrollIndicator = false,
    contentContainerStyle,
    headerBackgroundGradient = {
      colors: [
        'rgba(243,236,221,0.92)',
        'rgba(243,236,221,0.86)',
        'transparent',
      ],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
    headerBlurConfig = {
      intensity: MAX_BLUR_INTENSITY,
      tint: Platform.OS === 'ios' ? 'systemThickMaterialLight' : 'light',
    },
    smallTitleBlurIntensity = 90,
    smallTitleBlurTint = 'light',
    maskGradientColors = {
      start: 'transparent',
      middle: 'rgba(0,0,0,0.99)',
      end: 'black',
    },
    // 44 = variante `h1` do tema. O original usa 40 (numa sans, que ocupa mais).
    largeHeaderTitleStyle = { fontSize: 44 },
    largeHeaderSubtitleStyle,
    smallHeaderTitleStyle,
    smallHeaderSubtitleStyle,
    growOnOverscroll = true,
    maxOverscrollGrowth = 2,
    adjustsForKeyboard = false,
  }) => {
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);

    /**
     * Teto do crescimento do título grande, em duas medidas: a largura útil da
     * linha e a largura natural do texto em repouso. Com as duas, o worklet sabe
     * até onde pode esticar o `fontSize` sem que o título quebre linha — o que
     * acontecia com títulos longos, que no teto fixo de 2× estouravam a linha.
     *
     * Shared values (e não state) para não re-renderizar a cada medição: quem lê
     * é só o worklet do `fontSize`.
     */
    const availableTitleWidth = useSharedValue(0);
    const naturalTitleWidth = useSharedValue(0);

    /**
     * A medição do texto vale só EM REPOUSO. Animar o `fontSize` re-dispara
     * `onTextLayout` com a largura já esticada; sem esta guarda o teto subiria a
     * cada frame do overscroll e o título cresceria sem limite.
     */
    const measuredTitle = useRef<string | null>(null);

    const onTitleContainerLayout = useCallback(
      (event: LayoutChangeEvent) => {
        availableTitleWidth.set(
          event.nativeEvent.layout.width - spacing.lg * 2,
        );
      },
      [availableTitleWidth],
    );

    const onTitleTextLayout = useCallback(
      (event: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (measuredTitle.current === largeTitle) {
          return;
        }
        measuredTitle.current = largeTitle;

        const { lines } = event.nativeEvent;
        /**
         * Mais de uma linha já em repouso: `Infinity` faz o teto cair para 1× —
         * o título não cresce, porque crescer só somaria linhas.
         */
        naturalTitleWidth.set(
          lines.length > 1 ? Number.POSITIVE_INFINITY : (lines[0]?.width ?? 0),
        );
      },
      [largeTitle, naturalTitleWidth],
    );

    /**
     * Com botão à esquerda (voltar), o título grande nasce uma faixa de nav bar
     * mais abaixo — e TODO o colapso (fade do título, entrada da barra, fundo,
     * blur) é adiado nessa mesma distância. Sem ele o valor é 0 e as contas
     * ficam exatamente as de antes.
     */
    const collapseOffset = leftComponent ? HEADER_HEIGHT : 0;

    /**
     * Busca puxável (`ScrollableSearch`) em volta desta tela, se houver. Ela não
     * tem ScrollView próprio: quem lê o scroll é este componente, e repassa o
     * offset para os worklets do contexto. Só os worklets são capturados no
     * handler — o resto do contexto (refs, setState) não atravessa para a UI.
     */
    const pullToSearch = useScrollableSearchOptional();
    const onPullScroll = pullToSearch?.onScroll;
    const onPullBeginDrag = pullToSearch?.onBeginDrag;
    const onPullEndDrag = pullToSearch?.onEndDrag;

    const onScroll = useAnimatedScrollHandler(
      {
        onScroll: event => {
          scrollY.set(event.contentOffset.y);
          if (onPullScroll) {
            onPullScroll(event.contentOffset.y);
          }
        },
        onBeginDrag: event => {
          if (onPullBeginDrag) {
            onPullBeginDrag(event.contentOffset.y);
          }
        },
        onEndDrag: () => {
          if (onPullEndDrag) {
            onPullEndDrag();
          }
        },
      },
      [onPullScroll, onPullBeginDrag, onPullEndDrag],
    );

    /**
     * Dentro de uma busca puxável o crescimento do título é DESLIGADO à força: é
     * o mesmo gesto (puxar a lista para baixo), e ele passa a focar o campo de
     * busca — as duas respostas ao mesmo tempo brigariam pela atenção.
     */
    const growTitle = growOnOverscroll && !pullToSearch;

    // Overscroll (scrollY negativo) engorda o título — o "puxar" do iOS.
    // Desligado, os dois worklets devolvem {} e nem interpolam.
    const largeTitleSize = useAnimatedStyle(() => {
      if (!growTitle) {
        return {};
      }
      const base = largeHeaderTitleStyle.fontSize ?? 40;

      /**
       * O teto é o MENOR entre `maxOverscrollGrowth` e o que cabe na linha.
       * `letterSpacing` é fixo (não escala com o corpo), então a largura real
       * cresce um pouco mais que proporcionalmente — daí a folga de 4%.
       */
      const available = availableTitleWidth.get();
      const natural = naturalTitleWidth.get();
      const fits =
        available > 0 && natural > 0
          ? (available * TITLE_WIDTH_SAFETY) / natural
          : maxOverscrollGrowth;
      const growth = Math.max(1, Math.min(maxOverscrollGrowth, fits));

      return {
        fontSize: interpolate(
          -scrollY.get(),
          [0, 100],
          [base, base * growth],
          Extrapolation.CLAMP,
        ),
      };
    });

    // Equivalente do crescimento acima, para um slot (logo): escala, não corpo.
    const largeTitleScale = useAnimatedStyle(() => {
      if (!growTitle) {
        return {};
      }
      return {
        transform: [
          {
            scale: interpolate(
              -scrollY.get(),
              [0, 100],
              [1, maxOverscrollGrowth],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    });

    const largeTitleOpacity = useAnimatedStyle(() => ({
      opacity: interpolate(
        scrollY.get(),
        [collapseOffset, collapseOffset + 60],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    }));

    const barStyle = useAnimatedStyle(() => ({
      opacity: withTiming(
        interpolate(
          scrollY.get(),
          [collapseOffset + 40, collapseOffset + 80],
          [0, 1],
          Extrapolation.CLAMP,
        ),
        { duration: 600 },
      ),
      transform: [
        {
          translateY: withTiming(
            interpolate(
              scrollY.get(),
              [collapseOffset + 40, collapseOffset + 80],
              [20, 0],
              Extrapolation.CLAMP,
            ),
            { duration: 600 },
          ),
        },
      ],
    }));

    const barSubtitleStyle = useAnimatedStyle(() => {
      const visible = scrollY.get() > collapseOffset + 100;
      return {
        opacity: withSpring(visible ? 0.5 : 0, {
          damping: 18,
          stiffness: 120,
          mass: 1.2,
        }),
        transform: [
          { translateY: withTiming(visible ? 0 : 10, { duration: 900 }) },
        ],
      };
    });

    const headerBackgroundStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        scrollY.get(),
        [collapseOffset, collapseOffset + 80],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    }));

    const headerBackgroundBlur = useAnimatedProps(() => ({
      intensity: interpolate(
        scrollY.get(),
        [collapseOffset, collapseOffset + 100],
        [0, headerBlurConfig.intensity],
        Extrapolation.CLAMP,
      ),
    }));

    // Pico no meio do colapso: um "sopro" de blur que passa e vai embora.
    const smallTitleBlur = useAnimatedProps(() => {
      const intensity = interpolate(
        scrollY.get(),
        [collapseOffset, collapseOffset + 80, collapseOffset + 100],
        [0, 15, 0],
        Extrapolation.CLAMP,
      );
      return {
        intensity:
          scrollY.get() < collapseOffset + 30
            ? withTiming(0, { duration: 900 })
            : intensity,
      };
    });

    // Gradiente eased para a máscara: transição sem banding, borda difusa.
    const { colors: maskColors, locations: maskLocations } = easeGradient({
      colorStops: {
        0: { color: maskGradientColors.start },
        0.5: { color: maskGradientColors.middle },
        1: { color: maskGradientColors.end },
      },
      extraColorStopsPerTransition: 20,
    });

    const mask = (
      <LinearGradient
        locations={maskLocations as [number, number, ...number[]]}
        colors={maskColors as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
      />
    );

    return (
      <View style={styles.container}>
        {/* 2. Fundo do header */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.headerBackgroundContainer,
            { height: HEADER_HEIGHT + insets.top + 50 },
            headerBackgroundStyle,
          ]}>
          {Platform.OS !== 'web' ? (
            <MaskedView maskElement={mask} style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={headerBackgroundGradient.colors}
                locations={headerBackgroundGradient.locations ?? undefined}
                start={headerBackgroundGradient.start}
                end={headerBackgroundGradient.end}
                style={StyleSheet.absoluteFill}
              />
              <AnimatedBlurView
                animatedProps={headerBackgroundBlur}
                tint={headerBlurConfig.tint}
                blurMethod={ANDROID_BLUR_METHOD}
                style={StyleSheet.absoluteFill}
              />
            </MaskedView>
          ) : (
            <View
              style={[StyleSheet.absoluteFill, styles.webHeaderBackground]}
            />
          )}
        </Animated.View>

        {/* 3 + 4. Barra compacta */}
        <Animated.View
          style={[
            styles.fixedHeader,
            { paddingTop: insets.top, height: HEADER_HEIGHT + insets.top },
            barStyle,
          ]}>
          <View style={styles.fixedHeaderContent}>
            <View style={styles.fixedHeaderTextContainer}>
              {smallTitleSlot ?? (
                <Animated.Text
                  numberOfLines={1}
                  style={[styles.smallHeaderTitle, smallHeaderTitleStyle]}>
                  {largeTitle}
                </Animated.Text>
              )}
              {subtitle && (
                <Animated.Text
                  numberOfLines={1}
                  style={[
                    styles.smallHeaderSubtitle,
                    barSubtitleStyle,
                    smallHeaderSubtitleStyle,
                  ]}>
                  {subtitle}
                </Animated.Text>
              )}
            </View>
            <MaskedView
              maskElement={mask}
              style={StyleSheet.absoluteFill}
              pointerEvents="none">
              <AnimatedBlurView
                animatedProps={smallTitleBlur}
                intensity={smallTitleBlurIntensity}
                tint={smallTitleBlurTint}
                blurMethod={ANDROID_BLUR_METHOD}
                style={[
                  styles.smallTitleBlurOverlay,
                  { height: HEADER_HEIGHT + insets.top + 20 },
                ]}
              />
            </MaskedView>
          </View>
        </Animated.View>

        {/*
          Ação da direita FORA da barra que faz fade: no iOS os botões da nav bar
          ficam sempre visíveis, só o título compacto é que aparece ao rolar.
          Dentro da barra (como no original) o botão desapareceria em repouso.

          Absoluto, e não uma coluna na linha da barra, para o título compacto
          poder ficar centralizado de verdade — numa linha, o botão empurraria o
          centro para a esquerda.
        */}
        {rightComponent && (
          <View
            pointerEvents="box-none"
            style={[
              styles.rightComponentContainer,
              { paddingTop: insets.top, height: HEADER_HEIGHT + insets.top },
            ]}>
            {rightComponent}
          </View>
        )}

        {/* Mesma regra do `rightComponent`, do outro lado: é o voltar. */}
        {leftComponent && (
          <View
            pointerEvents="box-none"
            style={[
              styles.leftComponentContainer,
              { paddingTop: insets.top, height: HEADER_HEIGHT + insets.top },
            ]}>
            {leftComponent}
          </View>
        )}

        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          /*
            Mesmos ajustes de teclado do `Screen`: sem `handled`, o primeiro
            toque num botão só fecha o teclado e é preciso tocar de novo.
          */
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={adjustsForKeyboard}
          /* Só serve à busca puxável: é o gatilho para o `Anchor` remedir. */
          onContentSizeChange={pullToSearch?.notifyContentResize}
          /*
            `insets.top + sm`, não `+ HEADER_HEIGHT`: no original (e na
            referência) o título grande começa logo abaixo da status bar, sem a
            faixa vazia de nav bar que o large title nativo do iOS deixa acima.
            É por isso que ele PRECISA sair em fade — ele nasce dentro da área
            que a barra compacta vai ocupar.

            Sem `paddingBottom`: as telas deste app já reservam o rodapé da tab
            bar (`paddingBottom="s108"`).

            Com `leftComponent` (voltar), aí sim entra a faixa de nav bar: o
            botão mora nela e o título grande começa abaixo — é o `collapseOffset`
            que mantém o colapso na mesma cadência.
          */
          contentContainerStyle={[
            {
              paddingTop:
                insets.top + (leftComponent ? HEADER_HEIGHT : spacing.sm),
            },
            contentContainerStyle,
          ]}>
          {/* 1. Título grande */}
          <Animated.View
            onLayout={onTitleContainerLayout}
            style={[styles.largeTitleContainer, largeTitleOpacity]}>
            {largeTitleSlot ? (
              <Animated.View
                accessibilityLabel={largeTitle}
                style={[styles.largeTitleSlot, largeTitleScale]}>
                {largeTitleSlot}
              </Animated.View>
            ) : (
              <Animated.Text
                onTextLayout={onTitleTextLayout}
                style={[
                  styles.largeTitle,
                  largeHeaderTitleStyle,
                  largeTitleSize,
                ]}>
                {largeTitle}
              </Animated.Text>
            )}
            {subtitle && (
              <Text style={[styles.largeSubtitle, largeHeaderSubtitleStyle]}>
                {subtitle}
              </Text>
            )}
          </Animated.View>
          <View style={styles.content}>{children}</View>
        </Animated.ScrollView>
      </View>
    );
  },
);

AnimatedHeaderScrollView.displayName = 'AnimatedHeaderScrollView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  webHeaderBackground: {
    backgroundColor: palette.creme,
  },
  smallTitleBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    justifyContent: 'flex-end',
  },
  fixedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  fixedHeaderTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  smallHeaderTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 18,
    color: Colors.title,
    textAlign: 'center',
  },
  smallHeaderSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: Colors.subtitle,
    textAlign: 'center',
  },
  rightComponentContainer: {
    position: 'absolute',
    top: 0,
    right: spacing.lg,
    // Acima da barra (11) e do blur do título compacto (99).
    zIndex: 100,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
  leftComponentContainer: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    zIndex: 100,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
  /* `center top`: o logo cresce para baixo sem sair do centro. */
  largeTitleSlot: {
    transformOrigin: 'center top',
  },
  largeTitleContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  largeTitle: {
    fontFamily: fonts.serifSemiBold,
    color: Colors.title,
    letterSpacing: -0.5,
    paddingTop: 5,
  },
  largeSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: Colors.subtitle,
    marginTop: spacing.xs,
  },
  /* Sem padding horizontal: cada tela do app controla o próprio. */
  content: {},
});
