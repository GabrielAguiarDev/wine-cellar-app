import { StyleSheet } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cartCount } from '@data/index';
import { useCartStore } from '@store/index';
import { palette } from '@theme/index';

import { Box, TouchableOpacityBox } from './Box';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type TabKey = 'home' | 'search' | 'fav' | 'bag' | 'profile';

type TabDef = {
  key: TabKey;
  icon: IconName;
  route: '/home' | '/search' | '/favorites' | '/bag' | '/profile';
  label: string;
};

const TABS: TabDef[] = [
  { key: 'home', icon: 'home', route: '/home', label: 'Início' },
  { key: 'search', icon: 'search', route: '/search', label: 'Buscar' },
  { key: 'fav', icon: 'heart', route: '/favorites', label: 'Favoritos' },
  { key: 'bag', icon: 'bag', route: '/bag', label: 'Sacola' },
  { key: 'profile', icon: 'profile', route: '/profile', label: 'Perfil' },
];

/** Rotas (primeiro segmento) onde a tab bar aparece. */
const VISIBLE_ON = new Set([
  'home',
  'search',
  'sommelier',
  'favorites',
  'bag',
  'profile',
  'loyalty',
  'vip',
]);

/** Mapeia o segmento da rota atual para a aba ativa. */
const ACTIVE_TAB: Record<string, TabKey> = {
  home: 'home',
  search: 'search',
  sommelier: 'search',
  favorites: 'fav',
  bag: 'bag',
  checkout: 'bag',
  profile: 'profile',
  loyalty: 'profile',
  vip: 'profile',
  tracking: 'profile',
};

const ACTIVE = palette.wine;
const INACTIVE = 'rgba(42,33,28,0.32)';

/** Tab bar flutuante custom — overlay controlado pela rota atual. */
export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useCartStore(s => s.items);

  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  if (!VISIBLE_ON.has(segment)) {
    return null;
  }

  const active = ACTIVE_TAB[segment];
  const count = cartCount(items);

  return (
    <Box
      position="absolute"
      left={0}
      right={0}
      bottom={0}
      paddingHorizontal="s26"
      paddingTop="s12"
      style={{ paddingBottom: insets.bottom || 30, zIndex: 40 }}>
      <LinearGradient
        colors={['rgba(243,236,221,0)', palette.creme]}
        locations={[0, 0.34]}
        style={StyleSheet.absoluteFill}
      />
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="surface"
        borderWidth={1}
        borderColor="inkBorder10"
        borderRadius="r20"
        paddingVertical="s12"
        paddingHorizontal="s20"
        style={{
          shadowColor: palette.wine,
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}>
        {TABS.map(tab => (
          <TouchableOpacityBox
            key={tab.key}
            activeOpacity={0.7}
            accessibilityLabel={tab.label}
            onPress={() => router.navigate(tab.route)}
            padding="s4"
            position="relative">
            <Icon
              name={tab.icon}
              size={23}
              color={active === tab.key ? ACTIVE : INACTIVE}
            />
            {tab.key === 'bag' && count > 0 && (
              <Box
                position="absolute"
                top={0}
                right={-2}
                minWidth={16}
                height={16}
                borderRadius="r9"
                backgroundColor="primary"
                alignItems="center"
                justifyContent="center"
                paddingHorizontal="s4">
                <Text style={{ color: palette.creme, fontSize: 9 }}>{count}</Text>
              </Box>
            )}
          </TouchableOpacityBox>
        ))}
      </Box>
    </Box>
  );
}
