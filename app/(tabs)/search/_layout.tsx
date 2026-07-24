import { Stack } from 'expo-router';

/** Pilha da aba "search". Header nativo é configurado na Fase D. */
export default function SearchStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
