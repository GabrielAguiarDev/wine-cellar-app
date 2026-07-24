import { Stack } from 'expo-router';

import { brandHeaderOptions } from '@theme/navHeader';

/** Pilha da aba "favorites" — header nativo com large title "Favoritos". */
export default function FavoritesStackLayout() {
  return <Stack screenOptions={{ ...brandHeaderOptions, title: 'Favoritos' }} />;
}
