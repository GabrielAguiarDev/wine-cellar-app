import { Platform } from 'react-native';

import { Stack } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { cartCount } from '@data/index';
import { useCartStore } from '@store/index';
import { fonts, palette } from '@theme/index';

/**
 * Navegação por abas.
 * - iOS: Native Tabs (barra nativa, SF Symbols, badge na sacola).
 * - Android: pilha simples — a TabBar flutuante custom é um overlay do root
 *   layout (mantida "como está", conforme pedido).
 *
 * Cada aba é uma pilha aninhada (`<tab>/_layout`) para permitir header/title
 * nativo por tela (large title no iOS).
 */
export default function TabsLayout() {
  const items = useCartStore(s => s.items);
  const count = cartCount(items);

  if (Platform.OS !== 'ios') {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <NativeTabs
      tintColor={palette.wine}
      labelStyle={{ fontFamily: fonts.sansMedium, fontSize: 10 }}>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" />
        <NativeTabs.Trigger.Label>Buscar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Icon sf={{ default: 'heart', selected: 'heart.fill' }} />
        <NativeTabs.Trigger.Label>Favoritos</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bag">
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} />
        <NativeTabs.Trigger.Label>Sacola</NativeTabs.Trigger.Label>
        {count > 0 && (
          <NativeTabs.Trigger.Badge>{String(count)}</NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
