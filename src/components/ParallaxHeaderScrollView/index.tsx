import { memo } from 'react';

import { Image, Platform, StyleSheet, Text, View } from 'react-native';

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
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@theme/index';

import {
  ANDROID_BLUR_METHOD,
  Colors,
  IMAGE_HEIGHT,
  MAX_BLUR_INTENSITY,
  NAV_FADE_DISTANCE,
  NAV_GRADIENT_COLORS,
  NAV_HEIGHT,
  NAV_TITLE_FADE_DISTANCE,
  OVERLAY_FADE_END,
  OVERLAY_FADE_START,
  PARALLAX_FACTOR,
  SCRIM_COLORS,
  SCRIM_LOCATIONS,
  spacing,
} from './conf';
import { type ParallaxHeaderProps } from './types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ParallaxHeaderScrollView — hero fotográfico com parallax
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Porte do componente do reacticx
 * (https://www.reacticx.com/docs/components/parallax-header), irmão do
 * `AnimatedHeaderScrollView` que já usamos nas abas. A diferença de papel: lá o
 * herói é o TÍTULO (large title do iOS colapsando); aqui é uma FOTOGRAFIA, e o
 * título vive por cima dela.
 *
 * ── O que anima ─────────────────────────────────────────────────────────────
 *
 * 1. Foto: rola a `PARALLAX_FACTOR` (0.5) da velocidade do conteúdo. Como ela é
 *    o primeiro filho do ScrollView, já sobe a 1.0 junto com tudo — então
 *    "meia velocidade" é conseguido EMPURRANDO-A de volta para baixo em metade
 *    do offset. O resultado é o conteúdo deslizando por cima dela.
 * 2. Foto em overscroll (puxar para baixo): cresce a partir do centro e sobe
 *    metade do que cresceu, o que mantém a borda superior colada na status bar —
 *    sem isso o gesto abriria uma faixa vazia acima da foto.
 * 3. Conteúdo sobre a foto (`overlay`): rola na velocidade do conteúdo (1.0) e
 *    sai em fade em [0, metade da altura da foto], antes de encontrar a barra.
 * 4. Barra fixa: fundo (gradiente + blur) entrando em `NAV_FADE_DISTANCE` px
 *    antes de a foto sair de vista; o título compacto entra depois, na metade
 *    dessa distância. Mesmo `MaskedView` + `easeGradient` do
 *    `AnimatedHeaderScrollView`, para a borda inferior ficar difusa em vez de
 *    virar uma linha de corte.
 *
 * ── Desvios do original, deliberados ────────────────────────────────────────
 *
 * - Reanimated 4 no lugar do `Animated` da RN (o original usa a API antiga, com
 *   `useNativeDriver` e um hook `useAnimateScrollView`). O resto do app é
 *   reanimated; misturar os dois num mesmo scroll é pedir jank.
 * - Cores em bordô/creme/dourado (ver `conf.ts`); o original é preto/branco.
 * - Prop `disableScale` NÃO foi portada. Sem o crescimento, o overscroll deixa
 *   aparecer o fundo do container acima da foto — uma faixa lisa que denuncia a
 *   emenda. O crescimento não é um enfeite aqui, é o que fecha o topo.
 * - Sem `HeaderNavbarComponent`/`TopNavBarComponent` separados: uma barra só,
 *   com `leftComponent`/`rightComponent` SEMPRE visíveis (mesma regra do
 *   `AnimatedHeaderScrollView` — sobre uma foto, o voltar não pode nascer
 *   invisível) e o título entrando em fade.
 * - Véu (`scrim`) sobre a foto por padrão. No original a legibilidade do título
 *   é problema de quem passa a imagem; aqui a foto é fixa e clara (a adega
 *   iluminada), então o véu é parte do componente.
 */

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const ParallaxHeaderScrollView = memo<ParallaxHeaderProps>(
  ({
    image,
    imageHeight = IMAGE_HEIGHT,
    overlay,
    compactTitle,
    leftComponent,
    rightComponent,
    children,
    showsVerticalScrollIndicator = false,
    contentContainerStyle,
    scrimColors = SCRIM_COLORS,
    scrimLocations = SCRIM_LOCATIONS,
    navGradientColors = NAV_GRADIENT_COLORS,
    navBlurConfig = {
      intensity: MAX_BLUR_INTENSITY,
      tint: Platform.OS === 'ios' ? 'systemThickMaterialDark' : 'dark',
    },
    navTitleStyle,
  }) => {
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler(event => {
      scrollY.set(event.contentOffset.y);
    });

    /** Offset em que a base da foto encosta na barra fixa. */
    const collapseAt = imageHeight - (NAV_HEIGHT + insets.top);

    // 1 + 2. Foto: parallax ao rolar, crescimento no overscroll.
    const imageStyle = useAnimatedStyle(() => {
      const y = scrollY.get();
      if (y >= 0) {
        return {
          transform: [{ translateY: y * PARALLAX_FACTOR }, { scale: 1 }],
        };
      }
      /**
       * Puxando `d = -y` px para baixo, o conteúdo (e com ele a foto) desce `d`.
       * Escalando `1 + d/H` a foto ganha `d/2` de cada lado; subir `d/2` traz a
       * borda de cima de volta ao topo da janela. A de baixo passa a invadir o
       * conteúdo — que é irmão POSTERIOR e opaco, então pinta por cima.
       */
      return {
        transform: [{ translateY: y / 2 }, { scale: 1 - y / imageHeight }],
      };
    });

    // 3. Conteúdo sobre a foto.
    const overlayStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        scrollY.get(),
        [imageHeight * OVERLAY_FADE_START, imageHeight * OVERLAY_FADE_END],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    }));

    // 4. Barra fixa.
    const navBackgroundStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        scrollY.get(),
        [collapseAt - NAV_FADE_DISTANCE, collapseAt],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    }));

    const navBackgroundBlur = useAnimatedProps(() => ({
      intensity: interpolate(
        scrollY.get(),
        [collapseAt - NAV_FADE_DISTANCE, collapseAt],
        [0, navBlurConfig.intensity],
        Extrapolation.CLAMP,
      ),
    }));

    /*
      `withTiming` por cima da interpolação é do original: dá ao título compacto
      uma inércia que o fade puro não tem (o mesmo truque do
      `AnimatedHeaderScrollView`).
    */
    const navTitleAnimatedStyle = useAnimatedStyle(() => {
      const progress = interpolate(
        scrollY.get(),
        [collapseAt - NAV_TITLE_FADE_DISTANCE, collapseAt],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return {
        opacity: withTiming(progress, { duration: 400 }),
        transform: [
          {
            translateY: withTiming(interpolate(progress, [0, 1], [10, 0]), {
              duration: 400,
            }),
          },
        ],
      };
    });

    // Gradiente eased para a máscara: borda inferior difusa, sem banding.
    const { colors: maskColors, locations: maskLocations } = easeGradient({
      colorStops: {
        0: { color: 'transparent' },
        0.5: { color: 'rgba(0,0,0,0.99)' },
        1: { color: 'black' },
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

    const navBarHeight = NAV_HEIGHT + insets.top;

    return (
      <View style={styles.container}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          /*
            Sem `paddingTop`: a foto sangra até o topo da janela, por baixo da
            status bar. É o que faz o hero parecer parte do aparelho.
          */
          contentContainerStyle={contentContainerStyle}>
          <View style={[styles.header, { height: imageHeight }]}>
            <Animated.View
              style={[styles.imageLayer, { height: imageHeight }, imageStyle]}>
              <Image
                source={image}
                resizeMode="cover"
                style={styles.image}
                accessible={false}
              />
            </Animated.View>
            {/*
              Extensão do véu para a faixa que o overscroll revela ACIMA da
              caixa do header.

              O `scrim` abaixo é `absoluteFill` DESTA caixa, e no overscroll a
              caixa desce `d` px junto com o conteúdo — mas a foto cresce e
              continua colada no topo da janela. Sem esta extensão, a faixa
              `[0, d]` mostrava a foto CRUA enquanto logo abaixo o gradiente já
              começava em 35% de escuro: um degrau horizontal nítido atravessando
              a fotografia (o "bug visual ao arrastar para baixo").

              A cor é a PRIMEIRA parada do gradiente, constante: encostada nela, a
              emenda desaparece — a faixa revelada parece só mais um pedaço do
              topo da foto. Altura = uma altura de foto, folga muito acima de
              qualquer overscroll real.
            */}
            <View
              pointerEvents="none"
              style={[
                styles.scrimOverscroll,
                { top: -imageHeight, height: imageHeight },
                { backgroundColor: scrimColors[0] },
              ]}
            />
            <LinearGradient
              pointerEvents="none"
              colors={scrimColors}
              locations={scrimLocations}
              style={StyleSheet.absoluteFill}
            />
            {overlay && (
              <Animated.View
                style={[
                  styles.overlay,
                  { paddingTop: navBarHeight },
                  overlayStyle,
                ]}>
                {overlay}
              </Animated.View>
            )}
            {/* Remate entre a fotografia e o corpo da tela. */}
            <View pointerEvents="none" style={styles.hairline} />
          </View>
          {children}
        </Animated.ScrollView>

        {/* 4. Fundo da barra fixa (decorativo — não engole toques). */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.navBackground,
            { height: navBarHeight + 30 },
            navBackgroundStyle,
          ]}>
          {Platform.OS !== 'web' ? (
            <MaskedView maskElement={mask} style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={navGradientColors}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <AnimatedBlurView
                animatedProps={navBackgroundBlur}
                tint={navBlurConfig.tint}
                blurMethod={ANDROID_BLUR_METHOD}
                style={StyleSheet.absoluteFill}
              />
            </MaskedView>
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.webNavBackground]} />
          )}
        </Animated.View>

        {/* Título compacto — entra depois do fundo. */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.navBar,
            { paddingTop: insets.top, height: navBarHeight },
            navTitleAnimatedStyle,
          ]}>
          <Text numberOfLines={1} style={[styles.navTitle, navTitleStyle]}>
            {compactTitle}
          </Text>
        </Animated.View>

        {/*
          Ações sempre visíveis, absolutas e ACIMA da barra: numa linha com o
          título elas empurrariam o centro, e dentro da barra nasceriam
          invisíveis — o voltar tem de existir no primeiro frame.
        */}
        {leftComponent && (
          <View
            pointerEvents="box-none"
            style={[
              styles.leftComponentContainer,
              { paddingTop: insets.top, height: navBarHeight },
            ]}>
            {leftComponent}
          </View>
        )}
        {rightComponent && (
          <View
            pointerEvents="box-none"
            style={[
              styles.rightComponentContainer,
              { paddingTop: insets.top, height: navBarHeight },
            ]}>
            {rightComponent}
          </View>
        )}
      </View>
    );
  },
);

ParallaxHeaderScrollView.displayName = 'ParallaxHeaderScrollView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /*
    SEM `overflow: 'hidden'`: no overscroll a foto cresce PARA FORA desta caixa,
    e é justamente isso que fecha a faixa vazia no topo. Clipando, o crescimento
    não apareceria.
  */
  header: {
    justifyContent: 'flex-end',
  },
  imageLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrimOverscroll: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  overlay: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg + spacing.sm,
  },
  hairline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.hairline,
  },
  navBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  webNavBackground: {
    backgroundColor: NAV_GRADIENT_COLORS[0],
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg + 40,
  },
  navTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 18,
    color: Colors.navTitle,
    textAlign: 'center',
  },
  leftComponentContainer: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    zIndex: 12,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
  rightComponentContainer: {
    position: 'absolute',
    top: 0,
    right: spacing.lg,
    zIndex: 12,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
});
