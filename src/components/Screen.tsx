import { type ReactNode } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@hooks/useAppTheme';
import { type Theme } from '@theme/theme';

import { AnimatedHeaderScrollView } from './AnimatedHeaderScrollView';
import { Box } from './Box';

type ScreenProps = {
  children: ReactNode;
  /** Cor de fundo sólida (chave do tema). Ignorada se `gradient` for passado. */
  backgroundColor?: keyof Theme['colors'];
  /** Fundo em gradiente (telas escuras). Ex.: ['#5A1622', '#431018', '#2C0A10']. */
  gradient?: string[];
  gradientLocations?: number[];
  /** Envolve o conteúdo num ScrollView. */
  scroll?: boolean;
  /** Rodapé fixo (fora do scroll), ex.: barra de preço + CTA. */
  footer?: ReactNode;
  /** Respeita o inset inferior (home indicator). Default true. */
  bottomInset?: boolean;
  /**
   * A tela usa um header nativo (Stack.Screen). Remove o padding-top manual e
   * ativa `contentInsetAdjustmentBehavior="automatic"` — requisito do large
   * title do iOS colapsar ao rolar.
   *
   * Não usar junto de `largeTitle`: lá o header é desenhado em JS e a pilha o
   * esconde (`brandLargeTitleOptions`).
   */
  nativeHeader?: boolean;
  /**
   * Título grande que colapsa numa barra compacta ao rolar, nas duas
   * plataformas — ver `AnimatedHeaderScrollView`. Implica `scroll`, e o header
   * da pilha tem de estar escondido (`brandLargeTitleOptions`).
   */
  largeTitle?: string;
  /** Linha de apoio sob o `largeTitle`. Só vale com ele. */
  subtitle?: string;
};

/**
 * Wrapper de tela: safe area (topo), fundo sólido ou gradiente, e scroll
 * opcional. As telas controlam seu próprio padding horizontal (22 padrão).
 *
 * ── Por que existem três caminhos de render ─────────────────────────────────
 *
 * A: `largeTitle` — título grande colapsável em JS, igual nas duas plataformas.
 *    Ver `AnimatedHeaderScrollView`, que traz o próprio scroll e paddings.
 *
 * B: `scroll` sem gradiente nem footer — o ScrollView é a RAIZ, sem wrapper, e o
 *    fundo vai no `style` dele. Isso importa para as telas de header NATIVO
 *    (`nativeHeader`, ainda com `headerLargeTitleEnabled`): o colapso nativo só
 *    acontece se o `react-native-screens` achar o ScrollView, e duas das três
 *    buscas dele exigem o scroll como filho DIRETO do content wrapper (ou da
 *    safe area view que o iOS 26 insere no meio). Qualquer view nossa no meio as
 *    invalida — e também quebra o `coerceChildScrollViewComponentSizeToSize`,
 *    que estica o scroll até preencher a tela.
 *
 * C: o resto (gradiente, footer, ou sem scroll) mantém o wrapper — e por isso é
 *    incompatível com o colapso nativo. Nenhuma tela combina os dois hoje.
 */
export function Screen({
  children,
  backgroundColor = 'background',
  gradient,
  gradientLocations,
  scroll = false,
  footer,
  bottomInset = true,
  nativeHeader = false,
  largeTitle,
  subtitle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const topPad = nativeHeader ? 0 : insets.top;

  const scrollProps = {
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: 'handled',
    keyboardDismissMode: 'on-drag',
    contentInsetAdjustmentBehavior: nativeHeader ? 'automatic' : 'never',
    contentContainerStyle: { paddingTop: topPad },
  } as const;

  // ── Caminho A: título grande colapsável em JS ────────────────────────────
  if (largeTitle) {
    return (
      <Box flex={1} style={{ backgroundColor: colors[backgroundColor] }}>
        <AnimatedHeaderScrollView largeTitle={largeTitle} subtitle={subtitle}>
          {children}
        </AnimatedHeaderScrollView>
      </Box>
    );
  }

  // ── Caminho B: ScrollView na raiz (ver comentário no topo do componente) ──
  if (scroll && !gradient && !footer) {
    return (
      <ScrollView
        {...scrollProps}
        style={{ flex: 1, backgroundColor: colors[backgroundColor] }}>
        {children}
      </ScrollView>
    );
  }

  // ── Caminho B: precisa de wrapper (gradiente, footer, ou sem scroll) ──────
  return (
    <Box
      flex={1}
      style={gradient ? undefined : { backgroundColor: colors[backgroundColor] }}>
      {gradient && (
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          locations={gradientLocations as [number, number, ...number[]] | undefined}
          style={StyleSheet.absoluteFill}
        />
      )}
      {scroll ? (
        <ScrollView {...scrollProps}>{children}</ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: topPad }}>{children}</View>
      )}
      {footer && (
        <View style={{ paddingBottom: bottomInset ? insets.bottom : 0 }}>
          {footer}
        </View>
      )}
    </Box>
  );
}
