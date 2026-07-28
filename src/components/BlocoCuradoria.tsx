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

import { useTransicaoStore } from '@store/index';
import { fonts, palette } from '@theme/index';

import { Box, TouchableOpacityBox } from './Box';
import { Button } from './Button';
import { ScreenHeader } from './ScreenHeader';
import { Text } from './Text';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BlocoCuradoria — a MESMA peça visual em dois estados, ligados por transição
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `variante="card"`        → bloco no fluxo da Home (cantos arredondados).
 * `variante="tela-cheia"`  → mesma peça ocupando 100% da tela, servindo de
 *                            camada de fundo da tela de destino.
 *
 * ── Como a transição funciona (shared element "entrar dentro") ──────────────
 *
 *  1. CARD: ao tocar, mede a própria FORMA (`measureInWindow`) e grava o
 *     retângulo em `useTransicaoStore` sob a chave `transitionId`. Só depois
 *     dispara a navegação — a medida precisa existir antes. Vale para o toque
 *     no bloco E no CTA: os dois passam por `abrirMedindo`. Uma saída que
 *     chame a navegação direto não deixa origem e o destino aparece de salto.
 *  2. ROTA: `/curadoria/[id]` é um push NORMAL (`card`) com `animation: 'none'`
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
 *     chega na do destino (`estiloMorfTexto`). Não há crossfade entre dois
 *     textos: com dois blocos em posições e corpos diferentes, o olho percebe
 *     que são textos distintos trocando de lugar. Para o morph funcionar, as
 *     medidas da tela cheia são as do card × `ESCALA_TELA_CHEIA` — o mesmo
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
 *    transição: quem consome monta ao receber `onAberturaConcluida`. Criar
 *    dezenas de views no meio do movimento custava ~55ms de thread JS travada
 *    já no simulador — em aparelho fraco, frames perdidos logo na largada.
 *  • `fundoExtra` fica com tamanho FIXO dentro da forma, então não é remedido
 *    nem re-rasterizado a cada frame; a forma só abre uma janela sobre ele.
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
 * ── Status bar & tab bar em `tela-cheia` (comportamento DECIDIDO) ───────────
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
 *        `/curadoria/...` não está lá, então some sozinha.
 *    A tab bar NÃO deve reaparecer por cima do bloco em tela cheia.
 *  • O padding inferior da tela de destino NÃO usa `s108` (reservado p/ tab
 *    bar); usa o inset de home indicator, já aplicado aqui.
 */

export type VarianteBloco = 'card' | 'tela-cheia';

/** Conteúdo textual — vem de props/dados, nunca hardcoded no componente. */
export type ConteudoCuradoria = {
  /** Linha dourada pequena acima do título. Ex.: "Curadoria da semana". */
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  /**
   * Label do CTA. Sem label, o botão não é renderizado.
   *
   * Em `tela-cheia` o destino NÃO mostra CTA: passe o mesmo label do card e ele
   * será usado só para o botão fantasma da transição (o CTA é o único elemento
   * do card sem par no destino, então precisa sair em fade em vez de sumir).
   */
  botaoLabel?: string;
};

export type BlocoCuradoriaProps = ConteudoCuradoria & {
  /**
   * Gancho estável do shared element. Precisa ser o MESMO valor no card e na
   * tela cheia — é a chave que casa origem e destino em `useTransicaoStore`.
   * Ex.: "curadoria-semana".
   */
  transitionId: string;
  variante?: VarianteBloco;
  /**
   * Cores do fundo (gradiente). 1 cor = fundo sólido. É a única fonte da cor
   * bordô: o card e a tela cheia devem receber exatamente o mesmo array, ou a
   * transição "pisca" de cor no meio.
   */
  cores?: readonly string[];
  /** Toque no bloco inteiro (modo card = abrir a tela de destino). */
  onPress?: () => void;
  /** Toque no CTA. No card, cai para `onPress` se não informado. */
  onPressBotao?: () => void;
  /**
   * Voltar (modo tela cheia). É chamado DEPOIS da animação de fechamento —
   * passe só a navegação (`router.back()`), sem lógica de animação.
   */
  onBack?: () => void;
  /**
   * Altura fixa do card. Opcional: sem ela a altura é definida pelo conteúdo
   * (que também é estável, e é medida em tempo de toque de qualquer forma).
   */
  alturaCard?: number;
  /**
   * Trava manual da camada de conteúdo (multiplica a opacidade da animação).
   * Útil para esconder o conteúdo sem mexer na forma.
   */
  conteudoVisivel?: boolean;
  /**
   * Ref externa da FORMA no modo card, caso quem usa precise medi-la também.
   * Por padrão o componente usa uma ref interna (é ela que alimenta o
   * `measureInWindow` da transição).
   */
  formaRef?: RefObject<View | null>;
  /**
   * Chamado uma vez, quando a animação de abertura termina (ou já na montagem
   * quando não há transição). É o gancho para montar conteúdo PESADO só depois
   * da transição: criar dezenas de views no meio da animação derruba frames,
   * sobretudo em aparelho fraco. Ver `app/curadoria/[id].tsx`.
   */
  onAberturaConcluida?: () => void;
  /**
   * Camada de fundo EXTRA (só `tela-cheia`): entra dentro da forma, portanto é
   * recortada por ela e nunca pinta fora do bloco durante a transição. Use
   * para tintas/gradientes que reagem ao conteúdo — ex.: o `FundoVinhos` do
   * carrossel da curadoria. Aparece junto com o conteúdo, não com a forma.
   */
  fundoExtra?: ReactNode;
  /** Resto da tela de destino (listas etc.). Só faz sentido em `tela-cheia`. */
  children?: ReactNode;
};

const CORES_PADRAO = [
  palette.wineLight,
  palette.wine,
  palette.wineDeeper,
] as const;

/** Gradiente do design: diagonal do canto superior direito p/ inferior esquerdo. */
const GRADIENTE_START = { x: 0.8, y: 0 };
const GRADIENTE_END = { x: 0.2, y: 1 };

/** Raio do card (r16 do tema) — vira 0 em tela cheia. */
const RAIO_CARD = 16;

/** Padding horizontal do conteúdo no card. */
const PADDING_CARD = 26;

/**
 * Padding horizontal do conteúdo em tela cheia. Exportado porque um filho que
 * precise sangrar até as bordas (ex.: o carrossel da curadoria, cujo recuo
 * lateral é o que centraliza os slides) tem de anular exatamente este valor.
 */
export const PADDING_TELA_CHEIA = 24;

export const DURACAO_ABERTURA = 560;
export const DURACAO_FECHAMENTO = 420;

/**
 * Curva "emphasized": sai devagar, acelera no meio e desacelera no fim.
 * Um `Easing.out` aqui resolvia 70% do trajeto nos primeiros 150ms e a
 * transição era lida como um salto — o card já tem ~89% da largura da tela,
 * então só o crescimento vertical é perceptível e ele precisa de tempo.
 */
const CURVA = Easing.bezier(0.4, 0, 0.2, 1);

/** A partir de que ponto da expansão o conteúdo de destino começa a aparecer. */
const INICIO_FADE_CONTEUDO = 0.45;

/** Até que ponto o CTA fantasma (elemento sem par no destino) fica visível. */
const FIM_FADE_FANTASMA = 0.28;

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
const ESCALA_TELA_CHEIA = 1.3;

/** Medidas base do texto (as do card). A tela cheia é isto × ESCALA_TELA_CHEIA. */
const TEXTO_BASE = {
  eyebrowCorpo: 9,
  eyebrowTracking: 3,
  eyebrowMargem: 12,
  tituloCorpo: 31,
  tituloEntrelinha: 34,
  tituloLargura: 230,
  subCorpo: 12,
  subEntrelinha: 18,
  subLargura: 210,
  subMargem: 12,
} as const;

type Medida = { x: number; y: number; width: number; height: number };

/** `measureInWindow` como promise, para medir vários nós antes de navegar. */
function medirNo(no: View | null): Promise<Medida | undefined> {
  return new Promise(resolve => {
    if (!no) {
      resolve(undefined);
      return;
    }
    no.measureInWindow((x, y, width, height) =>
      resolve({ x, y, width, height }),
    );
  });
}

export function BlocoCuradoria({
  transitionId,
  variante = 'card',
  eyebrow,
  titulo,
  subtitulo,
  botaoLabel,
  cores = CORES_PADRAO,
  onPress,
  onPressBotao,
  onBack,
  alturaCard,
  conteudoVisivel = true,
  formaRef,
  onAberturaConcluida,
  fundoExtra,
  children,
}: BlocoCuradoriaProps) {
  const insets = useSafeAreaInsets();
  const { width: larguraTela, height: alturaTela } = useWindowDimensions();
  const telaCheia = variante === 'tela-cheia';

  const setOrigem = useTransicaoStore(s => s.setOrigem);
  const limparOrigem = useTransicaoStore(s => s.limparOrigem);
  const pedirReentrada = useTransicaoStore(s => s.pedirReentrada);
  /**
   * Snapshot lido UMA vez, na montagem do destino: se o store mudar no meio
   * da animação, a geometria de partida não pode mudar junto.
   */
  const [origem] = useState(() =>
    telaCheia ? useTransicaoStore.getState().origens[transitionId] : undefined,
  );

  const refInterna = useRef<View | null>(null);
  const refForma = formaRef ?? refInterna;
  /** Nós do card que o destino precisa localizar para morfar/desaparecer. */
  const refTexto = useRef<View | null>(null);
  const refBotao = useRef<View | null>(null);
  /** Posição de layout do bloco de texto no destino (origem do morph). */
  const posTexto = useSharedValue({ x: 0, y: 0 });

  /** 0 = geometria do card (origem) · 1 = tela cheia. */
  const progresso = useSharedValue(telaCheia && !origem ? 1 : 0);
  /** Evita disparar dois fechamentos (header + botão físico). */
  const fechando = useRef(false);

  /**
   * Fecha animando de volta até o card e só então navega.
   * Declarado antes dos efeitos de propósito: a regra `react-hooks/immutability`
   * não aceita mutar um valor depois de ele já ter sido usado por um efeito.
   */
  const fechar = useCallback(() => {
    if (!onBack || fechando.current) {
      return;
    }
    fechando.current = true;
    if (!origem) {
      onBack();
      return;
    }
    // `.set()` em vez de `.value =`: é a API do reanimated 4 compatível com
    // as regras de imutabilidade do React Compiler.
    progresso.set(
      withTiming(
        0,
        { duration: DURACAO_FECHAMENTO, easing: CURVA },
        finalizou => {
          if (finalizou) {
            scheduleOnRN(onBack);
          }
        },
      ),
    );
  }, [onBack, origem, progresso]);

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
   * seco na volta. Ver `ReentradaEmFade`.
   */
  const abrirMedindo = useCallback(
    (acao?: () => void) => {
      if (!acao) {
        return;
      }
      pedirReentrada(transitionId);
      const no = refForma.current;
      if (!no) {
        acao();
        return;
      }
      // Mede forma, bloco de texto e CTA de uma vez: os três viram âncoras da
      // transição, e todas precisam existir antes de a navegação acontecer.
      Promise.all([
        medirNo(no),
        medirNo(refTexto.current),
        medirNo(refBotao.current),
      ]).then(([forma, texto, botao]) => {
        if (forma && forma.width > 0 && forma.height > 0) {
          setOrigem(transitionId, {
            x: forma.x,
            y: forma.y,
            width: forma.width,
            height: forma.height,
            radius: RAIO_CARD,
            texto: texto && { x: texto.x, y: texto.y },
            botao: botao && { x: botao.x, y: botao.y },
          });
        }
        acao();
      });
    },
    [refForma, setOrigem, pedirReentrada, transitionId],
  );

  // Abertura: só no destino e só quando há um retângulo de origem medido.
  useEffect(() => {
    if (!telaCheia) {
      return;
    }
    if (!origem) {
      // Sem transição (deep link): libera o conteúdo pesado de imediato.
      onAberturaConcluida?.();
      return;
    }
    // Começa no frame SEGUINTE: montar o destino consome o primeiro frame, e
    // sem esse respiro os ~100ms iniciais da animação não chegam a ser
    // desenhados — de novo com cara de salto.
    const frame = requestAnimationFrame(() => {
      progresso.set(
        withTiming(1, { duration: DURACAO_ABERTURA, easing: CURVA }, fim => {
          if (fim && onAberturaConcluida) {
            scheduleOnRN(onAberturaConcluida);
          }
        }),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [telaCheia, origem, progresso, onAberturaConcluida]);

  // A origem serve para uma viagem só: limpa ao desmontar o destino para que
  // uma entrada futura sem card (deep link) não anime a partir de lixo.
  useEffect(() => {
    if (!telaCheia) {
      return;
    }
    return () => limparOrigem(transitionId);
  }, [telaCheia, transitionId, limparOrigem]);

  // Botão físico do Android: mesma animação de fechamento do header.
  useEffect(() => {
    if (!telaCheia || !onBack) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      fechar();
      return true;
    });
    return () => sub.remove();
  }, [telaCheia, onBack, fechar]);

  /**
   * Geometria da forma. `translate` em vez de `left`/`top`: transform não
   * dispara layout. `width`/`height` continuam animando porque a forma PRECISA
   * mudar de tamanho — mas ela é o único nó que relayouta por frame, e o
   * gradiente de dentro reproduz o do card justamente por ser esticado junto
   * (gradiente linear é invariante à escala).
   */
  const estiloForma = useAnimatedStyle(() => {
    if (!origem) {
      return {};
    }
    const p = progresso.get();
    return {
      width: interpolate(p, [0, 1], [origem.width, larguraTela]),
      height: interpolate(p, [0, 1], [origem.height, alturaTela]),
      borderRadius: interpolate(p, [0, 1], [origem.radius, 0]),
      transform: [
        { translateX: interpolate(p, [0, 1], [origem.x, 0]) },
        { translateY: interpolate(p, [0, 1], [origem.y, 0]) },
      ],
    };
  });

  /**
   * MORPH DO TEXTO: um único bloco que sai da posição/escala do texto do card e
   * chega na posição/escala do destino. Nada de crossfade entre dois textos —
   * era isso que deixava perceptível que eram blocos diferentes.
   *
   * A escala inicial é exatamente 1/ESCALA_TELA_CHEIA, então no frame 0 o bloco
   * renderiza com as medidas do card (mesmo corpo, mesma quebra de linha). O
   * `transformOrigin: 'top left'` faz a escala acontecer a partir do canto que
   * estamos ancorando.
   */
  const estiloMorfTexto = useAnimatedStyle(() => {
    if (!origem?.texto) {
      return {};
    }
    const p = progresso.get();
    const destino = posTexto.get();
    const escala = interpolate(p, [0, 1], [1 / ESCALA_TELA_CHEIA, 1]);
    return {
      transform: [
        { translateX: interpolate(p, [0, 1], [origem.texto.x - destino.x, 0]) },
        { translateY: interpolate(p, [0, 1], [origem.texto.y - destino.y, 0]) },
        { scale: escala },
      ],
    };
  });

  /**
   * O CTA do card é o único elemento sem par no destino: ele não morfa, só
   * acompanha o movimento da forma e sai em fade no início. Sem isso ele
   * desapareceria de um frame para o outro assim que a forma opaca nascesse
   * por cima do card.
   */
  const estiloBotaoFantasma = useAnimatedStyle(() => {
    if (!origem?.botao) {
      return { opacity: 0 };
    }
    const p = progresso.get();
    return {
      opacity: interpolate(
        p,
        [0, FIM_FADE_FANTASMA],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        { translateX: origem.botao.x - origem.x * p },
        { translateY: origem.botao.y - origem.y * p },
      ],
    };
  });

  /**
   * Fade do conteúdo que NÃO morfa (voltar, contagem, carrossel): esse sim
   * entra depois, já em geometria final.
   */
  const estiloSecundario = useAnimatedStyle(() => {
    if (!origem) {
      return { opacity: conteudoVisivel ? 1 : 0 };
    }
    const fade = interpolate(
      progresso.get(),
      [INICIO_FADE_CONTEUDO, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: conteudoVisivel ? fade : 0 };
  });

  /**
   * Mesma curva de opacidade do conteúdo, mas em seu próprio hook: o reanimated
   * não permite reaproveitar um estilo animado em mais de um componente.
   */
  const estiloFundoExtra = useAnimatedStyle(() => {
    if (!origem) {
      return { opacity: conteudoVisivel ? 1 : 0 };
    }
    const fade = interpolate(
      progresso.get(),
      [INICIO_FADE_CONTEUDO, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: conteudoVisivel ? fade : 0 };
  });

  // LinearGradient exige >= 2 cores; 1 cor vira fundo sólido.
  const gradiente = (cores.length >= 2
    ? cores
    : [cores[0], cores[0]]) as unknown as [string, string, ...string[]];

  /* ── FORMA ────────────────────────────────────────────────────────────────
     Só aparência/geometria. No card ela apenas preenche o container; na tela
     cheia é ela que viaja do retângulo do card até a janela inteira. */
  const fundo = (
    <LinearGradient
      colors={gradiente}
      start={GRADIENTE_START}
      end={GRADIENTE_END}
      style={StyleSheet.absoluteFill}
    />
  );

  // Props comuns às duas variantes da forma. `nativeID` é o gancho legível
  // pelo DOM no web; `collapsable={false}` impede o Android de achatar a View
  // (sem isso o `measureInWindow` do card falha).
  const propsForma = {
    nativeID: transitionId,
    testID: transitionId,
    collapsable: false,
  };

  const forma = telaCheia ? (
    <Animated.View
      {...propsForma}
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: larguraTela,
          height: alturaTela,
          borderRadius: 0,
          overflow: 'hidden',
        },
        estiloForma,
      ]}>
      {fundo}
      {fundoExtra && (
        // Tamanho FIXO (tela cheia), não `absoluteFill`: assim a camada não é
        // remedida nem re-rasterizada quando a forma muda de tamanho — ela
        // apenas aparece pela "janela" que a forma abre (daí o overflow hidden).
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', left: 0, top: 0 },
            { width: larguraTela, height: alturaTela },
            estiloFundoExtra,
          ]}>
          {fundoExtra}
        </Animated.View>
      )}
    </Animated.View>
  ) : (
    // No card é uma View comum: nada anima aqui, e o ref precisa ser o do
    // host nativo para o `measureInWindow` funcionar sem intermediários.
    <View
      {...propsForma}
      ref={refForma}
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: RAIO_CARD, overflow: 'hidden' },
      ]}>
      {fundo}
    </View>
  );

  /* ── CONTEÚDO ─────────────────────────────────────────────────────────────
     Irmão da forma (não filho) e com opacity própria: entra/sai em fade já na
     geometria final, sem ser esticado enquanto a forma cresce. */

  /**
   * Bloco de texto numa escala `k`. Todas as medidas saem de `TEXTO_BASE × k`,
   * então k=1 dá exatamente o card e k=ESCALA_TELA_CHEIA dá exatamente a tela
   * cheia — com as mesmas quebras de linha. O CTA fica fora daqui de propósito:
   * ele existe só no card.
   */
  const textos = (k: number) => (
    <>
      {eyebrow && (
        <Text
          color="accent"
          style={{
            fontFamily: fonts.sansRegular,
            fontSize: TEXTO_BASE.eyebrowCorpo * k,
            letterSpacing: TEXTO_BASE.eyebrowTracking * k,
            textTransform: 'uppercase',
            marginBottom: TEXTO_BASE.eyebrowMargem * k,
          }}>
          {eyebrow}
        </Text>
      )}

      <Text
        color="textOnDark"
        style={{
          fontFamily: fonts.serifMedium,
          fontSize: TEXTO_BASE.tituloCorpo * k,
          lineHeight: TEXTO_BASE.tituloEntrelinha * k,
          maxWidth: TEXTO_BASE.tituloLargura * k,
        }}>
        {titulo}
      </Text>

      {subtitulo && (
        <Text
          color="cremeA62"
          style={{
            fontFamily: fonts.sansRegular,
            fontSize: TEXTO_BASE.subCorpo * k,
            lineHeight: TEXTO_BASE.subEntrelinha * k,
            maxWidth: TEXTO_BASE.subLargura * k,
            marginTop: TEXTO_BASE.subMargem * k,
          }}>
          {subtitulo}
        </Text>
      )}
    </>
  );

  /** Grupo que morfa. No card é uma View comum — precisa ser medível. */
  const grupoTexto = telaCheia ? (
    <Animated.View
      onLayout={e =>
        posTexto.set({
          x: e.nativeEvent.layout.x,
          y: e.nativeEvent.layout.y,
        })
      }
      style={[{ transformOrigin: 'top left' }, estiloMorfTexto]}>
      {textos(ESCALA_TELA_CHEIA)}
    </Animated.View>
  ) : (
    <View ref={refTexto} collapsable={false}>
      {textos(1)}
    </View>
  );

  const conteudo = (
    <View
      style={{
        flex: telaCheia ? 1 : undefined,
        paddingTop: telaCheia ? insets.top + 6 : 30,
        paddingBottom: telaCheia ? insets.bottom + 24 : 26,
        paddingHorizontal: telaCheia ? PADDING_TELA_CHEIA : PADDING_CARD,
        opacity: conteudoVisivel ? 1 : 0,
      }}
      pointerEvents={conteudoVisivel ? 'auto' : 'none'}>
      {telaCheia && onBack && (
        <Animated.View style={estiloSecundario}>
          <Box marginBottom="s20">
            <ScreenHeader onBack={fechar} variant="dark" />
          </Box>
        </Animated.View>
      )}

      {grupoTexto}

      {!telaCheia && botaoLabel && (
        <Box marginTop="s20" alignItems="flex-start">
          <View ref={refBotao} collapsable={false}>
            <Button
              label={botaoLabel}
              variant="outlineGold"
              onPress={() => abrirMedindo(onPressBotao ?? onPress)}
            />
          </View>
        </Box>
      )}

      {telaCheia && children && (
        <Animated.View style={[{ flex: 1 }, estiloSecundario]}>
          {children}
        </Animated.View>
      )}
    </View>
  );

  /**
   * CTA fantasma: cópia do botão do card, ancorada onde ele estava, que
   * acompanha a forma e sai em fade. Em `tela-cheia` o `botaoLabel` serve
   * APENAS para isto — a tela de destino não mostra CTA.
   */
  const botaoFantasma = telaCheia && origem?.botao && botaoLabel && (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, top: 0 }, estiloBotaoFantasma]}>
      <Button label={botaoLabel} variant="outlineGold" />
    </Animated.View>
  );

  if (telaCheia) {
    // Camada de fundo da tela de destino: ocupa 100% da área visível, full
    // bleed (desenha sob a status bar). O container é transparente — quem
    // pinta é a forma, que pode estar menor que a tela durante a transição.
    return (
      <View style={{ flex: 1 }}>
        {forma}
        {conteudo}
        {botaoFantasma}
      </View>
    );
  }

  // Modo card: no fluxo da tela; a margem horizontal fica com quem usa.
  return (
    <TouchableOpacityBox
      activeOpacity={0.9}
      onPress={() => abrirMedindo(onPress)}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={eyebrow ? `${eyebrow}: ${titulo}` : titulo}
      height={alturaCard}
      position="relative">
      {forma}
      {conteudo}
    </TouchableOpacityBox>
  );
}
