import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import {
  AnimatedSplash,
  AppProviders,
  TabBar,
  ToastHost,
} from '@components/index';
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
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      {/* iOS usa Native Tabs (em (tabs)/_layout); Android usa a TabBar custom. */}
      {Platform.OS !== 'ios' && <TabBar />}
      <ToastHost />
      {!splashFinished && (
        <AnimatedSplash onFinish={() => setSplashFinished(true)} />
      )}
    </AppProviders>
  );
}
