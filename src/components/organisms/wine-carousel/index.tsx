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
import { capColorFor, tipoUva } from '@utils/index';
import { brl } from '@utils/format';

import { Box, TouchableOpacityBox } from '../../Box';
import { BottleGraphic } from '../../BottleGraphic';
import { Text } from '../../Text';
import {
  ALPHA_TINTA,
  CORRECAO_LUMINANCIA,
  DESLOCAMENTO_VIZINHO,
  ESCALA_VIZINHO,
  ESPACAMENTO,
  ALTURA_LEGENDA,
  FRACAO_ALTURA_TINTA,
  FRACAO_LARGURA_ITEM,
  RESPIRO_MOLDURA,
  OPACIDADE_VIZINHO,
  ROTACAO_VIZINHO,
} from './conf';
import {
  type CarrosselVinhosProps,
  type FundoVinhosProps,
  type ProgressoCarrossel,
  type SlideVinhoProps,
} from './types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Carrossel de vinhos da curadoria + fundo que reage ao vinho em foco
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * São DOIS componentes que dividem um único `progresso` (shared value criado
 * por quem compõe a tela, ver `app/curadoria/[id].tsx`):
 *
 *  • `FundoVinhos`     — camada de tinta atrás de tudo. Uma camada por vinho,
 *                        em crossfade: a do vinho em foco vai a 1, as vizinhas
 *                        a 0. Vive DENTRO da forma do `BlocoCuradoria`, então
 *                        é recortada por ela e nunca pinta fora.
 *  • `CarrosselVinhos` — lista horizontal com snap, um vinho por vez, com
 *                        profundidade (escala/rotação/deslocamento) conforme a
 *                        distância do centro.
 *
 * `progresso` é normalizado em unidades de item dentro do handler de scroll
 * (offset ÷ intervalo). Cada slide só precisa comparar `indice - progresso`, e
 * o fundo só precisa interpolar em torno do próprio índice — nenhum dos dois
 * conhece largura ou espaçamento.
 *
 * A tinta é derivada da cor do vidro da garrafa e tem o alpha corrigido pela
 * luminância (ver `conf.ts`): sem isso um branco ou espumante clarearia o
 * bordô, em vez de apenas sugerir a tonalidade.
 */

/** Hook das medidas horizontais — a mesma conta usada pelo snap e pelo slide. */
function useMetricas() {
  const { width } = useWindowDimensions();
  const larguraItem = Math.round(width * FRACAO_LARGURA_ITEM);
  return {
    larguraItem,
    intervalo: larguraItem + ESPACAMENTO,
    /** Recuo lateral que centraliza o primeiro e o último slide. */
    recuoLateral: Math.round((width - larguraItem) / 2),
  };
}

/** Cria o shared value do scroll. Fica na tela, que o passa aos dois filhos. */
export function useProgressoCarrossel(): ProgressoCarrossel {
  return useSharedValue(0);
}

/** Luminância relativa (0 = preto, 1 = branco) de um hex `#RRGGBB`. */
function luminancia(hex: string): number {
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
function CamadaTinta({
  vinho,
  indice,
  progresso,
  altura,
}: {
  vinho: Wine;
  indice: number;
  progresso: ProgressoCarrossel;
  altura: number;
}) {
  const estilo = useAnimatedStyle(() => ({
    opacity: interpolate(
      progresso.get(),
      [indice - 1, indice, indice + 1],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const alpha = ALPHA_TINTA * (1 - CORRECAO_LUMINANCIA * luminancia(vinho.cor));

  return (
    // Ancorada embaixo e com altura limitada: é onde a garrafa está e onde a
    // tinta realmente aparece.
    <Animated.View
      style={[
        { position: 'absolute', left: 0, right: 0, bottom: 0, height: altura },
        estilo,
      ]}>
      {/* Mais forte embaixo (atrás da garrafa) e transparente no topo, onde
          ficam o título e o subtítulo da curadoria. */}
      <LinearGradient
        colors={[
          'transparent',
          rgba(vinho.cor, alpha * 0.45),
          rgba(vinho.cor, alpha),
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
export function FundoVinhos({ vinhos, progresso }: FundoVinhosProps) {
  const { height } = useWindowDimensions();
  const altura = Math.round(height * FRACAO_ALTURA_TINTA);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {vinhos.map((v, i) => (
        <CamadaTinta
          key={v.id}
          vinho={v}
          indice={i}
          progresso={progresso}
          altura={altura}
        />
      ))}
    </View>
  );
}

function SlideVinho({
  vinho,
  indice,
  progresso,
  largura,
  altura,
  onPress,
}: SlideVinhoProps) {
  const estilo = useAnimatedStyle(() => {
    // Distância assinada até o centro: -1 = um slide à esquerda, +1 à direita.
    const d = indice - progresso.get();
    const entrada = [-1, 0, 1];
    return {
      opacity: interpolate(
        Math.abs(d),
        [0, 1],
        [1, OPACIDADE_VIZINHO],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            Math.abs(d),
            [0, 1],
            [0, DESLOCAMENTO_VIZINHO],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            Math.abs(d),
            [0, 1],
            [1, ESCALA_VIZINHO],
            Extrapolation.CLAMP,
          ),
        },
        {
          rotateZ: `${interpolate(
            d,
            entrada,
            [-ROTACAO_VIZINHO, 0, ROTACAO_VIZINHO],
            Extrapolation.CLAMP,
          )}deg`,
        },
      ],
    };
  });

  // A altura vem medida do espaço real disponível (ver `CarrosselVinhos`), não
  // de uma fração da tela: com fração a legenda era cortada em telas curtas.
  // Da altura tiro a legenda e um respiro, e o que sobra dimensiona a garrafa
  // (proporção 46×150) — a moldura fica idêntica em todos os slides.
  const alturaMoldura = altura - ALTURA_LEGENDA;
  const larguraGarrafa = Math.min(
    Math.round(largura * 0.5),
    Math.round(((alturaMoldura - RESPIRO_MOLDURA) * 46) / 150),
  );

  return (
    <Animated.View
      style={[
        { width: largura, height: altura, marginRight: ESPACAMENTO },
        estilo,
      ]}>
      <TouchableOpacityBox
        activeOpacity={0.9}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${vinho.nome}, ${tipoUva(vinho)}`}
        flex={1}>
        <Box
          height={alturaMoldura}
          borderRadius="r18"
          borderWidth={1}
          borderColor="goldA28"
          backgroundColor="cremeA06"
          alignItems="center"
          justifyContent="center"
          overflow="hidden">
          <BottleGraphic
            width={larguraGarrafa}
            cor={vinho.cor}
            capColor={capColorFor(vinho)}
            iniciais={vinho.iniciais}
            safra={vinho.safra}
            premium={vinho.destaque}
            labelMode="full"
          />
        </Box>

        <Box alignItems="center" justifyContent="center" flex={1}>
          <Text
            variant="eyebrow"
            color="cremeA50"
            style={{ letterSpacing: 2.4 }}>
            {tipoUva(vinho)}
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
            {vinho.nome}
          </Text>
          <Text
            color="accent"
            marginTop="s4"
            style={{ fontFamily: fonts.serifRegular, fontSize: 16 }}>
            {brl(vinho.preco)}
          </Text>
        </Box>
      </TouchableOpacityBox>
    </Animated.View>
  );
}

export function CarrosselVinhos({
  vinhos,
  progresso,
  onSelecionar,
}: CarrosselVinhosProps) {
  const { larguraItem, intervalo, recuoLateral } = useMetricas();
  // Altura real disponível, medida em vez de estimada.
  const [altura, setAltura] = useState(0);

  // Normaliza o offset em unidades de item já aqui: é o que permite que slides
  // e fundo raciocinem só com índices.
  const aoRolar = useAnimatedScrollHandler(evento => {
    progresso.set(evento.contentOffset.x / intervalo);
  });

  return (
    <View
      style={{ flex: 1 }}
      onLayout={e => setAltura(Math.round(e.nativeEvent.layout.height))}>
      {altura > 0 && (
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={aoRolar}
          scrollEventThrottle={16}
          snapToInterval={intervalo}
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={{
            // O último item também precisa poder centralizar: o recuo direito
            // desconta o `marginRight` que todo slide carrega.
            paddingLeft: recuoLateral,
            paddingRight: recuoLateral - ESPACAMENTO,
          }}>
          {vinhos.map((v, i) => (
            <SlideVinho
              key={v.id}
              vinho={v}
              indice={i}
              progresso={progresso}
              largura={larguraItem}
              altura={altura}
              onPress={() => onSelecionar(v.id)}
            />
          ))}
        </Animated.ScrollView>
      )}
    </View>
  );
}

export {
  type CarrosselVinhosProps,
  type FundoVinhosProps,
  type ProgressoCarrossel,
} from './types';
