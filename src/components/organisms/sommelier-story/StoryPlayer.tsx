import { useCallback, useEffect, useMemo, useState } from 'react';

import { BackHandler, StyleSheet, useWindowDimensions } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Reanimated 4: `runOnJS` está deprecado em favor do `scheduleOnRN` do worklets.
import { scheduleOnRN } from 'react-native-worklets';

import { sommelierStory, storySeconds } from '@data/sommelierStories';
import { useTransitionStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { mmss } from '@utils/format';

import { Box } from '../../Box';
import { Icon } from '../../Icon';
import { PulseBar } from '../../PulseBar';
import { Text } from '../../Text';
import {
  BACK_ZONE_FRACTION,
  CHROME_FADE_START,
  CLOSE_DURATION,
  CURVE,
  DISMISS_DISTANCE,
  DISMISS_VELOCITY,
  DRAG_RADIUS,
  DRAG_RANGE_FRACTION,
  DRAG_SCALE_MIN,
  DRAG_SPRING,
  GHOST_FADE_END,
  HOLD_FADE_DURATION,
  HOLD_MIN_DURATION,
  KEN_BURNS_SCALE,
  KEN_BURNS_SHIFT,
  MODAL_EXIT_DURATION,
  OPEN_DURATION,
  SCRIM_OPACITY,
  TAP_MAX_DISTANCE,
} from './conf';
import { StoryFrame } from './StoryFrame';
import { StoryProgressBar } from './StoryProgressBar';
import { storyTransitionId, StoryDurationBadge } from './StoryPreview';
import { type SommelierStoryProps } from './types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SommelierStory — o vídeo do sommelier tocando como um story
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ── A transição (shared element "o preview virou a tela") ───────────────────
 *
 * O caminho é o mesmo do `CurationBlock`, e vale ler o cabeçalho dele: o
 * preview mede a si mesmo no toque e grava o retângulo em `useTransitionStore`;
 * a rota do story não tem animação de Stack (`animation: 'none'` em
 * `app/_layout.tsx`), então quem anima é esta peça, daquele retângulo até a
 * janela inteira. A diferença — e a razão de não ser o mesmo componente — está
 * em duas coisas:
 *
 *  1. O CONTEÚDO É O MESMO NOS DOIS ESTADOS. Na curadoria, um texto morfa de um
 *     corpo para outro; aqui o preview é uma MINIATURA EXATA do story (mesma
 *     proporção da janela, ver `PREVIEW_FRACTION`), então a imagem inteira —
 *     `StoryFrame` — é compartilhada e a transição é UMA escala uniforme de 40%
 *     a 100%. Nada reflui, nada faz crossfade.
 *  2. A rota é `transparentModal`: a tela de produto continua VIVA por baixo,
 *     apenas escurecida pelo scrim, e é isso que faz o story ler como uma peça
 *     que sai de dentro da tela em vez de uma tela nova. O efeito colateral que
 *     o `CurationBlock` documenta (no iOS, tudo que é empilhado depois de um
 *     modal também vira modal) não nos atinge: daqui não se navega para lugar
 *     nenhum — só se fecha.
 *
 * ── O "vídeo" ───────────────────────────────────────────────────────────────
 *
 * Não há arquivo de vídeo no app (o catálogo é mock). O que toca é o ROTEIRO do
 * sommelier (`sommelierStory`), trecho por trecho: cada trecho é um segmento da
 * barra, uma legenda, e um movimento lento de câmera sobre a garrafa (ver
 * `KEN_BURNS_*`). Um único shared value — `fill`, 0→1 do trecho atual — move a
 * barra e a imagem, então os dois pausam juntos. Quando um `expo-video` real
 * entrar, ele substitui a imagem de `StoryFrame` e passa a alimentar `fill`; a
 * mecânica de story em volta não muda.
 *
 * ── Controles (vocabulário de story, não de player) ─────────────────────────
 *
 *  • Tocar à direita avança um trecho; à esquerda, volta (o primeiro reinicia).
 *  • SEGURAR pausa — e o chrome sai da frente da imagem enquanto o dedo está
 *    parado, como no Instagram.
 *  • Arrastar para baixo fecha, encolhendo de volta até o preview.
 *  • O fim do último trecho fecha do mesmo jeito: story acabou, volta ao lugar.
 *
 * TODOS os toques daqui são gestos do `react-native-gesture-handler`, nunca
 * `Pressable`/`TouchableOpacity`: o arrasto leva a tela junto com o dedo, então
 * em coordenadas do filho o dedo nunca sai de cima dele, a Pressability não
 * cancela o toque e soltar dispararia duas ações. Mesma armadilha descrita em
 * `CurationBlock`.
 */
export function SommelierStory({ wine, onClose }: SommelierStoryProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const transitionId = storyTransitionId(wine.id);
  const clearSource = useTransitionStore(s => s.clearSource);
  /**
   * Snapshot lido UMA vez, na montagem: se o store mudar no meio da animação, a
   * geometria de partida não pode mudar junto.
   */
  const [source] = useState(
    () => useTransitionStore.getState().sources[transitionId],
  );

  const chapters = useMemo(() => sommelierStory(wine), [wine]);
  const duration = wine.videoDuration ?? mmss(storySeconds(chapters));

  /**
   * Trecho atual + um contador de execuções. O contador existe para o caso
   * "voltar no primeiro trecho": o índice não muda, mas o trecho tem de tocar
   * de novo — sem ele, o efeito de reprodução não reagiria.
   */
  const [cue, setCue] = useState({ index: 0, run: 0 });
  const chapter = chapters[cue.index];

  /** 0 = geometria do preview · 1 = tela cheia. */
  const progress = useSharedValue(source ? 0 : 1);
  /** Progresso do trecho atual, 0→1. É o relógio do vídeo. */
  const fill = useSharedValue(0);
  /** Direção do movimento de câmera, alternada a cada trecho. */
  const kenDir = useSharedValue(1);
  /** Chrome escondido enquanto o dedo segura (1 = visível). */
  const chromeHold = useSharedValue(1);
  /** Quanto o dedo já arrastou para baixo, em pontos. */
  const dragY = useSharedValue(0);
  /** Trava de fechamento — consultada também pelos worklets dos gestos. */
  const closing = useSharedValue(false);

  /**
   * Reprodução e gestos só são armados DEPOIS da expansão: durante ela a
   * geometria ainda está viajando, e mover a imagem no meio disso brigaria com
   * a forma.
   */
  const [armed, setArmed] = useState(false);
  const [held, setHeld] = useState(false);
  /** Espelho em estado da trava, para tirar o chrome do caminho dos toques. */
  const [exiting, setExiting] = useState(false);

  /**
   * Fecha animando de volta até o preview e só então navega. É o ÚNICO caminho
   * de saída: ×, botão físico, arrasto e fim do vídeo terminam todos aqui.
   */
  const close = useCallback(() => {
    if (closing.get()) {
      return;
    }
    closing.set(true);
    setExiting(true);
    cancelAnimation(fill);

    const dragged = dragY.get();
    if (!source) {
      // Sem preview de origem (deep link) não existe retângulo para onde
      // encolher: se o gesto já tinha deslocado a tela, ela termina de sair por
      // baixo; se não, a navegação é seca.
      if (dragged > 0) {
        dragY.set(
          withTiming(
            screenHeight,
            { duration: MODAL_EXIT_DURATION, easing: Easing.out(Easing.cubic) },
            finished => {
              if (finished) {
                scheduleOnRN(onClose);
              }
            },
          ),
        );
        return;
      }
      onClose();
      return;
    }
    // O deslocamento do arrasto se desfaz na MESMA curva e duração do
    // encolhimento: somados, os dois são um movimento só, do ponto em que o
    // dedo soltou direto até o preview.
    if (dragged !== 0) {
      dragY.set(withTiming(0, { duration: CLOSE_DURATION, easing: CURVE }));
    }
    progress.set(
      withTiming(0, { duration: CLOSE_DURATION, easing: CURVE }, finished => {
        if (finished) {
          scheduleOnRN(onClose);
        }
      }),
    );
  }, [closing, fill, dragY, source, screenHeight, onClose, progress]);

  /**
   * Vai para um trecho. Passar do último fecha o story — é o fim do vídeo, e
   * um story que acaba volta para onde nasceu.
   */
  const jump = useCallback(
    (target: number) => {
      if (closing.get()) {
        return;
      }
      if (target >= chapters.length) {
        close();
        return;
      }
      const index = Math.max(0, target);
      cancelAnimation(fill);
      fill.set(0);
      kenDir.set(index % 2 === 0 ? 1 : -1);
      setCue(current => ({ index, run: current.run + 1 }));
    },
    [chapters.length, close, closing, fill, kenDir],
  );

  /** Zonas de toque do story: um terço à esquerda volta, o resto avança. */
  const handleTap = useCallback(
    (x: number) => {
      jump(x < screenWidth * BACK_ZONE_FRACTION ? cue.index - 1 : cue.index + 1);
    },
    [cue.index, jump, screenWidth],
  );

  // ── Reprodução ────────────────────────────────────────────────────────────
  // Um efeito só: começa/retoma o trecho quando pode tocar, e cancela quando
  // não pode (dedo segurando, saída em curso, expansão ainda rolando). Como
  // `fill` guarda onde parou, retomar é seguir do mesmo ponto — o que sobra de
  // duração é `(1 - fill) × segundos`.
  useEffect(() => {
    if (!armed || held || exiting) {
      cancelAnimation(fill);
      return;
    }
    const remaining = (1 - fill.get()) * chapter.seconds * 1000;
    fill.set(
      withTiming(
        1,
        { duration: remaining, easing: Easing.linear },
        finished => {
          if (finished) {
            scheduleOnRN(jump, cue.index + 1);
          }
        },
      ),
    );
    return () => cancelAnimation(fill);
  }, [armed, held, exiting, cue, chapter.seconds, fill, jump]);

  // Chrome sai da frente da imagem enquanto o dedo segura.
  useEffect(() => {
    chromeHold.set(
      withTiming(held ? 0 : 1, { duration: HOLD_FADE_DURATION }),
    );
  }, [held, chromeHold]);

  // Expansão. Começa no frame SEGUINTE: montar a tela consome o primeiro, e sem
  // esse respiro os ~100ms iniciais não chegam a ser desenhados.
  useEffect(() => {
    if (!source) {
      const frame = requestAnimationFrame(() => setArmed(true));
      return () => cancelAnimationFrame(frame);
    }
    const frame = requestAnimationFrame(() => {
      progress.set(
        withTiming(1, { duration: OPEN_DURATION, easing: CURVE }, finished => {
          if (finished) {
            scheduleOnRN(setArmed, true);
          }
        }),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [source, progress]);

  // A origem serve para uma viagem só: limpa ao desmontar, para que uma entrada
  // futura sem preview (deep link) não anime a partir de lixo.
  useEffect(() => () => clearSource(transitionId), [clearSource, transitionId]);

  // Botão físico do Android: a mesma saída do ×.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [close]);

  // ── Gestos ────────────────────────────────────────────────────────────────

  const gesture = useMemo(() => {
    const drag = Gesture.Pan()
      .enabled(armed)
      .activeOffsetY(14)
      .failOffsetX([-14, 14])
      .onUpdate(event => {
        if (closing.get()) {
          return;
        }
        // Só para baixo: puxar para cima não estica a tela.
        dragY.set(Math.max(0, event.translationY));
      })
      .onEnd((event, success) => {
        if (closing.get()) {
          return;
        }
        const dismiss =
          success &&
          (event.translationY > DISMISS_DISTANCE ||
            event.velocityY > DISMISS_VELOCITY);
        if (dismiss) {
          scheduleOnRN(close);
          return;
        }
        dragY.set(withSpring(0, DRAG_SPRING));
      });

    // Segurar pausa. `onFinalize` (e não `onEnd`) para retomar também quando o
    // sistema cancela o gesto — um alerta no meio do vídeo deixaria o story
    // pausado para sempre.
    const hold = Gesture.LongPress()
      .enabled(armed)
      .minDuration(HOLD_MIN_DURATION)
      .maxDistance(screenWidth)
      .onStart(() => {
        scheduleOnRN(setHeld, true);
      })
      .onFinalize(() => {
        scheduleOnRN(setHeld, false);
      });

    const tap = Gesture.Tap()
      .enabled(armed)
      .maxDuration(HOLD_MIN_DURATION)
      .maxDistance(TAP_MAX_DISTANCE)
      .onEnd((event, success) => {
        if (success) {
          scheduleOnRN(handleTap, event.x);
        }
      });

    // `Simultaneous` com o arrasto de propósito: arrastar para baixo dura mais
    // que `HOLD_MIN_DURATION`, então o vídeo pausa enquanto o dedo carrega a
    // tela — que é o que se espera de um story sendo puxado.
    return Gesture.Simultaneous(drag, Gesture.Exclusive(hold, tap));
  }, [armed, closing, dragY, close, screenWidth, handleTap]);

  // ── Estilos ───────────────────────────────────────────────────────────────

  /**
   * A FORMA: parte do retângulo do preview e cresce até a janela. Posição é
   * `translate` (transform não dispara layout); `width`/`height` animam porque
   * a forma precisa mudar de tamanho, mas ela é o ÚNICO nó que relayouta por
   * frame — o que está dentro só recebe transform.
   */
  const shapeStyle = useAnimatedStyle(() => {
    const dragRadius = interpolate(
      dragY.get(),
      [0, 140],
      [0, DRAG_RADIUS],
      Extrapolation.CLAMP,
    );
    if (!source) {
      return { borderRadius: dragRadius };
    }
    const p = progress.get();
    return {
      width: interpolate(p, [0, 1], [source.width, screenWidth]),
      height: interpolate(p, [0, 1], [source.height, screenHeight]),
      borderRadius: Math.max(
        interpolate(p, [0, 1], [source.radius, 0]),
        dragRadius,
      ),
      transform: [
        { translateX: interpolate(p, [0, 1], [source.x, 0]) },
        { translateY: interpolate(p, [0, 1], [source.y, 0]) },
      ],
    };
  });

  /**
   * A IMAGEM dentro da forma. Tamanho FIXO (a janela inteira) e ancorada no
   * canto superior esquerdo, escalada de `source.width / screenWidth` até 1 —
   * como o preview tem a proporção da janela, essa única escala uniforme faz o
   * quadro caber exatamente nele no frame 0. Não é remedida em nenhum frame: a
   * forma apenas abre uma janela maior sobre ela.
   */
  const frameStyle = useAnimatedStyle(() => {
    if (!source) {
      return {};
    }
    return {
      transform: [
        {
          scale: interpolate(
            progress.get(),
            [0, 1],
            [source.width / screenWidth, 1],
          ),
        },
      ],
    };
  });

  /** Movimento de câmera do trecho: sempre aproxima, alternando a deriva. */
  const figureStyle = useAnimatedStyle(() => {
    const f = fill.get();
    return {
      transform: [
        { scale: 1 + f * KEN_BURNS_SCALE },
        { translateY: -kenDir.get() * f * KEN_BURNS_SHIFT },
      ],
    };
  });

  /** O arrasto move a peça inteira, num nó só acima de todos. */
  const dragStyle = useAnimatedStyle(() => {
    const y = dragY.get();
    const k = Math.min(y / (screenHeight * DRAG_RANGE_FRACTION), 1);
    return {
      transform: [
        { translateY: y },
        { scale: interpolate(k, [0, 1], [1, DRAG_SCALE_MIN]) },
      ],
    };
  });

  /** Scrim sobre a tela de produto. Fora do nó do arrasto: não acompanha o dedo. */
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.get(),
      [0, 1],
      [0, SCRIM_OPACITY],
      Extrapolation.CLAMP,
    ),
  }));

  /**
   * Chrome do topo (barra + identificação): entra em fade já na geometria
   * final, depois de a forma ter feito metade do caminho, e desaparece enquanto
   * o dedo segura.
   */
  const chromeStyle = useAnimatedStyle(() => {
    const fade = source
      ? interpolate(
          progress.get(),
          [CHROME_FADE_START, 1],
          [0, 1],
          Extrapolation.CLAMP,
        )
      : 1;
    return { opacity: fade * chromeHold.get() };
  });

  /** Mesma curva da legenda — em hook próprio: um estilo animado não pode ser
      reaproveitado em dois componentes. */
  const captionStyle = useAnimatedStyle(() => {
    const fade = source
      ? interpolate(
          progress.get(),
          [CHROME_FADE_START, 1],
          [0, 1],
          Extrapolation.CLAMP,
        )
      : 1;
    return { opacity: fade * chromeHold.get() };
  });

  /**
   * Cópia da etiqueta de duração do preview, ancorada onde ela estava (em
   * coordenadas da forma) e saindo em fade no início da expansão.
   */
  const ghostStyle = useAnimatedStyle(() => {
    if (!source?.button) {
      return { opacity: 0 };
    }
    return {
      opacity: interpolate(
        progress.get(),
        [0, GHOST_FADE_END],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    };
  });

  const closeGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(TAP_MAX_DISTANCE)
        .onEnd((_, success) => {
          if (success) {
            scheduleOnRN(close);
          }
        }),
    [close],
  );

  return (
    <Box flex={1}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: palette.black },
          scrimStyle,
        ]}
      />

      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ flex: 1 }, dragStyle]}>
          {/* ── FORMA: o preview crescendo ─────────────────────────────── */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                top: 0,
                width: screenWidth,
                height: screenHeight,
                overflow: 'hidden',
              },
              shapeStyle,
            ]}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transformOrigin: 'top left',
                },
                frameStyle,
              ]}>
              <StoryFrame
                wine={wine}
                width={screenWidth}
                height={screenHeight}
                scale={1}
                figureStyle={figureStyle}
              />
            </Animated.View>

            {source?.button && (
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: 'absolute',
                    left: source.button.x - source.x,
                    top: source.button.y - source.y,
                  },
                  ghostStyle,
                ]}>
                <StoryDurationBadge duration={duration} />
              </Animated.View>
            )}
          </Animated.View>

          {/* ── CHROME: barra + nome do produto ────────────────────────── */}
          <Animated.View
            pointerEvents={exiting ? 'none' : 'box-none'}
            style={[
              {
                paddingTop: insets.top + 10,
                paddingHorizontal: 16,
              },
              chromeStyle,
            ]}>
            <StoryProgressBar
              chapters={chapters}
              index={cue.index}
              fill={fill}
            />

            <Box
              flexDirection="row"
              alignItems="center"
              marginTop="s14"
              style={{ gap: 10 }}>
              {/* Selo do rótulo: a cor do vidro com as iniciais, o mesmo
                  vocabulário do rótulo desenhado na garrafa. */}
              <Box
                width={34}
                height={34}
                borderRadius="rFull"
                borderWidth={1}
                borderColor="goldA55"
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: wine.color }}>
                <Text
                  color="textOnDark"
                  style={{ fontFamily: fonts.serifSemiBold, fontSize: 12 }}>
                  {wine.initials}
                </Text>
              </Box>

              <Box flex={1}>
                <Text
                  color="textOnDark"
                  style={{ fontFamily: fonts.serifSemiBold, fontSize: 19 }}>
                  {wine.name}
                </Text>
                <Text
                  variant="label"
                  fontSize={7.5}
                  color="cremeA62"
                  marginTop="s2"
                  style={{ letterSpacing: 1.4 }}>
                  Sommelier · Safra {wine.vintage} · {duration}
                </Text>
              </Box>

              {/* Equalizador: o sinal de que há ÁUDIO correndo — é o que
                  diferencia um story tocando de uma foto com barra em cima. */}
              <Box
                flexDirection="row"
                alignItems="flex-end"
                marginRight="s10"
                style={{ gap: 3, height: 14 }}>
                {[9, 14, 6].map((height, i) => (
                  <PulseBar
                    key={i}
                    height={height}
                    delay={i * 130}
                    duration={760 + i * 90}
                  />
                ))}
              </Box>

              <GestureDetector gesture={closeGesture}>
                <Box
                  width={32}
                  height={32}
                  alignItems="center"
                  justifyContent="center"
                  accessibilityRole="button"
                  accessibilityLabel="Fechar story">
                  <Icon name="close" size={18} color={palette.creme} />
                </Box>
              </GestureDetector>
            </Box>
          </Animated.View>

          {/* ── LEGENDA do trecho ──────────────────────────────────────── */}
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: insets.bottom + 26,
                paddingHorizontal: 26,
              },
              captionStyle,
            ]}>
            {/* `key` no trecho: cada legenda ENTRA, em vez de o texto mudar no
                lugar — é o corte de uma cena para a outra. */}
            <Animated.View key={cue.index} entering={FadeIn.duration(320)}>
              <Text variant="eyebrow" style={{ letterSpacing: 3 }}>
                {chapter.cue}
              </Text>
              <Text
                color="textOnDark"
                marginTop="s10"
                style={{
                  fontFamily: fonts.serifItalic,
                  fontSize: 24,
                  lineHeight: 32,
                }}>
                {chapter.caption}
              </Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Box>
  );
}
