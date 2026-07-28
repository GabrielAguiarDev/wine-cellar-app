import { Stack } from 'expo-router';

import { brandLargeTitleOptions } from '@theme/navHeader';

/** Pilha da aba "search" — header nativo (título definido na tela). */
export default function SearchStackLayout() {
  return <Stack screenOptions={brandLargeTitleOptions} />;
}
