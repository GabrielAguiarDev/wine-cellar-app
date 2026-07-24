import { Stack } from 'expo-router';

import { brandHeaderOptions } from '@theme/navHeader';

/** Pilha da aba "profile" — header nativo com large title "Perfil". */
export default function ProfileStackLayout() {
  return <Stack screenOptions={{ ...brandHeaderOptions, title: 'Perfil' }} />;
}
