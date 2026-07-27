import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplash, AppProviders, TabBar } from '@components/index';
import { ToastProviderWithViewport } from '@components/molecules/Toast';
import { useAppFonts } from '@hooks/useAppFonts';

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
            Curadoria: a tela cresce a partir do card da Home (shared element
            em `BlocoCuradoria`). Para isso a Stack precisa sair da frente —
            `transparentModal` mantém a Home montada e visível por baixo,
            `animation: 'none'` desliga a animação de push (quem anima é o
            bloco) e `gestureEnabled: false` impede que o swipe de dismiss
            pule a animação de fechamento.
          */}
          <Stack.Screen
            name="curadoria/[id]"
            options={{
              presentation: 'transparentModal',
              animation: 'none',
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
