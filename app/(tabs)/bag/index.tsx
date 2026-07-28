import { ScrollView } from 'react-native';

import { useRouter } from 'expo-router';

import {
  BottleGraphic,
  Box,
  Button,
  Icon,
  Screen,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { cartCount, cartSubtotal, findWine, WINES } from '@data/index';
import { useCartStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brl } from '@utils/index';

export default function BagScreen() {
  const router = useRouter();
  const items = useCartStore(s => s.items);
  const setQty = useCartStore(s => s.setQty);

  const ids = Object.keys(items);
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const sugestoes = WINES.filter(w => !items[w.id]).slice(0, 4);

  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  return (
    <Screen scroll largeTitle="Sacola">
      <Box paddingBottom="s108" paddingTop="s6">
        {ids.length === 0 ? (
          <Box alignItems="center" paddingHorizontal="s40" paddingTop="s60">
            <Box
              width={60}
              height={60}
              borderRadius="rFull"
              borderWidth={1}
              borderColor="goldA50"
              alignItems="center"
              justifyContent="center"
              marginBottom="s22">
              <Icon name="bag" size={26} color={palette.gold} />
            </Box>
            <Text variant="quote" fontSize={20} color="wineA70" marginBottom="s24">
              Sua sacola está vazia.
            </Text>
            <Button label="Explorar vinhos" variant="outline" onPress={() => router.navigate('/home')} />
          </Box>
        ) : (
          <>
            {/* itens */}
            <Box paddingHorizontal="s22" paddingTop="s22" style={{ gap: 14 }}>
              {ids.map(id => {
                const w = findWine(id);
                const qty = items[id];
                return (
                  <Box
                    key={id}
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor="surface"
                    borderWidth={1}
                    borderColor="inkBorder09"
                    borderRadius="r14"
                    paddingVertical="s14"
                    paddingHorizontal="s16"
                    style={{ gap: 16 }}>
                    <BottleGraphic width={30} cor={w.cor} iniciais={w.iniciais} showCap={false} />
                    <Box flex={1}>
                      <Text variant="wineNameSm" fontSize={19} style={{ lineHeight: 20 }}>
                        {w.nome}
                      </Text>
                      <Text
                        variant="label"
                        fontSize={8}
                        color="inkA50"
                        marginTop="s2"
                        style={{ letterSpacing: 1.2 }}>
                        {w.tipo} · {w.uva}
                      </Text>
                      <Box flexDirection="row" alignItems="center" marginTop="s10" style={{ gap: 12 }}>
                        <Box
                          flexDirection="row"
                          alignItems="center"
                          borderWidth={1}
                          borderColor="inkBorder20"
                          borderRadius="r8"
                          paddingVertical="s4"
                          paddingHorizontal="s10"
                          style={{ gap: 12 }}>
                          <TouchableOpacityBox activeOpacity={0.6} onPress={() => setQty(id, -1)}>
                            <Text style={{ fontSize: 16, color: palette.wine, lineHeight: 18 }}>−</Text>
                          </TouchableOpacityBox>
                          <Text fontSize={13} style={{ minWidth: 14, textAlign: 'center' }}>
                            {qty}
                          </Text>
                          <TouchableOpacityBox activeOpacity={0.6} onPress={() => setQty(id, 1)}>
                            <Text style={{ fontSize: 15, color: palette.wine, lineHeight: 18 }}>+</Text>
                          </TouchableOpacityBox>
                        </Box>
                        <Text color="primary" style={{ fontFamily: fonts.serifRegular, fontSize: 14 }}>
                          {brl(w.preco * qty)}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* sugestões */}
            <Box marginTop="s30">
              <Box paddingHorizontal="s22" marginBottom="s12">
                <Text variant="sectionTitle" fontSize={21}>
                  Combina com sua compra
                </Text>
              </Box>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 22, gap: 14 }}>
                {sugestoes.map(w => (
                  <TouchableOpacityBox key={w.id} activeOpacity={0.9} width={120} onPress={() => openWine(w.id)}>
                    <Box
                      height={150}
                      borderRadius="r12"
                      backgroundColor="surface"
                      borderWidth={1}
                      borderColor="inkBorder10"
                      alignItems="center"
                      justifyContent="flex-end">
                      <Box marginBottom="s8">
                        <BottleGraphic width={30} cor={w.cor} iniciais={w.iniciais} showCap={false} />
                      </Box>
                    </Box>
                    <Text variant="wineNameSm" marginTop="s8" style={{ lineHeight: 18 }}>
                      {w.nome}
                    </Text>
                    <Text variant="price" fontSize={12} marginTop="s2">
                      {brl(w.preco)}
                    </Text>
                  </TouchableOpacityBox>
                ))}
              </ScrollView>
            </Box>

            {/* resumo */}
            <Box
              marginTop="s30"
              marginHorizontal="s22"
              paddingTop="s20"
              borderTopWidth={1}
              borderTopColor="inkBorder10">
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                marginBottom="s16">
                <Text variant="body" fontSize={12} color="inkA60">
                  Subtotal · {count} {count === 1 ? 'item' : 'itens'}
                </Text>
                <Text color="primary" style={{ fontFamily: fonts.serifRegular, fontSize: 24 }}>
                  {brl(subtotal)}
                </Text>
              </Box>
              <Button
                label="Finalizar compra"
                variant="primary"
                fullWidth
                onPress={() => router.navigate('/checkout')}
              />
            </Box>
          </>
        )}
      </Box>
    </Screen>
  );
}
