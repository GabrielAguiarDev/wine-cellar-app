import { type ReactNode } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@shopify/restyle';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { theme } from '@theme/index';

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * Composição única dos providers de base do app.
 * (QueryClientProvider entra aqui na Fase 16, quando houver backend.)
 *
 * O `BottomSheetModalProvider` fica aqui no topo de propósito: ele hospeda o
 * portal das folhas inferiores DEPOIS dos filhos, então elas aparecem acima de
 * tudo — inclusive da TabBar flutuante.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
