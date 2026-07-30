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

import { useTransitionStore } from '@store/index';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FadeReentry — a tela de ORIGEM de um shared element voltando ao foco
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Contexto: quando um shared element cresce até virar tela cheia (ver
 * `CurationBlock`), a rota de destino é um push com `animation: 'none'` —
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
 *   <FadeReentry transitionId={WEEKLY_CURATION.id}>
 *     <Reappear order={0}>{header}</Reappear>
 *     {card}                          ← o shared element NÃO entra em fade
 *     <Reappear order={1}>{pills}</Reappear>
 *   </FadeReentry>
 *
 * O próprio shared element fica FORA de `Reappear`: a forma que encolhe
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
 * o gatilho ser a flag `reentries` do `useTransitionStore`, gravada SÓ por quem
 * abre um shared element sem animação de Stack.
 */

/** Duração do fade de cada elemento. */
const ITEM_DURATION = 280;

/** Defasagem entre um elemento e o seguinte. */
const STEP = 55;

/** Deslocamento vertical inicial, em px. Sobe até 0 junto com o fade. */
const OFFSET = 6;

/**
 * Maior `order` que o escalonamento reconhece. Ordens acima disto usam este
 * atraso (em vez de nunca completarem o fade, ficando translúcidas).
 */
const MAX_ORDER = 8;

/** Janela total: cobre o último elemento possível. */
const TOTAL_DURATION = MAX_ORDER * STEP + ITEM_DURATION;

/**
 * Tempo decorrido da reentrada, em ms — não um progresso 0→1. É o que permite
 * a cada `Reappear` derivar sua própria janela (`order × STEP`) sem que o
 * provider precise saber quantos filhos existem.
 */
const TimeContext = createContext<SharedValue<number> | null>(null);

export type FadeReentryProps = {
  /**
   * `transitionId` do shared element que parte desta tela — a mesma chave que
   * o card grava em `useTransitionStore`. É o que restringe o fade à volta da
   * tela cheia, sem afetar as outras navegações.
   */
  transitionId: string;
  children: ReactNode;
};

export function FadeReentry({ transitionId, children }: FadeReentryProps) {
  // Começa no fim da janela: sem reentrada pendente (1º acesso, troca de aba),
  // todo mundo já está visível e nada anima.
  const time = useSharedValue(TOTAL_DURATION);

  useFocusEffect(
    useCallback(() => {
      const { reentries, clearReentry } = useTransitionStore.getState();
      if (reentries[transitionId]) {
        // Pedido consumido: uma volta, um fade.
        clearReentry(transitionId);
        time.set(0);
        // `Easing.linear` porque o valor animado é o RELÓGIO da reentrada; a
        // curva de cada elemento é aplicada dentro de `Reappear`.
        time.set(
          withTiming(TOTAL_DURATION, {
            duration: TOTAL_DURATION,
            easing: Easing.linear,
          }),
        );
      }
      return () => {
        // Saindo para a tela cheia: esconde agora, escondido sob o destino.
        if (useTransitionStore.getState().reentries[transitionId]) {
          time.set(0);
        }
      };
    }, [transitionId, time]),
  );

  return <TimeContext.Provider value={time}>{children}</TimeContext.Provider>;
}

export type ReappearProps = {
  /**
   * Posição na fila do escalonamento (0 = primeiro). Segue a leitura da tela,
   * de cima para baixo. Ordens repetidas aparecem juntas.
   */
  order?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Um elemento da reentrada. Fora de um `FadeReentry` é um wrapper inerte
 * (sem contexto, nada anima) — seguro de usar em componentes compartilhados.
 */
export function Reappear({ order = 0, style, children }: ReappearProps) {
  const time = useContext(TimeContext);
  const delay = Math.min(order, MAX_ORDER) * STEP;

  const animatedStyle = useAnimatedStyle(() => {
    if (!time) {
      return {};
    }
    const t = Math.min(Math.max((time.get() - delay) / ITEM_DURATION, 0), 1);
    // Ease-out cúbico: chega rápido perto do fim, sem "estalo" no começo.
    const e = 1 - (1 - t) ** 3;
    return {
      opacity: e,
      transform: [{ translateY: (1 - e) * OFFSET }],
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
