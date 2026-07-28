import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import {
  ANDROID_BLUR_METHOD,
  BAR_FADE_WINDOW,
  BAR_HEIGHT,
  COMPACT_HEADER_HEIGHT,
  Colors,
  DISMISS_KEYBOARD_DELAY,
  FOCUSED_TOP_GAP,
  MAX_BLUR_INTENSITY,
  PULL_SPRING,
  PULL_THRESHOLD,
  spacing,
} from './conf';
import {
  type ScrollableSearchAnchorProps,
  type ScrollableSearchContextValue,
  type ScrollableSearchFocusedScreenProps,
  type ScrollableSearchOverlayProps,
  type ScrollableSearchProps,
  type SearchBarProps,
} from './types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ScrollableSearch — puxar a lista para baixo abre a busca
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Porte do componente do reacticx
 * (https://www.reacticx.com/docs/components/scrollable-search): passar do
 * limiar de overscroll foca o campo de busca, que sobe para o topo enquanto o
 * conteúdo atrás entra em blur.
 *
 * ── As quatro peças ─────────────────────────────────────────────────────────
 *
 * `<ScrollableSearch>`      contexto (estado do foco + valores do gesto)
 * `<ScrollableSearch.Anchor>`   reserva o lugar da barra DENTRO do conteúdo e
 *                               diz onde ele ficou
 * `<ScrollableSearch.SearchBar>` a barra em si: absoluta, acompanha o scroll em
 *                               repouso e sobe em mola ao focar
 * `<ScrollableSearch.Overlay>`   blur + captura do toque que fecha
 * `<ScrollableSearch.FocusedScreen>` o que aparece sobre o blur (sugestões,
 *                               recentes, resultados ao vivo)
 *
 * ── Quem alimenta o gesto ───────────────────────────────────────────────────
 *
 * O original traz o próprio `ScrollContent` (um `Animated.ScrollView` em
 * absoluteFill) só para ler o scroll. Aqui esse papel é do
 * `AnimatedHeaderScrollView`, que já tem o ScrollView da tela e já lê o offset
 * para colapsar o título — dois ScrollViews empilhados seria absurdo. Em vez do
 * componente, o contexto expõe dois WORKLETS (`onScroll`, `onEndDrag`) que o
 * dono do ScrollView chama de dentro do handler dele. É por isso que o
 * `AnimatedHeaderScrollView` consulta este contexto com
 * `useScrollableSearchOptional`.
 *
 * ── Desvios do original, deliberados ────────────────────────────────────────
 *
 * - Cores em creme/bordô (ver `conf.ts`); o original é dark. O fallback sem
 *   blur também: creme quase opaco em vez de preto.
 * - A barra desenha o próprio CARTÃO (fundo, borda, raio, sombra) e os filhos
 *   são só o conteúdo da linha. No original o container é transparente e o
 *   `shadowOpacity` animado não produz sombra alguma — no iOS uma view sem
 *   fundo não projeta sombra. Com o cartão aqui dentro, a sombra do overscroll
 *   funciona de verdade.
 * - Posição de repouso MEDIDA (`Anchor`) em vez de um `top` fixo de 90px: neste
 *   app o campo mora no meio do conteúdo, depois do título grande e do toggle,
 *   e não colado no topo da tela.
 * - O fade ao rolar é relativo ao header compacto, não fixo em [0, 100] px
 *   (ver `BAR_FADE_WINDOW`).
 * - `pullThreshold` migrou de `ScrollContent` (que não existe aqui) para a raiz.
 * - Sem o `memo` duplo do original (`memo(memo(Root))`) e sem o
 *   `animatedStyle` que devolve `opacity: 1` fixo.
 *
 * ── Limite conhecido: o GESTO é de iOS ──────────────────────────────────────
 *
 * O gatilho é o offset NEGATIVO do scroll, que só existe onde a lista faz bounce
 * — ou seja, no iOS. O overscroll elástico do Android (12+) não mexe no
 * `contentOffset`, então lá o `pullDistance` fica em zero e o gesto nunca
 * dispara. É assim no original também, e é a mesma razão pela qual o título
 * grande do `AnimatedHeaderScrollView` só cresce no iOS. No Android a busca
 * continua acessível pelo toque no campo (`onFocus` abre o mesmo overlay), então
 * a experiência degrada em vez de quebrar.
 */

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const ScrollableSearchContext =
  createContext<ScrollableSearchContextValue | null>(null);

/** Dentro de um `<ScrollableSearch>`. Lança fora dele. */
export function useScrollableSearch(): ScrollableSearchContextValue {
  const context = useContext(ScrollableSearchContext);
  if (!context) {
    throw new Error(
      'Os componentes de ScrollableSearch precisam estar dentro de <ScrollableSearch>',
    );
  }
  return context;
}

/**
 * Devolve `null` fora do provider — é assim que o `AnimatedHeaderScrollView`
 * pergunta "estou dentro de uma busca puxável?" sem virar dependência dela.
 */
export function useScrollableSearchOptional(): ScrollableSearchContextValue | null {
  return useContext(ScrollableSearchContext);
}

const ScrollableSearchRoot = memo<ScrollableSearchProps>(
  ({ children, pullThreshold = PULL_THRESHOLD }) => {
    const [isFocused, setFocusedState] = useState(false);
    const dismissTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollY = useSharedValue(0);
    const pullDistance = useSharedValue(0);
    /**
     * O gesto já disparou neste arrasto. Sem isso o worklet chamaria o foco a
     * cada frame acima do limiar; `onEndDrag` rearma.
     */
    const armed = useSharedValue(false);
    /**
     * O dedo está na tela. O gesto exige isso porque offset negativo NÃO é
     * sinônimo de "puxada": no mount o iOS ajusta o content inset e reporta
     * offset negativo sozinho, e uma mudança de tamanho do conteúdo faz o mesmo
     * — sem esta guarda a busca abria por conta própria ao entrar na aba. O
     * original não checa isso.
     */
    const dragging = useSharedValue(false);
    const onPullToFocusRef = useRef<(() => void) | null>(null);

    const [contentVersion, setContentVersion] = useState(0);
    const notifyContentResize = useCallback(
      () => setContentVersion(version => version + 1),
      [],
    );

    const setIsFocused = useCallback((focused: boolean) => {
      if (dismissTimeout.current) {
        clearTimeout(dismissTimeout.current);
        dismissTimeout.current = null;
      }
      if (!focused) {
        dismissTimeout.current = setTimeout(() => {
          Keyboard.dismiss();
        }, DISMISS_KEYBOARD_DELAY);
      }
      setFocusedState(focused);
    }, []);

    useEffect(
      () => () => {
        if (dismissTimeout.current) {
          clearTimeout(dismissTimeout.current);
        }
      },
      [],
    );

    const triggerPullToFocus = useCallback(() => {
      onPullToFocusRef.current?.();
    }, []);

    const onScroll = useCallback(
      (offsetY: number) => {
        'worklet';
        scrollY.set(offsetY);

        if (offsetY >= 0) {
          pullDistance.set(0);
          return;
        }

        const distance = -offsetY;
        pullDistance.set(distance);

        if (distance > pullThreshold && !armed.get()) {
          armed.set(true);
          scheduleOnRN(triggerPullToFocus);
        }
      },
      [armed, pullDistance, pullThreshold, scrollY, triggerPullToFocus],
    );

    const onEndDrag = useCallback(() => {
      'worklet';
      armed.set(false);
    }, [armed]);

    const value = useMemo<ScrollableSearchContextValue>(
      () => ({
        isFocused,
        setIsFocused,
        scrollY,
        pullDistance,
        onPullToFocusRef,
        onScroll,
        onEndDrag,
        contentVersion,
        notifyContentResize,
      }),
      [
        isFocused,
        setIsFocused,
        scrollY,
        pullDistance,
        onScroll,
        onEndDrag,
        contentVersion,
        notifyContentResize,
      ],
    );

    return (
      <ScrollableSearchContext.Provider value={value}>
        <View style={styles.wrapper}>{children}</View>
      </ScrollableSearchContext.Provider>
    );
  },
);

ScrollableSearchRoot.displayName = 'ScrollableSearch';

/**
 * O lugar da barra no conteúdo: reserva a altura dela e informa onde ficou.
 *
 * `measureInWindow` (e não o `y` do `onLayout`) porque o `y` do layout é
 * relativo ao PAI imediato, e o ancoradouro vive aninhado em caixas de margem
 * dentro do scroll — a barra precisa da coordenada na tela. O `scrollY` volta
 * somado para o valor ser sempre "onde isto está com a lista no topo", mesmo se
 * a medição acontecer com a tela já rolada (troca de modo, por exemplo).
 *
 * ── Por que remedir no `contentVersion` ─────────────────────────────────────
 *
 * O `onLayout` do ancoradouro só dispara quando o layout DELE muda em relação ao
 * pai. Se um irmão ACIMA cresce depois — foi o que aconteceu com o
 * `SegmentedControl` nativo da tela de busca, que nasce com altura 0 e reporta a
 * real num segundo passo —, o ancoradouro desce sem que nada o avise, e a barra
 * fica pousada onde ele estava (sobre o conteúdo de cima). `contentVersion` muda
 * a cada `onContentSizeChange` do ScrollView, que é exatamente quando isso pode
 * ter acontecido.
 */
const Anchor = memo<ScrollableSearchAnchorProps>(
  ({ onMeasure, height = BAR_HEIGHT }) => {
    const ref = useRef<View>(null);
    const { scrollY, contentVersion } = useScrollableSearch();

    const measure = useCallback(() => {
      ref.current?.measureInWindow((_x, y) => {
        if (y > 0) {
          onMeasure(y + scrollY.get());
        }
      });
    }, [onMeasure, scrollY]);

    useEffect(measure, [measure, contentVersion]);

    return (
      <View
        ref={ref}
        onLayout={measure}
        pointerEvents="none"
        style={{ height }}
      />
    );
  },
);

Anchor.displayName = 'ScrollableSearch.Anchor';

const SearchBar = memo<SearchBarProps>(
  ({
    children,
    anchorY,
    onPullToFocus,
    enablePullEffect = true,
    springConfig = PULL_SPRING,
    style,
  }) => {
    const { isFocused, scrollY, pullDistance, onPullToFocusRef } =
      useScrollableSearch();
    const insets = useSafeAreaInsets();

    useEffect(() => {
      onPullToFocusRef.current = onPullToFocus ?? null;
      return () => {
        onPullToFocusRef.current = null;
      };
    }, [onPullToFocus, onPullToFocusRef]);

    /** Onde a barra estaciona quando focada: logo abaixo da status bar. */
    const focusedY = insets.top + FOCUSED_TOP_GAP;
    const measured = anchorY > 0;

    /**
     * A barra está fora do scroll, então ela só "pertence" ao conteúdo enquanto
     * o fade a apaga antes de cruzar o header compacto. `fadeEnd` é o offset em
     * que o topo dela encostaria na borda de baixo do header.
     */
    const fadeEnd = Math.max(0, anchorY - (insets.top + COMPACT_HEADER_HEIGHT));
    const fadeStart = Math.max(0, fadeEnd - BAR_FADE_WINDOW);

    const containerStyle = useAnimatedStyle(() => {
      /**
       * O `+ scrollY` cancela o "andar com o conteúdo" do cartão (abaixo) na hora
       * de subir: sem ele a barra pousaria a distância rolada acima do topo — o
       * que, focando por TOQUE numa lista já rolada, a jogava para fora da tela.
       * No original o campo nasce colado no topo e o erro não aparece.
       */
      const translateY = withSpring(
        isFocused ? focusedY - anchorY + scrollY.get() : 0,
        springConfig,
      );

      if (!measured) {
        return { opacity: 0, pointerEvents: 'none' as const, transform: [] };
      }
      if (isFocused) {
        return {
          opacity: withTiming(1, { duration: 200 }),
          pointerEvents: 'box-none' as const,
          transform: [{ translateY }],
        };
      }

      const opacity =
        fadeEnd > fadeStart
          ? interpolate(
              scrollY.get(),
              [fadeStart, fadeEnd],
              [1, 0],
              Extrapolation.CLAMP,
            )
          : 1;

      /**
       * Apagada, a barra tem de sair do caminho do toque também: ela continua
       * DESENHADA na faixa do header (só transparente), e sem isto viraria um
       * campo invisível engolindo toques no topo da tela.
       */
      return {
        opacity,
        pointerEvents:
          opacity < 0.1 ? ('none' as const) : ('box-none' as const),
        transform: [{ translateY }],
      };
    }, [isFocused, measured, anchorY, focusedY, fadeStart, fadeEnd]);

    const cardStyle = useAnimatedStyle(() => {
      const scale = enablePullEffect
        ? interpolate(
            pullDistance.get(),
            [0, 60, 120],
            [1, 1.02, 1.05],
            Extrapolation.CLAMP,
          )
        : 1;
      const shadowOpacity = enablePullEffect
        ? interpolate(
            pullDistance.get(),
            [0, 60],
            [0.05, 0.2],
            Extrapolation.CLAMP,
          )
        : 0.05;

      // Em repouso a barra tem de andar junto com o conteúdo — inclusive na
      // esticada do overscroll, que é onde o gesto acontece.
      return {
        transform: [{ scale }, { translateY: -scrollY.get() }],
        shadowOpacity,
      };
    }, [enablePullEffect]);

    // `pointerEvents` vem do estilo animado — ver `containerStyle`.
    return (
      <Animated.View
        style={[styles.barContainer, { top: anchorY }, containerStyle]}>
        <Animated.View style={[styles.card, cardStyle, style]}>
          {children}
        </Animated.View>
      </Animated.View>
    );
  },
);

SearchBar.displayName = 'ScrollableSearch.SearchBar';

const Overlay = memo<ScrollableSearchOverlayProps>(
  ({
    children,
    onPress,
    enableBlur = true,
    blurTint = Platform.OS === 'ios' ? 'systemThickMaterialLight' : 'light',
    maxBlurIntensity = MAX_BLUR_INTENSITY,
  }) => {
    const { isFocused, pullDistance, setIsFocused } = useScrollableSearch();

    // Focado, o blur é cheio; puxando, ele antecipa o que vem — é o "teaser"
    // que dá a sensação de que a busca já está abrindo antes do limiar.
    const blurProps = useAnimatedProps(() => {
      if (isFocused) {
        return { intensity: maxBlurIntensity };
      }
      return {
        intensity: interpolate(
          pullDistance.get(),
          [0, 20, 80],
          [0, 30, maxBlurIntensity],
          Extrapolation.CLAMP,
        ),
      };
    }, [isFocused, maxBlurIntensity]);

    const overlayStyle = useAnimatedStyle(() => {
      if (isFocused) {
        return { opacity: withTiming(1, { duration: 350 }) };
      }
      const opacity = interpolate(
        pullDistance.get(),
        [0, 10],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return {
        opacity:
          pullDistance.get() > 0 ? opacity : withTiming(0, { duration: 400 }),
      };
    }, [isFocused]);

    const handlePress = useCallback(() => {
      if (isFocused) {
        setIsFocused(false);
      }
      onPress?.();
    }, [isFocused, onPress, setIsFocused]);

    return (
      <Animated.View
        style={[styles.overlay, overlayStyle]}
        pointerEvents={isFocused ? 'auto' : 'none'}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handlePress}>
          {enableBlur && Platform.OS !== 'web' ? (
            <AnimatedBlurView
              animatedProps={blurProps}
              tint={blurTint}
              blurMethod={ANDROID_BLUR_METHOD}
              style={StyleSheet.absoluteFill}>
              {children}
            </AnimatedBlurView>
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.scrim]}>
              {children}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

Overlay.displayName = 'ScrollableSearch.Overlay';

const FocusedScreen = memo<ScrollableSearchFocusedScreenProps>(
  ({ children, contentPaddingTop }) => {
    const { isFocused } = useScrollableSearch();
    const insets = useSafeAreaInsets();

    const paddingTop =
      contentPaddingTop ??
      insets.top + FOCUSED_TOP_GAP + BAR_HEIGHT + spacing.md;

    const animatedStyle = useAnimatedStyle(
      () => ({
        opacity: withTiming(isFocused ? 1 : 0, {
          duration: isFocused ? 350 : 400,
        }),
      }),
      [isFocused],
    );

    return (
      <Animated.View
        style={[StyleSheet.absoluteFill, { paddingTop }, animatedStyle]}
        pointerEvents={isFocused ? 'box-none' : 'none'}>
        {children}
      </Animated.View>
    );
  },
);

FocusedScreen.displayName = 'ScrollableSearch.FocusedScreen';

export const ScrollableSearch = Object.assign(ScrollableSearchRoot, {
  Anchor,
  SearchBar,
  Overlay,
  FocusedScreen,
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  scrim: {
    backgroundColor: Colors.scrim,
  },
  /* Acima do overlay (50) e do header do `AnimatedHeaderScrollView` (11). */
  barContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 200,
  },
  card: {
    height: BAR_HEIGHT,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },
});
