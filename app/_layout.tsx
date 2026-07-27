import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplash, AppProviders, TabBar } from '@components/index';
import { ToastProviderWithViewport } from '@components/molecules/Toast';
import { useAppFonts } from '@hooks/useAppFonts';
import { palette } from '@theme/index';

// Mantém o splash nativo (cor sólida bordô) visível enquanto as fontes carregam.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [splashFinished, setSplashFinished] = useState(false);

  const ready = fontsLoaded || fontError;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <AppProviders>
      <ToastProviderWithViewport>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          {/*
            Curadoria: a tela cresce a partir do card da Home (shared element em
            `BlocoCuradoria`), então a Stack não pode animar por cima —
            `animation: 'none'` deixa o bloco ser o único a animar.

            É um push NORMAL (`card`), NÃO um modal. Já foi `transparentModal`,
            que tinha a vantagem de manter a Home viva por baixo durante o
            crescimento; o problema é que no iOS toda tela empilhada depois de um
            modal também é apresentada como modal — a tela de produto aberta da
            coleção subia de baixo, com cantos arredondados e a tela anterior
            aparecendo no topo. `containedTransparentModal` tem o mesmo defeito, e
            `animation: 'fade'` expõe Home e destino ao mesmo tempo (some-se o
            texto do card em dobro atrás do texto que morfa).

            Em troca, o entorno da forma durante o crescimento é o `contentStyle`
            no creme da Home: perde-se o conteúdo da Home ao redor, mas a COR
            não salta e a leitura continua sendo "o card virou a tela".

            `gestureEnabled: false` porque o swipe pularia a animação de
            fechamento — sair daqui é pelo "Voltar", que a anima.
          */}
          <Stack.Screen
            name="curadoria/[id]"
            options={{
              animation: 'none',
              contentStyle: { backgroundColor: palette.creme },
              gestureEnabled: false,
            }}
          />
        </Stack>
        {/* iOS usa Native Tabs (em (tabs)/_layout); Android usa a TabBar custom. */}
        {Platform.OS !== 'ios' && <TabBar />}
        {!splashFinished && (
          <AnimatedSplash onFinish={() => setSplashFinished(true)} />
        )}
      </ToastProviderWithViewport>
    </AppProviders>
  );
}
