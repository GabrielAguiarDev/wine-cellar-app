import { type ReactNode } from 'react';

import { type StyleProp, type ViewStyle } from 'react-native';

import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

/** Defasagem entre um elemento e o seguinte na entrada da tela. */
export const REVEAL_STEP = 60;

/** Duração do fade de cada elemento. */
export const REVEAL_FADE = 340;

/** Deslocamento vertical inicial de cada elemento, em px. */
export const REVEAL_OFFSET = 12;

export type RevealProps = {
  /**
   * Posição na fila da entrada — o atraso é `order × REVEAL_STEP`. Quem usa
   * declara as posições numa constante `ORDER` no topo da tela, na ordem de
   * leitura: o que importa é a SEQUÊNCIA, e inserir um bloco no meio é renumerar
   * daqui para baixo, o que só é revisável com a lista inteira à vista.
   */
  order: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Um degrau da cascata de entrada de uma tela: fade + subida de `REVEAL_OFFSET`
 * px, atrasado em `order × REVEAL_STEP`.
 *
 * Nasceu dentro de `/reserved` e saiu para cá quando `/vip` ganhou o mesmo hero
 * fotográfico: as duas telas de coleção se apresentam do mesmo jeito, de cima
 * para baixo, e a cascata é parte desse padrão — não um detalhe de uma tela.
 *
 * `Easing.out(Easing.cubic)` é o que separa "elegante" de "lento": o elemento
 * cobre a maior parte da distância no início e desacelera na chegada, então a
 * cascata parece mais rápida do que os `REVEAL_FADE` ms que de fato dura.
 *
 * Regra prática de quem usa: a janela toda (`último order × REVEAL_STEP +
 * REVEAL_FADE`) deve fechar em ~1s. Passa disso e a cascata deixa de ser a tela
 * se apresentando para virar espera.
 */
export function Reveal({ order, style, children }: RevealProps) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.delay(order * REVEAL_STEP)
        .duration(REVEAL_FADE)
        .easing(Easing.out(Easing.cubic))
        .withInitialValues({ transform: [{ translateY: REVEAL_OFFSET }] })}>
      {children}
    </Animated.View>
  );
}
