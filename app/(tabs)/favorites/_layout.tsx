import { Stack } from 'expo-router';

import { brandLargeTitleOptions } from '@theme/navHeader';

/** Pilha da aba "favorites" — header nativo com large title "Favoritos". */
export default function FavoritesStackLayout() {
  return <Stack screenOptions={{ ...brandLargeTitleOptions, title: 'Favoritos' }} />;
}
