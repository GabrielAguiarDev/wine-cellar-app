import { Stack } from 'expo-router';

/** Pilha da aba "bag". Header nativo é configurado na Fase D. */
export default function BagStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
