import { type ReactNode } from 'react';

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
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
