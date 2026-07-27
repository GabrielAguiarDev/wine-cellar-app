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
 *  2. ROTA: `/curadoria/[id]` é apresentada como `transparentModal` com
 *     `animation: 'none'` (ver `app/_layout.tsx`). A Home continua montada e
 *     visível por baixo, e a Stack não faz animação própria — quem anima é
 *     este componente.
 *  3. TELA CHEIA: lê o retângulo de origem e anima a FORMA de lá até
 *     (0, 0, largura, altura) da janela, com o `borderRadius` indo a 0. Como
 *     ela nasce exatamente sobre o card, a leitura é de o card crescendo.
 *  4. CONTEÚDO: são duas camadas em crossfade, nenhuma delas esticada junto
 *     com a forma. A camada-fantasma repete o texto DO CARD no tamanho do
 *     card e some nos primeiros 28%; a definitiva entra a partir de 45%, já
 *     em geometria final. Sem o fantasma o texto do card sumiria de um frame
 *     para o outro (a forma opaca nasce por cima dele) e sobraria um
 *     retângulo bordô vazio crescendo — que o olho lê como salto.
 *     Um scrim escurece a Home ao redor conforme a forma cresce.
 *  5. VOLTAR: o caminho inverso (encolhe até o card) e só então `onBack()`
 *     executa a navegação. Vale para o header e para o botão físico do
 *     Android; o gesto de swipe da Stack fica desabilitado na rota para não
 *     escapar desse controle.
 *
 * Sem origem medida (deep link, reload), o destino aparece direto em tela
 * cheia, sem animação.
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
  /** Label do CTA. Sem label, o botão não é renderizado. */
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

/** Até que ponto o conteúdo do card (camada-fantasma) ainda é visível. */
const FIM_FADE_FANTASMA = 0.28;

/** Escurecimento da tela de origem enquanto a forma cresce por cima dela. */
const OPACIDADE_SCRIM = 0.3;

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
  children,
}: BlocoCuradoriaProps) {
  const insets = useSafeAreaInsets();
  const { width: larguraTela, height: alturaTela } = useWindowDimensions();
  const telaCheia = variante === 'tela-cheia';

  const setOrigem = useTransicaoStore(s => s.setOrigem);
  const limparOrigem = useTransicaoStore(s => s.limparOrigem);
  /**
   * Snapshot lido UMA vez, na montagem do destino: se o store mudar no meio
   * da animação, a geometria de partida não pode mudar junto.
   */
  const [origem] = useState(() =>
    telaCheia ? useTransicaoStore.getState().origens[transitionId] : undefined,
  );

  const refInterna = useRef<View | null>(null);
  const refForma = formaRef ?? refInterna;

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
   */
  const abrirMedindo = useCallback(
    (acao?: () => void) => {
      if (!acao) {
        return;
      }
      const no = refForma.current;
      if (!no) {
        acao();
        return;
      }
      no.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setOrigem(transitionId, { x, y, width, height, radius: RAIO_CARD });
        }
        acao();
      });
    },
    [refForma, setOrigem, transitionId],
  );

  // Abertura: só no destino e só quando há um retângulo de origem medido.
  useEffect(() => {
    if (!telaCheia || !origem) {
      return;
    }
    // Começa no frame SEGUINTE: montar o destino (lista, SVGs das garrafas)
    // consome o primeiro frame, e sem esse respiro os ~100ms iniciais da
    // animação não chegam a ser desenhados — de novo com cara de salto.
    const frame = requestAnimationFrame(() => {
      progresso.set(withTiming(1, { duration: DURACAO_ABERTURA, easing: CURVA }));
    });
    return () => cancelAnimationFrame(frame);
  }, [telaCheia, origem, progresso]);

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

  const estiloForma = useAnimatedStyle(() => {
    if (!origem) {
      return {};
    }
    const p = progresso.get();
    return {
      left: interpolate(p, [0, 1], [origem.x, 0]),
      top: interpolate(p, [0, 1], [origem.y, 0]),
      width: interpolate(p, [0, 1], [origem.width, larguraTela]),
      height: interpolate(p, [0, 1], [origem.height, alturaTela]),
      borderRadius: interpolate(p, [0, 1], [origem.radius, 0]),
    };
  });

  // Escurece a tela de origem conforme a forma cresce: sem isso o movimento
  // vertical sozinho não comunica "estou entrando dentro do card".
  const estiloScrim = useAnimatedStyle(() => ({
    opacity: origem
      ? interpolate(progresso.get(), [0, 1], [0, OPACIDADE_SCRIM])
      : 0,
  }));

  // Fantasma: acompanha o canto superior esquerdo da forma e some cedo.
  const estiloFantasma = useAnimatedStyle(() => {
    if (!origem) {
      return { opacity: 0 };
    }
    const p = progresso.get();
    return {
      opacity: interpolate(p, [0, FIM_FADE_FANTASMA], [1, 0], Extrapolation.CLAMP),
      left: interpolate(p, [0, 1], [origem.x, 0]),
      top: interpolate(p, [0, 1], [origem.y, 0]),
    };
  });

  const estiloConteudo = useAnimatedStyle(() => {
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

  /** Texto do bloco nas proporções de card ou de tela cheia. */
  const textos = (comoCard: boolean) => (
    <>
      {eyebrow && (
        <Text variant="eyebrow" marginBottom="s12">
          {eyebrow}
        </Text>
      )}

      <Text
        color="textOnDark"
        style={{
          fontFamily: fonts.serifMedium,
          fontSize: comoCard ? 31 : 40,
          lineHeight: comoCard ? 34 : 43,
          maxWidth: comoCard ? 230 : 300,
        }}>
        {titulo}
      </Text>

      {subtitulo && (
        <Text
          variant="body"
          fontSize={comoCard ? 12 : 13.5}
          color="cremeA62"
          marginTop="s12"
          style={{
            maxWidth: comoCard ? 210 : 280,
            lineHeight: comoCard ? 18 : 20,
          }}>
          {subtitulo}
        </Text>
      )}

      {botaoLabel && (
        <Box marginTop="s20" alignItems="flex-start">
          <Button
            label={botaoLabel}
            variant="outlineGold"
            onPress={
              comoCard
                ? () => abrirMedindo(onPressBotao ?? onPress)
                : onPressBotao
            }
          />
        </Box>
      )}
    </>
  );

  const conteudo = (
    <Animated.View
      style={[
        {
          flex: telaCheia ? 1 : undefined,
          paddingTop: telaCheia ? insets.top + 6 : 30,
          paddingBottom: telaCheia ? insets.bottom + 24 : 26,
          paddingHorizontal: telaCheia ? 24 : 26,
        },
        estiloConteudo,
      ]}
      pointerEvents={conteudoVisivel ? 'auto' : 'none'}>
      {telaCheia && onBack && (
        <Box marginBottom="s20">
          <ScreenHeader onBack={fechar} variant="dark" />
        </Box>
      )}

      {textos(!telaCheia)}

      {telaCheia && children}
    </Animated.View>
  );

  /**
   * Camada-fantasma: repete o conteúdo DO CARD, no tamanho do card, colado no
   * canto superior esquerdo da forma enquanto ela cresce — e some em fade nos
   * primeiros 28% do trajeto.
   *
   * Sem isso, o texto do card desaparece de um frame para o outro assim que a
   * forma (opaca) nasce por cima dele, e o que resta é um retângulo bordô
   * vazio crescendo: é exatamente essa perda seca que o olho lê como "salto"
   * em vez de "o card virou a tela".
   */
  const conteudoFantasma = telaCheia && origem && (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: origem.width,
          height: origem.height,
          paddingTop: 30,
          paddingBottom: 26,
          paddingHorizontal: 26,
        },
        estiloFantasma,
      ]}>
      {textos(true)}
    </Animated.View>
  );

  if (telaCheia) {
    // Camada de fundo da tela de destino: ocupa 100% da área visível, full
    // bleed (desenha sob a status bar). O container é transparente — quem
    // pinta é a forma, que pode estar menor que a tela durante a transição.
    return (
      <View style={{ flex: 1 }}>
        {origem && (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: palette.black },
              estiloScrim,
            ]}
          />
        )}
        {forma}
        {conteudoFantasma}
        {conteudo}
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
