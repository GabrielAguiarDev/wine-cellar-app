import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@components/Icon';
import { alpha, fonts } from '@theme/index';

import { TOAST_SKINS } from './Toast.skins';
import type { Toast as ToastType } from './Toast.types';
import { useToast } from './context/ToastContext';

interface ToastProps {
  toast: ToastType;
  index: number;
}

/** De onde o balão entra e para onde ele volta ao sair por tempo. */
const HIDDEN_OFFSET = 120;
/** Arrasto (pt) a partir do qual soltar FECHA em vez de voltar ao lugar. */
const DISMISS_DISTANCE = 44;
/** Piparote: fecha mesmo com pouco caminho, se for rápido. */
const DISMISS_VELOCITY = 550;
/** Resistência ao puxar para o lado errado (para dentro da tela). */
const RUBBER = 0.22;
/** Tempo mínimo de leitura devolvido ao soltar o balão sem fechar. */
const MIN_RESUME = 1200;

const EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const ENTER_SPRING = { damping: 26, stiffness: 170, mass: 0.8 };
const DRAG_SPRING = { damping: 22, stiffness: 220, mass: 0.7 };

export const Toast: React.FC<ToastProps> = ({ toast, index }) => {
  const { dismiss, expandedToasts, expandToast, collapseToast } = useToast();

  const isTop = toast.options.position === 'top';
  const skin = TOAST_SKINS[toast.options.type] ?? TOAST_SKINS.default;
  // A cor só é sobrescrita por quem passa `backgroundColor` de propósito; o
  // default é `null` justamente para o tipo continuar mandando na aparência.
  const background = toast.options.backgroundColor || skin.background;

  const isExpanded = expandedToasts.has(toast.id);
  const hasExpandedContent = !!toast.options.expandedContent;

  const opacity = useSharedValue(0);
  /** Posição "de sistema": entrada, lugar na pilha e saída por tempo. */
  const slideY = useSharedValue(isTop ? -HIDDEN_OFFSET : HIDDEN_OFFSET);
  /** Posição "de dedo". Separada de `slideY` para os dois não se atropelarem. */
  const dragY = useSharedValue(0);
  const scale = useSharedValue(0.94);
  const expand = useSharedValue(0);
  const height = useSharedValue(0);
  /** Já está saindo: trava gesto e timer para não fechar duas vezes. */
  const leaving = useSharedValue(false);
  const leavingRef = useRef(false);

  // Recuo e encolhimento de quem está embaixo na pilha.
  const stackOffset = Math.min(index * 4, 12) * (isTop ? 1 : -1);
  const stackScale = Math.max(1 - index * 0.02, 0.92);

  const close = useCallback(() => {
    dismiss(toast.id);
    toast.options.onClose?.();
  }, [dismiss, toast]);

  // ---------------------------------------------------------------------------
  // Tempo de vida
  //
  // O timer mora AQUI, não no provider. Lá ele era recriado a cada toast novo
  // (o efeito depende da lista inteira), o que reiniciava a contagem dos que já
  // estavam na tela, e ainda disputava o fechamento com este componente —
  // `onClose` chegava a rodar duas vezes. Com o timer no balão dá também para
  // PAUSAR enquanto o dedo está nele.
  // ---------------------------------------------------------------------------
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Espera entre a animação de saída e a remoção da lista. */
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(toast.options.duration);
  const startedAtRef = useRef(0);
  /** Em refs para o timer não depender da identidade dos callbacks. */
  const animateOutRef = useRef<() => void>(() => {});

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (ms: number) => {
      clearTimer();
      // `duration: 0` = fica até fechar na mão (ou no arrasto).
      if (ms <= 0 || leavingRef.current) {
        return;
      }
      remainingRef.current = ms;
      startedAtRef.current = Date.now();
      timerRef.current = setTimeout(() => animateOutRef.current(), ms);
    },
    [clearTimer],
  );

  const pauseTimer = useCallback(() => {
    if (!timerRef.current) {
      return;
    }
    remainingRef.current = Math.max(
      0,
      remainingRef.current - (Date.now() - startedAtRef.current),
    );
    clearTimer();
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    // `duration: 0` é um toast que só sai na mão — soltar o dedo não pode
    // dar um prazo de validade a ele.
    if (toast.options.duration <= 0 || leavingRef.current || timerRef.current) {
      return;
    }
    startTimer(Math.max(remainingRef.current, MIN_RESUME));
  }, [startTimer, toast.options.duration]);

  /** Saída por tempo: apaga e recolhe na direção da própria borda. */
  const animateOut = useCallback(() => {
    if (leavingRef.current) {
      return;
    }
    leavingRef.current = true;
    leaving.set(true);
    opacity.set(withTiming(0, { duration: 260, easing: EASE }));
    slideY.set(
      withTiming(stackOffset + (isTop ? -24 : 24), {
        duration: 260,
        easing: EASE,
      }),
    );
    scale.set(withTiming(0.94, { duration: 260, easing: EASE }));
    exitTimerRef.current = setTimeout(close, 240);
  }, [close, isTop, leaving, opacity, scale, slideY, stackOffset]);

  animateOutRef.current = animateOut;

  /** Saída pelo arrasto: continua o movimento do dedo para fora da tela. */
  const flingOut = useCallback(() => {
    if (leavingRef.current) {
      return;
    }
    leavingRef.current = true;
    leaving.set(true);
    clearTimer();
    opacity.set(withTiming(0, { duration: 160, easing: EASE }));
    dragY.set(
      withTiming((isTop ? -1 : 1) * (height.get() + 96), {
        duration: 200,
        easing: EASE,
      }),
    );
    exitTimerRef.current = setTimeout(close, 180);
  }, [clearTimer, close, dragY, height, isTop, leaving, opacity]);

  useEffect(() => {
    startTimer(toast.options.duration);
    return clearTimer;
  }, [toast.options.duration, startTimer, clearTimer]);

  // Um `dismissAll()` no meio da saída desmonta o balão com o `close` ainda
  // agendado — sem isto ele dispararia `onClose` de novo, fora da tela.
  useEffect(
    () => () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    },
    [],
  );

  // Entrada e, depois, cada vez que o balão muda de degrau na pilha.
  // Quem já está saindo não volta: o degrau muda quando um vizinho fecha, e
  // sem esta guarda o balão em fuga reapareceria opaco no lugar.
  useEffect(() => {
    if (leavingRef.current) {
      return;
    }
    opacity.set(withTiming(1, { duration: 220, easing: EASE }));
    slideY.set(withSpring(stackOffset, ENTER_SPRING));
    scale.set(withSpring(stackScale, ENTER_SPRING));
  }, [stackOffset, stackScale, opacity, slideY, scale]);

  useEffect(() => {
    expand.set(
      withSpring(isExpanded && hasExpandedContent ? 1 : 0, {
        damping: 20,
        stiffness: 100,
      }),
    );
  }, [isExpanded, hasExpandedContent, expand]);

  /**
   * ARRASTAR PARA FECHAR.
   *
   * A direção que fecha é a que joga o balão PARA FORA: para cima nos toasts do
   * topo (todos os do app hoje), para baixo nos de rodapé. Puxar para o outro
   * lado só estica com resistência — o balão não vai passear para o meio da
   * tela.
   *
   * `activeOffsetY(±10)` deixa o toque simples chegar ao `Pressable` de dentro
   * (é ele que expande o conteúdo); `failOffsetX` devolve o movimento
   * horizontal para quem estiver embaixo. E enquanto o dedo está no balão o
   * relógio para: ninguém perde o recado no meio da leitura.
   */
  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-10, 10])
        .failOffsetX([-16, 16])
        .onBegin(() => {
          scheduleOnRN(pauseTimer);
        })
        .onUpdate(e => {
          if (leaving.get()) {
            return;
          }
          const away = isTop ? e.translationY < 0 : e.translationY > 0;
          dragY.set(away ? e.translationY : e.translationY * RUBBER);
          // Some junto com o caminho percorrido — o fechamento já começa a ser
          // desenhado antes de soltar.
          const progress = Math.min(
            Math.abs(e.translationY) / (DISMISS_DISTANCE * 2),
            1,
          );
          opacity.set(away ? 1 - progress * 0.45 : 1);
        })
        .onEnd((e, success) => {
          if (leaving.get()) {
            return;
          }
          // `success` falso = gesto cancelado pelo sistema: aí só volta.
          const escaped = isTop
            ? e.translationY < -DISMISS_DISTANCE
            : e.translationY > DISMISS_DISTANCE;
          const flicked = isTop
            ? e.velocityY < -DISMISS_VELOCITY
            : e.velocityY > DISMISS_VELOCITY;
          if (success && (escaped || flicked)) {
            scheduleOnRN(flingOut);
            return;
          }
          dragY.set(withSpring(0, DRAG_SPRING));
          opacity.set(withTiming(1, { duration: 160, easing: EASE }));
        })
        .onFinalize(() => {
          // Roda depois do `onEnd`; se aquele fechou, `leavingRef` já barra.
          scheduleOnRN(resumeTimer);
        }),
    [dragY, flingOut, isTop, leaving, opacity, pauseTimer, resumeTimer],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { translateY: slideY.get() + dragY.get() },
      { scale: scale.get() },
    ],
    zIndex: 1000 - index,
  }));

  const expandedContentStyle = useAnimatedStyle(() => ({
    maxHeight: expand.get() * 300,
    opacity: expand.get(),
  }));

  const handlePress = () => {
    if (!hasExpandedContent) {
      return;
    }
    if (isExpanded) {
      collapseToast(toast.id);
    } else {
      expandToast(toast.id);
    }
  };

  const renderExpandedContent = () => {
    const content = toast.options.expandedContent;
    if (typeof content === 'function') {
      return content({ dismiss: animateOut });
    }
    return content;
  };

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View
        onLayout={e => height.set(e.nativeEvent.layout.height)}
        style={[
          styles.container,
          {
            top: isTop ? 80 : undefined,
            bottom: isTop ? undefined : 0,
          },
          animatedStyle,
          toast.options.style,
        ]}>
        <Pressable
          style={[
            styles.balloon,
            { backgroundColor: background, borderColor: skin.border },
          ]}
          onPress={handlePress}
          android_ripple={{ color: alpha.cremeA08 }}>
          <View style={styles.row}>
            {skin.icon ? (
              <Icon
                name={skin.icon}
                size={17}
                color={skin.accent}
                style={styles.icon}
              />
            ) : null}
            <View style={styles.content}>
              {typeof toast.content === 'string' ? (
                <Text style={[styles.text, { color: skin.text }]}>
                  {toast.content}
                </Text>
              ) : (
                toast.content
              )}
            </View>
            {toast.options.action ? (
              <Pressable
                style={styles.action}
                hitSlop={8}
                onPress={() => {
                  toast.options.action?.onPress();
                  animateOut();
                }}>
                <Text style={[styles.actionText, { color: skin.accent }]}>
                  {toast.options.action.label}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {hasExpandedContent ? (
            <Animated.View style={[styles.expanded, expandedContentStyle]}>
              {renderExpandedContent()}
            </Animated.View>
          ) : null}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    // Sombra em bordô, não preto: sobre o creme das telas o preto suja.
    shadowColor: '#2C0A10',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  balloon: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  icon: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  text: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  action: {
    marginLeft: 14,
  },
  actionText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  expanded: {
    overflow: 'hidden',
  },
});
