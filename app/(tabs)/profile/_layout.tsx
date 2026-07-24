import { Stack } from 'expo-router';

/** Pilha da aba "profile". Header nativo é configurado na Fase D. */
export default function ProfileStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
