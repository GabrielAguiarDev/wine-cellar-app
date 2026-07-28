import { Stack } from 'expo-router';

import { brandLargeTitleOptions } from '@theme/navHeader';

/** Pilha da aba "profile" — header nativo com large title "Perfil". */
export default function ProfileStackLayout() {
  return <Stack screenOptions={{ ...brandLargeTitleOptions, title: 'Perfil' }} />;
}
