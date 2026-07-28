import { Stack } from 'expo-router';

import { brandLargeTitleOptions } from '@theme/navHeader';

/** Pilha da aba "bag" — header nativo com large title "Sacola". */
export default function BagStackLayout() {
  return <Stack screenOptions={{ ...brandLargeTitleOptions, title: 'Sacola' }} />;
}
