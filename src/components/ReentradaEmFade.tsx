import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';

import { type StyleProp, type ViewStyle } from 'react-native';

import { useFocusEffect } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useTransicaoStore } from '@store/index';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ReentradaEmFade — a tela de ORIGEM de um shared element voltando ao foco
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Contexto: quando um shared element cresce até virar tela cheia (ver
 * `BlocoCuradoria`), a rota de destino é um push com `animation: 'none'` —
 * quem anima é o próprio bloco. O efeito colateral é na VOLTA: a forma encolhe
 * macia até o card, mas o resto da tela de origem (header, busca, pills,
 * rails) reaparece de um frame para o outro, seco, porque a Stack não tem
 * animação de pop para tocar.
 *
 * Este componente devolve a maciez a esse "resto": os elementos reaparecem em
 * fade curto, escalonado de cima para baixo, com um deslocamento mínimo (6px).
 * A intenção é ser quase imperceptível — o protagonista da volta continua sendo
 * o shared element.
 *
 * ── Uso ─────────────────────────────────────────────────────────────────────
 *
 *   <ReentradaEmFade transitionId={CURADORIA_SEMANA.id}>
 *     <Reaparecer ordem={0}>{header}</Reaparecer>
 *     <Reaparecer ordem={1}>{busca}</Reaparecer>
 *     {card}                            ← o shared element NÃO entra em fade
 *     <Reaparecer ordem={2}>{pills}</Reaparecer>
 *   </ReentradaEmFade>
 *
 * O próprio shared element fica FORA de `Reaparecer`: a forma que encolhe
 * aterrissa exatamente sobre ele, então ele precisa estar em opacidade cheia
 * no primeiro frame — em fade, apareceria um card fantasma sob a forma.
 *
 * ── Por que o "esconder" acontece no BLUR, não no foco ───────────────────────
 *
 * Se a opacidade fosse zerada só ao receber o foco, haveria o risco de um
 * frame com o conteúdo já em opacidade cheia (o pop é instantâneo). Zerar no
 * BLUR é seguro: naquele instante a tela de destino já cobriu esta, então
 * ninguém vê o conteúdo desaparecer — ele fica "armado" atrás do destino.
 *
 * Nada disso vale para as outras navegações da tela (produto, busca, abas):
 * essas rotas têm animação de Stack própria e a tela de origem aparece por
 * baixo durante o gesto — zerar a opacidade ali seria um piscada visível. Daí
 * o gatilho ser a flag `reentradas` do `useTransicaoStore`, gravada SÓ por quem
 * abre um shared element sem animação de Stack.
 */

/** Duração do fade de cada elemento. */
const DURACAO_ITEM = 280;

/** Defasagem entre um elemento e o seguinte. */
const PASSO = 55;

/** Deslocamento vertical inicial, em px. Sobe até 0 junto com o fade. */
const DESLOCAMENTO = 6;

/**
 * Maior `ordem` que o escalonamento reconhece. Ordens acima disto usam este
 * atraso (em vez de nunca completarem o fade, ficando translúcidas).
 */
const ORDEM_MAX = 8;

/** Janela total: cobre o último elemento possível. */
const DURACAO_TOTAL = ORDEM_MAX * PASSO + DURACAO_ITEM;

/**
 * Tempo decorrido da reentrada, em ms — não um progresso 0→1. É o que permite
 * a cada `Reaparecer` derivar sua própria janela (`ordem × PASSO`) sem que o
 * provider precise saber quantos filhos existem.
 */
const TempoContext = createContext<SharedValue<number> | null>(null);

export type ReentradaEmFadeProps = {
  /**
   * `transitionId` do shared element que parte desta tela — a mesma chave que
   * o card grava em `useTransicaoStore`. É o que restringe o fade à volta da
   * tela cheia, sem afetar as outras navegações.
   */
  transitionId: string;
  children: ReactNode;
};

export function ReentradaEmFade({
  transitionId,
  children,
}: ReentradaEmFadeProps) {
  // Começa no fim da janela: sem reentrada pendente (1º acesso, troca de aba),
  // todo mundo já está visível e nada anima.
  const tempo = useSharedValue(DURACAO_TOTAL);

  useFocusEffect(
    useCallback(() => {
      const { reentradas, limparReentrada } = useTransicaoStore.getState();
      if (reentradas[transitionId]) {
        // Pedido consumido: uma volta, um fade.
        limparReentrada(transitionId);
        tempo.set(0);
        // `Easing.linear` porque o valor animado é o RELÓGIO da reentrada; a
        // curva de cada elemento é aplicada dentro de `Reaparecer`.
        tempo.set(
          withTiming(DURACAO_TOTAL, {
            duration: DURACAO_TOTAL,
            easing: Easing.linear,
          }),
        );
      }
      return () => {
        // Saindo para a tela cheia: esconde agora, escondido sob o destino.
        if (useTransicaoStore.getState().reentradas[transitionId]) {
          tempo.set(0);
        }
      };
    }, [transitionId, tempo]),
  );

  return (
    <TempoContext.Provider value={tempo}>{children}</TempoContext.Provider>
  );
}

export type ReaparecerProps = {
  /**
   * Posição na fila do escalonamento (0 = primeiro). Segue a leitura da tela,
   * de cima para baixo. Ordens repetidas aparecem juntas.
   */
  ordem?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Um elemento da reentrada. Fora de um `ReentradaEmFade` é um wrapper inerte
 * (sem contexto, nada anima) — seguro de usar em componentes compartilhados.
 */
export function Reaparecer({ ordem = 0, style, children }: ReaparecerProps) {
  const tempo = useContext(TempoContext);
  const atraso = Math.min(ordem, ORDEM_MAX) * PASSO;

  const estilo = useAnimatedStyle(() => {
    if (!tempo) {
      return {};
    }
    const t = Math.min(Math.max((tempo.get() - atraso) / DURACAO_ITEM, 0), 1);
    // Ease-out cúbico: chega rápido perto do fim, sem "estalo" no começo.
    const e = 1 - (1 - t) ** 3;
    return {
      opacity: e,
      transform: [{ translateY: (1 - e) * DESLOCAMENTO }],
    };
  });

  return <Animated.View style={[style, estilo]}>{children}</Animated.View>;
}
