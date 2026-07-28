import { memo } from 'react';

import { Platform, StyleSheet, Text, View } from 'react-native';

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

import {
  ANDROID_BLUR_METHOD,
  Colors,
  HEADER_HEIGHT,
  MAX_BLUR_INTENSITY,
  spacing,
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
 *    Em overscroll (puxar para baixo) ele CRESCE até 2× — daí `largeHeaderTitleStyle`
 *    precisar de um `fontSize`. Isso é desligável por `growOnOverscroll`, para
 *    quando o título é um logo (a Home).
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
 * - Props novas `largeTitleSlot` / `smallTitleSlot`: trocam o texto do título por
 *   um nó — é o que permite usar o logo na Home em vez do nome da tela.
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
  }) => {
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler({
      onScroll: event => {
        scrollY.set(event.contentOffset.y);
      },
    });

    // Overscroll (scrollY negativo) engorda o título — o "puxar" do iOS.
    // Desligado, os dois worklets devolvem {} e nem interpolam.
    const tamanhoTituloGrande = useAnimatedStyle(() => {
      if (!growOnOverscroll) {
        return {};
      }
      const base = largeHeaderTitleStyle.fontSize ?? 40;
      return {
        fontSize: interpolate(
          -scrollY.get(),
          [0, 100],
          [base, base * 2],
          Extrapolation.CLAMP,
        ),
      };
    });

    // Equivalente do crescimento acima, para um slot (logo): escala, não corpo.
    const escalaTituloGrande = useAnimatedStyle(() => {
      if (!growOnOverscroll) {
        return {};
      }
      return {
        transform: [
          {
            scale: interpolate(
              -scrollY.get(),
              [0, 100],
              [1, 2],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    });

    const opacidadeTituloGrande = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.get(), [0, 60], [1, 0], Extrapolation.CLAMP),
    }));

    const estiloBarra = useAnimatedStyle(() => ({
      opacity: withTiming(
        interpolate(scrollY.get(), [40, 80], [0, 1], Extrapolation.CLAMP),
        { duration: 600 },
      ),
      transform: [
        {
          translateY: withTiming(
            interpolate(scrollY.get(), [40, 80], [20, 0], Extrapolation.CLAMP),
            { duration: 600 },
          ),
        },
      ],
    }));

    const estiloSubtituloBarra = useAnimatedStyle(() => {
      const visivel = scrollY.get() > 100;
      return {
        opacity: withSpring(visivel ? 0.5 : 0, {
          damping: 18,
          stiffness: 120,
          mass: 1.2,
        }),
        transform: [
          { translateY: withTiming(visivel ? 0 : 10, { duration: 900 }) },
        ],
      };
    });

    const estiloFundoHeader = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.get(), [0, 80], [0, 1], Extrapolation.CLAMP),
    }));

    const blurFundoHeader = useAnimatedProps(() => ({
      intensity: interpolate(
        scrollY.get(),
        [0, 100],
        [0, headerBlurConfig.intensity],
        Extrapolation.CLAMP,
      ),
    }));

    // Pico no meio do colapso: um "sopro" de blur que passa e vai embora.
    const blurTituloCompacto = useAnimatedProps(() => {
      const intensidade = interpolate(
        scrollY.get(),
        [0, 80, 100],
        [0, 15, 0],
        Extrapolation.CLAMP,
      );
      return {
        intensity:
          scrollY.get() < 30 ? withTiming(0, { duration: 900 }) : intensidade,
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

    const mascara = (
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
            estiloFundoHeader,
          ]}>
          {Platform.OS !== 'web' ? (
            <MaskedView maskElement={mascara} style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={headerBackgroundGradient.colors}
                locations={headerBackgroundGradient.locations ?? undefined}
                start={headerBackgroundGradient.start}
                end={headerBackgroundGradient.end}
                style={StyleSheet.absoluteFill}
              />
              <AnimatedBlurView
                animatedProps={blurFundoHeader}
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
            estiloBarra,
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
                    estiloSubtituloBarra,
                    smallHeaderSubtitleStyle,
                  ]}>
                  {subtitle}
                </Animated.Text>
              )}
            </View>
            <MaskedView
              maskElement={mascara}
              style={StyleSheet.absoluteFill}
              pointerEvents="none">
              <AnimatedBlurView
                animatedProps={blurTituloCompacto}
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

        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          /*
            `insets.top + sm`, não `+ HEADER_HEIGHT`: no original (e na
            referência) o título grande começa logo abaixo da status bar, sem a
            faixa vazia de nav bar que o large title nativo do iOS deixa acima.
            É por isso que ele PRECISA sair em fade — ele nasce dentro da área
            que a barra compacta vai ocupar.

            Sem `paddingBottom`: as telas deste app já reservam o rodapé da tab
            bar (`paddingBottom="s108"`).
          */
          contentContainerStyle={[
            { paddingTop: insets.top + spacing.sm },
            contentContainerStyle,
          ]}>
          {/* 1. Título grande */}
          <Animated.View
            style={[styles.largeTitleContainer, opacidadeTituloGrande]}>
            {largeTitleSlot ? (
              <Animated.View
                accessibilityLabel={largeTitle}
                style={[styles.largeTitleSlot, escalaTituloGrande]}>
                {largeTitleSlot}
              </Animated.View>
            ) : (
              <Animated.Text
                style={[
                  styles.largeTitle,
                  largeHeaderTitleStyle,
                  tamanhoTituloGrande,
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
    color: Colors.titulo,
    textAlign: 'center',
  },
  smallHeaderSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: Colors.subtitulo,
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
    color: Colors.titulo,
    letterSpacing: -0.5,
    paddingTop: 5,
  },
  largeSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: Colors.subtitulo,
    marginTop: spacing.xs,
  },
  /* Sem padding horizontal: cada tela do app controla o próprio. */
  content: {},
});
