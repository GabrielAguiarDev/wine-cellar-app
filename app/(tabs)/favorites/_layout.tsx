import { Stack } from 'expo-router';

/** Pilha da aba "favorites". Header nativo é configurado na Fase D. */
export default function FavoritesStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
