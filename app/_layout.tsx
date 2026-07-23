import { useEffect, useState } from 'react';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplash, AppProviders } from '@components/index';
import { useAppFonts } from '@hooks/useAppFonts';

// Mantém o splash nativo (cor sólida bordô) visível enquanto as fontes carregam.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [splashFinished, setSplashFinished] = useState(false);

  const ready = fontsLoaded || fontError;

  useEffect(() => {
    // Assim que o app está pronto, esconde o splash nativo. O overlay
    // AnimatedSplash (mesma cor) já está por cima → transição sem flash.
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <AppProviders>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
      {!splashFinished && (
        <AnimatedSplash onFinish={() => setSplashFinished(true)} />
      )}
    </AppProviders>
  );
}
