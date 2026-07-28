import { useState } from 'react';

import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { type Wine } from '@data/types';
import { fonts } from '@theme/index';
import { capColorFor, typeAndGrape } from '@utils/index';
import { brl } from '@utils/format';

import { Box, TouchableOpacityBox } from '../../Box';
import { BottleGraphic } from '../../BottleGraphic';
import { Text } from '../../Text';
import {
  TINT_ALPHA,
  LUMINANCE_CORRECTION,
  NEIGHBOR_OFFSET,
  NEIGHBOR_SCALE,
  SPACING,
  CAPTION_HEIGHT,
  TINT_HEIGHT_FRACTION,
  ITEM_WIDTH_FRACTION,
  FRAME_INSET,
  NEIGHBOR_OPACITY,
  NEIGHBOR_ROTATION,
} from './conf';
import {
  type WineCarouselProps,
  type WineBackdropProps,
  type CarouselProgress,
  type WineSlideProps,
} from './types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Carrossel de vinhos da curadoria + fundo que reage ao vinho em foco
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * São DOIS componentes que dividem um único `progress` (shared value criado
 * por quem compõe a tela, ver `app/curation/[id].tsx`):
 *
 *  • `WineBackdrop`  — camada de tinta atrás de tudo. Uma camada por vinho,
 *                      em crossfade: a do vinho em foco vai a 1, as vizinhas
 *                      a 0. Vive DENTRO da forma do `CurationBlock`, então
 *                      é recortada por ela e nunca pinta fora.
 *  • `WineCarousel`  — lista horizontal com snap, um vinho por vez, com
 *                      profundidade (escala/rotação/deslocamento) conforme a
 *                      distância do centro.
 *
 * `progress` é normalizado em unidades de item dentro do handler de scroll
 * (offset ÷ intervalo). Cada slide só precisa comparar `index - progress`, e
 * o fundo só precisa interpolar em torno do próprio índice — nenhum dos dois
 * conhece largura ou espaçamento.
 *
 * A tinta é derivada da cor do vidro da garrafa e tem o alpha corrigido pela
 * luminância (ver `conf.ts`): sem isso um branco ou espumante clarearia o
 * bordô, em vez de apenas sugerir a tonalidade.
 */

/** Hook das medidas horizontais — a mesma conta usada pelo snap e pelo slide. */
function useMetrics() {
  const { width } = useWindowDimensions();
  const itemWidth = Math.round(width * ITEM_WIDTH_FRACTION);
  return {
    itemWidth,
    interval: itemWidth + SPACING,
    /** Recuo lateral que centraliza o primeiro e o último slide. */
    sideInset: Math.round((width - itemWidth) / 2),
  };
}

/** Cria o shared value do scroll. Fica na tela, que o passa aos dois filhos. */
export function useCarouselProgress(): CarouselProgress {
  return useSharedValue(0);
}

/** Luminância relativa (0 = preto, 1 = branco) de um hex `#RRGGBB`. */
function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Uma camada de tinta (um vinho), em crossfade com as vizinhas. */
function TintLayer({
  wine,
  index,
  progress,
  height,
}: {
  wine: Wine;
  index: number;
  progress: CarouselProgress;
  height: number;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.get(),
      [index - 1, index, index + 1],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const alpha = TINT_ALPHA * (1 - LUMINANCE_CORRECTION * luminance(wine.color));

  return (
    // Ancorada embaixo e com altura limitada: é onde a garrafa está e onde a
    // tinta realmente aparece.
    <Animated.View
      style={[
        { position: 'absolute', left: 0, right: 0, bottom: 0, height },
        style,
      ]}>
      {/* Mais forte embaixo (atrás da garrafa) e transparente no topo, onde
          ficam o título e o subtítulo da curadoria. */}
      <LinearGradient
        colors={[
          'transparent',
          rgba(wine.color, alpha * 0.45),
          rgba(wine.color, alpha),
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/**
 * Uma camada por vinho, todas montadas: com poucos rótulos isso evita
 * rasterizar um gradiente novo no meio do arrasto (o que geraria um engasgo
 * pior do que manter as camadas prontas). Em coleções grandes (~8+) vale
 * passar a montar só uma janela de índices em volta do foco.
 */
export function WineBackdrop({ wines, progress }: WineBackdropProps) {
  const { height: screenHeight } = useWindowDimensions();
  const height = Math.round(screenHeight * TINT_HEIGHT_FRACTION);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {wines.map((w, i) => (
        <TintLayer
          key={w.id}
          wine={w}
          index={i}
          progress={progress}
          height={height}
        />
      ))}
    </View>
  );
}

function WineSlide({
  wine,
  index,
  progress,
  width,
  height,
  onPress,
}: WineSlideProps) {
  const style = useAnimatedStyle(() => {
    // Distância assinada até o centro: -1 = um slide à esquerda, +1 à direita.
    const d = index - progress.get();
    const range = [-1, 0, 1];
    return {
      opacity: interpolate(
        Math.abs(d),
        [0, 1],
        [1, NEIGHBOR_OPACITY],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            Math.abs(d),
            [0, 1],
            [0, NEIGHBOR_OFFSET],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            Math.abs(d),
            [0, 1],
            [1, NEIGHBOR_SCALE],
            Extrapolation.CLAMP,
          ),
        },
        {
          rotateZ: `${interpolate(
            d,
            range,
            [-NEIGHBOR_ROTATION, 0, NEIGHBOR_ROTATION],
            Extrapolation.CLAMP,
          )}deg`,
        },
      ],
    };
  });

  // A altura vem medida do espaço real disponível (ver `WineCarousel`), não
  // de uma fração da tela: com fração a legenda era cortada em telas curtas.
  // Da altura tiro a legenda e um respiro, e o que sobra dimensiona a garrafa
  // (proporção 46×150) — a moldura fica idêntica em todos os slides.
  const frameHeight = height - CAPTION_HEIGHT;
  const bottleWidth = Math.min(
    Math.round(width * 0.5),
    Math.round(((frameHeight - FRAME_INSET) * 46) / 150),
  );

  return (
    <Animated.View
      style={[{ width, height, marginRight: SPACING }, style]}>
      <TouchableOpacityBox
        activeOpacity={0.9}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${wine.name}, ${typeAndGrape(wine)}`}
        flex={1}>
        <Box
          height={frameHeight}
          borderRadius="r18"
          borderWidth={1}
          borderColor="goldA28"
          backgroundColor="cremeA06"
          alignItems="center"
          justifyContent="center"
          overflow="hidden">
          <BottleGraphic
            width={bottleWidth}
            color={wine.color}
            capColor={capColorFor(wine)}
            initials={wine.initials}
            vintage={wine.vintage}
            premium={wine.featured}
            labelMode="full"
          />
        </Box>

        <Box alignItems="center" justifyContent="center" flex={1}>
          <Text
            variant="eyebrow"
            color="cremeA50"
            style={{ letterSpacing: 2.4 }}>
            {typeAndGrape(wine)}
          </Text>
          <Text
            color="textOnDark"
            textAlign="center"
            marginTop="s6"
            style={{
              fontFamily: fonts.serifSemiBold,
              fontSize: 23,
              lineHeight: 26,
            }}>
            {wine.name}
          </Text>
          <Text
            color="accent"
            marginTop="s4"
            style={{ fontFamily: fonts.serifRegular, fontSize: 16 }}>
            {brl(wine.price)}
          </Text>
        </Box>
      </TouchableOpacityBox>
    </Animated.View>
  );
}

export function WineCarousel({ wines, progress, onSelect }: WineCarouselProps) {
  const { itemWidth, interval, sideInset } = useMetrics();
  // Altura real disponível, medida em vez de estimada.
  const [height, setHeight] = useState(0);

  // Normaliza o offset em unidades de item já aqui: é o que permite que slides
  // e fundo raciocinem só com índices.
  const onScroll = useAnimatedScrollHandler(event => {
    progress.set(event.contentOffset.x / interval);
  });

  return (
    <View
      style={{ flex: 1 }}
      onLayout={e => setHeight(Math.round(e.nativeEvent.layout.height))}>
      {height > 0 && (
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          snapToInterval={interval}
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={{
            // O último item também precisa poder centralizar: o recuo direito
            // desconta o `marginRight` que todo slide carrega.
            paddingLeft: sideInset,
            paddingRight: sideInset - SPACING,
          }}>
          {wines.map((w, i) => (
            <WineSlide
              key={w.id}
              wine={w}
              index={i}
              progress={progress}
              width={itemWidth}
              height={height}
              onPress={() => onSelect(w.id)}
            />
          ))}
        </Animated.ScrollView>
      )}
    </View>
  );
}

export {
  type WineCarouselProps,
  type WineBackdropProps,
  type CarouselProgress,
} from './types';
