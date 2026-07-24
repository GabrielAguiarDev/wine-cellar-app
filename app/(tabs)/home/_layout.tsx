import { Stack } from 'expo-router';

/** Pilha da aba "home". Header nativo é configurado na Fase D. */
export default function HomeStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
