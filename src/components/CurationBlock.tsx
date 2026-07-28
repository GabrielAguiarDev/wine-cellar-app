import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  BackHandler,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Reanimated 4: `runOnJS` está deprecado em favor do `scheduleOnRN` do worklets.
import { scheduleOnRN } from 'react-native-worklets';

import { useTransitionStore } from '@store/index';
import { fonts, palette } from '@theme/index';

import { Box, TouchableOpacityBox } from './Box';
import { Button } from './Button';
import { ScreenHeader } from './ScreenHeader';
import { Text } from './Text';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CurationBlock — a MESMA peça visual em dois estados, ligados por transição
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `variant="card"`        → bloco no fluxo da Home (cantos arredondados).
 * `variant="fullscreen"`  → mesma peça ocupando 100% da tela, servindo de
 *                           camada de fundo da tela de destino.
 *
 * ── Como a transição funciona (shared element "entrar dentro") ──────────────
 *
 *  1. CARD: ao tocar, mede a própria FORMA (`measureInWindow`) e grava o
 *     retângulo em `useTransitionStore` sob a chave `transitionId`. Só depois
 *     dispara a navegação — a medida precisa existir antes. Vale para o toque
 *     no bloco E no CTA: os dois passam por `openWithMeasure`. Uma saída que
 *     chame a navegação direto não deixa origem e o destino aparece de salto.
 *  2. ROTA: `/curation/[id]` é um push NORMAL (`card`) com `animation: 'none'`
 *     e `contentStyle` no creme da Home (ver `app/_layout.tsx`). A Stack não
 *     anima — quem anima é este componente —, e o entorno da forma enquanto ela
 *     cresce é a cor de fundo da Home, então a cor não salta.
 *     NÃO usar `transparentModal` aqui: mostrava a Home viva por baixo, mas no
 *     iOS toda tela empilhada depois de um modal também vira modal, e a tela de
 *     produto aberta da coleção subia de baixo com cara de sheet.
 *  3. TELA CHEIA: lê o retângulo de origem e anima a FORMA de lá até
 *     (0, 0, largura, altura) da janela, com o `borderRadius` indo a 0. Como
 *     ela nasce exatamente sobre o card, a leitura é de o card crescendo.
 *  4. TEXTO: é UM bloco só, que sai da posição/escala do texto do card e
 *     chega na do destino (`textMorphStyle`). Não há crossfade entre dois
 *     textos: com dois blocos em posições e corpos diferentes, o olho percebe
 *     que são textos distintos trocando de lugar. Para o morph funcionar, as
 *     medidas da tela cheia são as do card × `FULLSCREEN_SCALE` — o mesmo
 *     fator em corpo, entrelinha, tracking e largura máxima —, o que mantém as
 *     quebras de linha idênticas do começo ao fim.
 *     O CTA é o único elemento sem par no destino: ele não morfa, acompanha a
 *     forma e sai em fade nos primeiros 28% (sem isso desapareceria de um
 *     frame para o outro, quando a forma opaca nasce por cima do card).
 *     O resto (voltar, contagem, carrossel) entra em fade a partir de 45%, já
 *     em geometria final.
 *  5. VOLTAR: o caminho inverso (encolhe até o card) e só então `onBack()`
 *     executa a navegação. Vale para o header e para o botão físico do
 *     Android; o gesto de swipe da Stack fica desabilitado na rota para não
 *     escapar desse controle.
 *
 * Sem origem medida (deep link, reload), o destino aparece direto em tela
 * cheia, sem animação.
 *
 * ── Custo por frame (o que mantém isso fluido em aparelho fraco) ────────────
 *
 * A regra é: durante a transição, o ÚNICO nó que muda de layout é a forma.
 *  • Posição é `translate`, nunca `left`/`top` — mover por layout obrigaria a
 *    remedir a subárvore (no fantasma, isso significava remedir o texto a
 *    cada frame).
 *  • `width`/`height` continuam animando porque a forma precisa mudar de
 *    tamanho; em troca ela carrega só o gradiente de fundo. O gradiente é
 *    esticado junto de propósito: gradiente linear é invariante à escala, e é
 *    isso que faz o frame 0 bater exatamente com o card.
 *  • O que é pesado (garrafas, camadas de tinta) NÃO monta durante a
 *    transição: quem consome monta ao receber `onOpenComplete`. Criar
 *    dezenas de views no meio do movimento custava ~55ms de thread JS travada
 *    já no simulador — em aparelho fraco, frames perdidos logo na largada.
 *  • `extraBackground` fica com tamanho FIXO dentro da forma, então não é
 *    remedido nem re-rasterizado a cada frame; a forma só abre uma janela
 *    sobre ele.
 *  • Scrim, fantasma e conteúdo animam apenas `opacity`/`transform`.
 *
 * ── Anatomia (não achatar estas duas camadas) ───────────────────────────────
 *
 *   <container>                       posicionamento/tamanho do conjunto
 *     ├── <FORMA>                     ← o shared element
 *     │      cor de fundo (gradiente), borderRadius, tamanho. NADA de texto.
 *     │      `nativeID`/`testID` = transitionId; `collapsable={false}` porque
 *     │      o Android achata Views sem conteúdo próprio e o measure quebra.
 *     └── <CONTEÚDO>                  ← irmão da forma, NÃO filho
 *            eyebrow, título, subtítulo, botão, children — numa única View
 *            com `opacity` própria, para animar independente da forma.
 *
 * ── Status bar & tab bar em `fullscreen` (comportamento DECIDIDO) ───────────
 *
 *  • STATUS BAR: `style="light"` (ícones claros) — o fundo bordô é escuro.
 *    Trocada no MOMENTO DA MONTAGEM da tela de destino, ou seja no início da
 *    transição, não no fim: com ícones escuros o meio do caminho fica
 *    ilegível sobre o bordô. Continua VISÍVEL (nunca `hidden`): o bloco é
 *    full bleed e desenha por baixo dela; o conteúdo respeita `insets.top`.
 *  • TAB BAR: ESCONDIDA. A tela de destino vive fora do grupo `app/(tabs)/`
 *    (push da Stack raiz), então:
 *      – iOS: as Native Tabs não existem nessa rota; o modal cobre a barra.
 *      – Android: a `TabBar` custom é um overlay do root layout que só aparece
 *        nas 5 rotas de aba (`VISIBLE_ON` em `src/components/TabBar.tsx`) —
 *        `/curation/...` não está lá, então some sozinha.
 *    A tab bar NÃO deve reaparecer por cima do bloco em tela cheia.
 *  • O padding inferior da tela de destino NÃO usa `s108` (reservado p/ tab
 *    bar); usa o inset de home indicator, já aplicado aqui.
 */

export type BlockVariant = 'card' | 'fullscreen';

/** Conteúdo textual — vem de props/dados, nunca hardcoded no componente. */
export type CurationContent = {
  /** Linha dourada pequena acima do título. Ex.: "Curadoria da semana". */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /**
   * Label do CTA. Sem label, o botão não é renderizado.
   *
   * Em `fullscreen` o destino NÃO mostra CTA: passe o mesmo label do card e ele
   * será usado só para o botão fantasma da transição (o CTA é o único elemento
   * do card sem par no destino, então precisa sair em fade em vez de sumir).
   */
  buttonLabel?: string;
};

export type CurationBlockProps = CurationContent & {
  /**
   * Gancho estável do shared element. Precisa ser o MESMO valor no card e na
   * tela cheia — é a chave que casa origem e destino em `useTransitionStore`.
   * Ex.: "weekly-curation".
   */
  transitionId: string;
  variant?: BlockVariant;
  /**
   * Cores do fundo (gradiente). 1 cor = fundo sólido. É a única fonte da cor
   * bordô: o card e a tela cheia devem receber exatamente o mesmo array, ou a
   * transição "pisca" de cor no meio.
   */
  colors?: readonly string[];
  /** Toque no bloco inteiro (modo card = abrir a tela de destino). */
  onPress?: () => void;
  /** Toque no CTA. No card, cai para `onPress` se não informado. */
  onPressButton?: () => void;
  /**
   * Voltar (modo tela cheia). É chamado DEPOIS da animação de fechamento —
   * passe só a navegação (`router.back()`), sem lógica de animação.
   */
  onBack?: () => void;
  /**
   * Altura fixa do card. Opcional: sem ela a altura é definida pelo conteúdo
   * (que também é estável, e é medida em tempo de toque de qualquer forma).
   */
  cardHeight?: number;
  /**
   * Trava manual da camada de conteúdo (multiplica a opacidade da animação).
   * Útil para esconder o conteúdo sem mexer na forma.
   */
  contentVisible?: boolean;
  /**
   * Ref externa da FORMA no modo card, caso quem usa precise medi-la também.
   * Por padrão o componente usa uma ref interna (é ela que alimenta o
   * `measureInWindow` da transição).
   */
  shapeRef?: RefObject<View | null>;
  /**
   * Chamado uma vez, quando a animação de abertura termina (ou já na montagem
   * quando não há transição). É o gancho para montar conteúdo PESADO só depois
   * da transição: criar dezenas de views no meio da animação derruba frames,
   * sobretudo em aparelho fraco. Ver `app/curation/[id].tsx`.
   */
  onOpenComplete?: () => void;
  /**
   * Camada de fundo EXTRA (só `fullscreen`): entra dentro da forma, portanto é
   * recortada por ela e nunca pinta fora do bloco durante a transição. Use
   * para tintas/gradientes que reagem ao conteúdo — ex.: o `WineBackdrop` do
   * carrossel da curadoria. Aparece junto com o conteúdo, não com a forma.
   */
  extraBackground?: ReactNode;
  /** Resto da tela de destino (listas etc.). Só faz sentido em `fullscreen`. */
  children?: ReactNode;
};

const DEFAULT_COLORS = [
  palette.wineLight,
  palette.wine,
  palette.wineDeeper,
] as const;

/** Gradiente do design: diagonal do canto superior direito p/ inferior esquerdo. */
const GRADIENT_START = { x: 0.8, y: 0 };
const GRADIENT_END = { x: 0.2, y: 1 };

/** Raio do card (r16 do tema) — vira 0 em tela cheia. */
const CARD_RADIUS = 16;

/** Padding horizontal do conteúdo no card. */
const CARD_PADDING = 26;

/**
 * Padding horizontal do conteúdo em tela cheia. Exportado porque um filho que
 * precise sangrar até as bordas (ex.: o carrossel da curadoria, cujo recuo
 * lateral é o que centraliza os slides) tem de anular exatamente este valor.
 */
export const FULLSCREEN_PADDING = 24;

export const OPEN_DURATION = 560;
export const CLOSE_DURATION = 420;

/**
 * Curva "emphasized": sai devagar, acelera no meio e desacelera no fim.
 * Um `Easing.out` aqui resolvia 70% do trajeto nos primeiros 150ms e a
 * transição era lida como um salto — o card já tem ~89% da largura da tela,
 * então só o crescimento vertical é perceptível e ele precisa de tempo.
 */
const CURVE = Easing.bezier(0.4, 0, 0.2, 1);

/** A partir de que ponto da expansão o conteúdo de destino começa a aparecer. */
const CONTENT_FADE_START = 0.45;

/** Até que ponto o CTA fantasma (elemento sem par no destino) fica visível. */
const GHOST_FADE_END = 0.28;

/**
 * Quanto o bloco de texto cresce do card para a tela cheia.
 *
 * TODAS as medidas do texto (corpo, entrelinha, tracking e largura máxima)
 * são derivadas das medidas do card por este fator único. É o que garante que
 * as linhas quebrem exatamente nos mesmos pontos nos dois estados — e é o que
 * permite morfar UM bloco só, em vez de fazer crossfade entre dois. Com
 * fatores diferentes por elemento, o texto reflui no meio do caminho e o olho
 * percebe que são dois blocos distintos.
 */
const FULLSCREEN_SCALE = 1.3;

/** Medidas base do texto (as do card). A tela cheia é isto × FULLSCREEN_SCALE. */
const BASE_TEXT = {
  eyebrowSize: 9,
  eyebrowTracking: 3,
  eyebrowMargin: 12,
  titleSize: 31,
  titleLineHeight: 34,
  titleWidth: 230,
  subSize: 12,
  subLineHeight: 18,
  subWidth: 210,
  subMargin: 12,
} as const;

type Measurement = { x: number; y: number; width: number; height: number };

/** `measureInWindow` como promise, para medir vários nós antes de navegar. */
function measureNode(node: View | null): Promise<Measurement | undefined> {
  return new Promise(resolve => {
    if (!node) {
      resolve(undefined);
      return;
    }
    node.measureInWindow((x, y, width, height) =>
      resolve({ x, y, width, height }),
    );
  });
}

export function CurationBlock({
  transitionId,
  variant = 'card',
  eyebrow,
  title,
  subtitle,
  buttonLabel,
  colors = DEFAULT_COLORS,
  onPress,
  onPressButton,
  onBack,
  cardHeight,
  contentVisible = true,
  shapeRef,
  onOpenComplete,
  extraBackground,
  children,
}: CurationBlockProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const fullscreen = variant === 'fullscreen';

  const setSource = useTransitionStore(s => s.setSource);
  const clearSource = useTransitionStore(s => s.clearSource);
  const requestReentry = useTransitionStore(s => s.requestReentry);
  /**
   * Snapshot lido UMA vez, na montagem do destino: se o store mudar no meio
   * da animação, a geometria de partida não pode mudar junto.
   */
  const [source] = useState(() =>
    fullscreen ? useTransitionStore.getState().sources[transitionId] : undefined,
  );

  const internalRef = useRef<View | null>(null);
  const resolvedShapeRef = shapeRef ?? internalRef;
  /** Nós do card que o destino precisa localizar para morfar/desaparecer. */
  const textRef = useRef<View | null>(null);
  const buttonRef = useRef<View | null>(null);
  /** Posição de layout do bloco de texto no destino (origem do morph). */
  const textPos = useSharedValue({ x: 0, y: 0 });

  /** 0 = geometria do card (origem) · 1 = tela cheia. */
  const progress = useSharedValue(fullscreen && !source ? 1 : 0);
  /** Evita disparar dois fechamentos (header + botão físico). */
  const closing = useRef(false);

  /**
   * Fecha animando de volta até o card e só então navega.
   * Declarado antes dos efeitos de propósito: a regra `react-hooks/immutability`
   * não aceita mutar um valor depois de ele já ter sido usado por um efeito.
   */
  const close = useCallback(() => {
    if (!onBack || closing.current) {
      return;
    }
    closing.current = true;
    if (!source) {
      onBack();
      return;
    }
    // `.set()` em vez de `.value =`: é a API do reanimated 4 compatível com
    // as regras de imutabilidade do React Compiler.
    progress.set(
      withTiming(0, { duration: CLOSE_DURATION, easing: CURVE }, finished => {
        if (finished) {
          scheduleOnRN(onBack);
        }
      }),
    );
  }, [onBack, source, progress]);

  /**
   * Card: mede a forma e grava a origem ANTES de deixar a navegação rolar.
   *
   * TODA saída do card para a tela cheia tem que passar por aqui — tocar no
   * bloco E tocar no CTA. Se o botão chamar a navegação direto, não existe
   * retângulo de origem e o destino aparece de salto, sem animação.
   *
   * Aqui também fica armado o pedido de reentrada em fade da tela de origem:
   * como a rota de destino não tem animação de Stack, ela também não tem
   * animação de pop, e sem isso tudo o que está ao redor do card reapareceria
   * seco na volta. Ver `FadeReentry`.
   */
  const openWithMeasure = useCallback(
    (action?: () => void) => {
      if (!action) {
        return;
      }
      requestReentry(transitionId);
      const node = resolvedShapeRef.current;
      if (!node) {
        action();
        return;
      }
      // Mede forma, bloco de texto e CTA de uma vez: os três viram âncoras da
      // transição, e todas precisam existir antes de a navegação acontecer.
      Promise.all([
        measureNode(node),
        measureNode(textRef.current),
        measureNode(buttonRef.current),
      ]).then(([shape, text, button]) => {
        if (shape && shape.width > 0 && shape.height > 0) {
          setSource(transitionId, {
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            radius: CARD_RADIUS,
            text: text && { x: text.x, y: text.y },
            button: button && { x: button.x, y: button.y },
          });
        }
        action();
      });
    },
    [resolvedShapeRef, setSource, requestReentry, transitionId],
  );

  // Abertura: só no destino e só quando há um retângulo de origem medido.
  useEffect(() => {
    if (!fullscreen) {
      return;
    }
    if (!source) {
      // Sem transição (deep link): libera o conteúdo pesado de imediato.
      onOpenComplete?.();
      return;
    }
    // Começa no frame SEGUINTE: montar o destino consome o primeiro frame, e
    // sem esse respiro os ~100ms iniciais da animação não chegam a ser
    // desenhados — de novo com cara de salto.
    const frame = requestAnimationFrame(() => {
      progress.set(
        withTiming(1, { duration: OPEN_DURATION, easing: CURVE }, finished => {
          if (finished && onOpenComplete) {
            scheduleOnRN(onOpenComplete);
          }
        }),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [fullscreen, source, progress, onOpenComplete]);

  // A origem serve para uma viagem só: limpa ao desmontar o destino para que
  // uma entrada futura sem card (deep link) não anime a partir de lixo.
  useEffect(() => {
    if (!fullscreen) {
      return;
    }
    return () => clearSource(transitionId);
  }, [fullscreen, transitionId, clearSource]);

  // Botão físico do Android: mesma animação de fechamento do header.
  useEffect(() => {
    if (!fullscreen || !onBack) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [fullscreen, onBack, close]);

  /**
   * Geometria da forma. `translate` em vez de `left`/`top`: transform não
   * dispara layout. `width`/`height` continuam animando porque a forma PRECISA
   * mudar de tamanho — mas ela é o único nó que relayouta por frame, e o
   * gradiente de dentro reproduz o do card justamente por ser esticado junto
   * (gradiente linear é invariante à escala).
   */
  const shapeStyle = useAnimatedStyle(() => {
    if (!source) {
      return {};
    }
    const p = progress.get();
    return {
      width: interpolate(p, [0, 1], [source.width, screenWidth]),
      height: interpolate(p, [0, 1], [source.height, screenHeight]),
      borderRadius: interpolate(p, [0, 1], [source.radius, 0]),
      transform: [
        { translateX: interpolate(p, [0, 1], [source.x, 0]) },
        { translateY: interpolate(p, [0, 1], [source.y, 0]) },
      ],
    };
  });

  /**
   * MORPH DO TEXTO: um único bloco que sai da posição/escala do texto do card e
   * chega na posição/escala do destino. Nada de crossfade entre dois textos —
   * era isso que deixava perceptível que eram blocos diferentes.
   *
   * A escala inicial é exatamente 1/FULLSCREEN_SCALE, então no frame 0 o bloco
   * renderiza com as medidas do card (mesmo corpo, mesma quebra de linha). O
   * `transformOrigin: 'top left'` faz a escala acontecer a partir do canto que
   * estamos ancorando.
   */
  const textMorphStyle = useAnimatedStyle(() => {
    if (!source?.text) {
      return {};
    }
    const p = progress.get();
    const target = textPos.get();
    const scale = interpolate(p, [0, 1], [1 / FULLSCREEN_SCALE, 1]);
    return {
      transform: [
        { translateX: interpolate(p, [0, 1], [source.text.x - target.x, 0]) },
        { translateY: interpolate(p, [0, 1], [source.text.y - target.y, 0]) },
        { scale },
      ],
    };
  });

  /**
   * O CTA do card é o único elemento sem par no destino: ele não morfa, só
   * acompanha o movimento da forma e sai em fade no início. Sem isso ele
   * desapareceria de um frame para o outro assim que a forma opaca nascesse
   * por cima do card.
   */
  const ghostButtonStyle = useAnimatedStyle(() => {
    if (!source?.button) {
      return { opacity: 0 };
    }
    const p = progress.get();
    return {
      opacity: interpolate(p, [0, GHOST_FADE_END], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: source.button.x - source.x * p },
        { translateY: source.button.y - source.y * p },
      ],
    };
  });

  /**
   * Fade do conteúdo que NÃO morfa (voltar, contagem, carrossel): esse sim
   * entra depois, já em geometria final.
   */
  const secondaryStyle = useAnimatedStyle(() => {
    if (!source) {
      return { opacity: contentVisible ? 1 : 0 };
    }
    const fade = interpolate(
      progress.get(),
      [CONTENT_FADE_START, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: contentVisible ? fade : 0 };
  });

  /**
   * Mesma curva de opacidade do conteúdo, mas em seu próprio hook: o reanimated
   * não permite reaproveitar um estilo animado em mais de um componente.
   */
  const extraBackgroundStyle = useAnimatedStyle(() => {
    if (!source) {
      return { opacity: contentVisible ? 1 : 0 };
    }
    const fade = interpolate(
      progress.get(),
      [CONTENT_FADE_START, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: contentVisible ? fade : 0 };
  });

  // LinearGradient exige >= 2 cores; 1 cor vira fundo sólido.
  const gradient = (colors.length >= 2
    ? colors
    : [colors[0], colors[0]]) as unknown as [string, string, ...string[]];

  /* ── FORMA ────────────────────────────────────────────────────────────────
     Só aparência/geometria. No card ela apenas preenche o container; na tela
     cheia é ela que viaja do retângulo do card até a janela inteira. */
  const background = (
    <LinearGradient
      colors={gradient}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={StyleSheet.absoluteFill}
    />
  );

  // Props comuns às duas variantes da forma. `nativeID` é o gancho legível
  // pelo DOM no web; `collapsable={false}` impede o Android de achatar a View
  // (sem isso o `measureInWindow` do card falha).
  const shapeProps = {
    nativeID: transitionId,
    testID: transitionId,
    collapsable: false,
  };

  const shape = fullscreen ? (
    <Animated.View
      {...shapeProps}
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: screenWidth,
          height: screenHeight,
          borderRadius: 0,
          overflow: 'hidden',
        },
        shapeStyle,
      ]}>
      {background}
      {extraBackground && (
        // Tamanho FIXO (tela cheia), não `absoluteFill`: assim a camada não é
        // remedida nem re-rasterizada quando a forma muda de tamanho — ela
        // apenas aparece pela "janela" que a forma abre (daí o overflow hidden).
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', left: 0, top: 0 },
            { width: screenWidth, height: screenHeight },
            extraBackgroundStyle,
          ]}>
          {extraBackground}
        </Animated.View>
      )}
    </Animated.View>
  ) : (
    // No card é uma View comum: nada anima aqui, e o ref precisa ser o do
    // host nativo para o `measureInWindow` funcionar sem intermediários.
    <View
      {...shapeProps}
      ref={resolvedShapeRef}
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: CARD_RADIUS, overflow: 'hidden' },
      ]}>
      {background}
    </View>
  );

  /* ── CONTEÚDO ─────────────────────────────────────────────────────────────
     Irmão da forma (não filho) e com opacity própria: entra/sai em fade já na
     geometria final, sem ser esticado enquanto a forma cresce. */

  /**
   * Bloco de texto numa escala `k`. Todas as medidas saem de `BASE_TEXT × k`,
   * então k=1 dá exatamente o card e k=FULLSCREEN_SCALE dá exatamente a tela
   * cheia — com as mesmas quebras de linha. O CTA fica fora daqui de propósito:
   * ele existe só no card.
   */
  const texts = (k: number) => (
    <>
      {eyebrow && (
        <Text
          color="accent"
          style={{
            fontFamily: fonts.sansRegular,
            fontSize: BASE_TEXT.eyebrowSize * k,
            letterSpacing: BASE_TEXT.eyebrowTracking * k,
            textTransform: 'uppercase',
            marginBottom: BASE_TEXT.eyebrowMargin * k,
          }}>
          {eyebrow}
        </Text>
      )}

      <Text
        color="textOnDark"
        style={{
          fontFamily: fonts.serifMedium,
          fontSize: BASE_TEXT.titleSize * k,
          lineHeight: BASE_TEXT.titleLineHeight * k,
          maxWidth: BASE_TEXT.titleWidth * k,
        }}>
        {title}
      </Text>

      {subtitle && (
        <Text
          color="cremeA62"
          style={{
            fontFamily: fonts.sansRegular,
            fontSize: BASE_TEXT.subSize * k,
            lineHeight: BASE_TEXT.subLineHeight * k,
            maxWidth: BASE_TEXT.subWidth * k,
            marginTop: BASE_TEXT.subMargin * k,
          }}>
          {subtitle}
        </Text>
      )}
    </>
  );

  /** Grupo que morfa. No card é uma View comum — precisa ser medível. */
  const textGroup = fullscreen ? (
    <Animated.View
      onLayout={e =>
        textPos.set({
          x: e.nativeEvent.layout.x,
          y: e.nativeEvent.layout.y,
        })
      }
      style={[{ transformOrigin: 'top left' }, textMorphStyle]}>
      {texts(FULLSCREEN_SCALE)}
    </Animated.View>
  ) : (
    <View ref={textRef} collapsable={false}>
      {texts(1)}
    </View>
  );

  const content = (
    <View
      style={{
        flex: fullscreen ? 1 : undefined,
        paddingTop: fullscreen ? insets.top + 6 : 30,
        paddingBottom: fullscreen ? insets.bottom + 24 : 26,
        paddingHorizontal: fullscreen ? FULLSCREEN_PADDING : CARD_PADDING,
        opacity: contentVisible ? 1 : 0,
      }}
      pointerEvents={contentVisible ? 'auto' : 'none'}>
      {fullscreen && onBack && (
        <Animated.View style={secondaryStyle}>
          <Box marginBottom="s20">
            <ScreenHeader onBack={close} variant="dark" />
          </Box>
        </Animated.View>
      )}

      {textGroup}

      {!fullscreen && buttonLabel && (
        <Box marginTop="s20" alignItems="flex-start">
          <View ref={buttonRef} collapsable={false}>
            <Button
              label={buttonLabel}
              variant="outlineGold"
              onPress={() => openWithMeasure(onPressButton ?? onPress)}
            />
          </View>
        </Box>
      )}

      {fullscreen && children && (
        <Animated.View style={[{ flex: 1 }, secondaryStyle]}>
          {children}
        </Animated.View>
      )}
    </View>
  );

  /**
   * CTA fantasma: cópia do botão do card, ancorada onde ele estava, que
   * acompanha a forma e sai em fade. Em `fullscreen` o `buttonLabel` serve
   * APENAS para isto — a tela de destino não mostra CTA.
   */
  const ghostButton = fullscreen && source?.button && buttonLabel && (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, top: 0 }, ghostButtonStyle]}>
      <Button label={buttonLabel} variant="outlineGold" />
    </Animated.View>
  );

  if (fullscreen) {
    // Camada de fundo da tela de destino: ocupa 100% da área visível, full
    // bleed (desenha sob a status bar). O container é transparente — quem
    // pinta é a forma, que pode estar menor que a tela durante a transição.
    return (
      <View style={{ flex: 1 }}>
        {shape}
        {content}
        {ghostButton}
      </View>
    );
  }

  // Modo card: no fluxo da tela; a margem horizontal fica com quem usa.
  return (
    <TouchableOpacityBox
      activeOpacity={0.9}
      onPress={() => openWithMeasure(onPress)}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={eyebrow ? `${eyebrow}: ${title}` : title}
      height={cardHeight}
      position="relative">
      {shape}
      {content}
    </TouchableOpacityBox>
  );
}
