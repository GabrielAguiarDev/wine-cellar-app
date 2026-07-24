import { useRouter } from 'expo-router';

import {
  Box,
  Icon,
  Screen,
  Text,
  TouchableOpacityBox,
  WineRow,
} from '@components/index';
import { WINES } from '@data/index';
import { useCartStore, useFavoritesStore, useToastStore } from '@store/index';
import { palette } from '@theme/index';
import { toWineRowData } from '@utils/index';

export default function FavoritesScreen() {
  const router = useRouter();
  const favs = useFavoritesStore(s => s.favs);
  const toggleFav = useFavoritesStore(s => s.toggleFav);
  const addToCart = useCartStore(s => s.addToCart);
  const show = useToastStore(s => s.show);

  const favWines = WINES.filter(w => favs[w.id]);
  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  const addToBag = (id: string) => {
    addToCart(id);
    show('Adicionado à sacola.');
  };

  return (
    <Screen scroll>
      <Box paddingBottom="s108" paddingTop="s6">
        <Text variant="h2" paddingHorizontal="s22">
          Favoritos
        </Text>
        <Text variant="body" fontSize={12} color="inkA55" paddingHorizontal="s22" marginTop="s4">
          Sua garrafeira dos desejos
        </Text>

        {favWines.length === 0 ? (
          <Text
            variant="quote"
            fontSize={19}
            color="wineA60"
            textAlign="center"
            marginTop="s60"
            paddingHorizontal="s40">
            Nenhum vinho salvo ainda.
          </Text>
        ) : (
          <Box paddingHorizontal="s22" paddingTop="s18" style={{ gap: 14 }}>
            {favWines.map(w => (
              <WineRow
                key={w.id}
                data={toWineRowData(w)}
                onPress={() => openWine(w.id)}
                rightSlot={
                  <Box alignItems="center" style={{ gap: 10 }}>
                    <TouchableOpacityBox
                      activeOpacity={0.7}
                      accessibilityLabel="Remover dos favoritos"
                      onPress={() => toggleFav(w.id)}>
                      <Icon name="heart" size={20} color={palette.wine} fill={palette.wine} />
                    </TouchableOpacityBox>
                    <TouchableOpacityBox
                      activeOpacity={0.7}
                      accessibilityLabel="Adicionar à sacola"
                      onPress={() => addToBag(w.id)}
                      width={32}
                      height={32}
                      borderWidth={1}
                      borderColor="primary"
                      borderRadius="r9"
                      alignItems="center"
                      justifyContent="center">
                      <Icon name="plus" size={16} color={palette.wine} />
                    </TouchableOpacityBox>
                  </Box>
                }
              />
            ))}
          </Box>
        )}
      </Box>
    </Screen>
  );
}
