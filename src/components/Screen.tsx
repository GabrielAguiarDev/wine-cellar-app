import { type ReactNode } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@hooks/useAppTheme';
import { type Theme } from '@theme/theme';

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
   */
  nativeHeader?: boolean;
};

/**
 * Wrapper de tela: safe area (topo), fundo sólido ou gradiente, e scroll
 * opcional. As telas controlam seu próprio padding horizontal (22 padrão).
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
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const topPad = nativeHeader ? 0 : insets.top;

  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior={nativeHeader ? 'automatic' : 'never'}
      contentContainerStyle={{ paddingTop: topPad }}>
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingTop: topPad }}>{children}</View>
  );

  return (
    <Box flex={1}>
      {gradient ? (
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          locations={gradientLocations as [number, number, ...number[]] | undefined}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors[backgroundColor] },
          ]}
        />
      )}
      {content}
      {footer && (
        <View style={{ paddingBottom: bottomInset ? insets.bottom : 0 }}>
          {footer}
        </View>
      )}
    </Box>
  );
}
