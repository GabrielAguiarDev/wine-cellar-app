import { Stack } from 'expo-router';

import { brandHeaderOptions } from '@theme/navHeader';

/** Pilha da aba "bag" — header nativo com large title "Sacola". */
export default function BagStackLayout() {
  return <Stack screenOptions={{ ...brandHeaderOptions, title: 'Sacola' }} />;
}
