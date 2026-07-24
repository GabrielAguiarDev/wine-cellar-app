import { useState } from 'react';

import { Platform, TextInput } from 'react-native';

import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  Box,
  Button,
  Icon,
  Screen,
  Text,
  Toggle,
  TouchableOpacityBox,
} from '@components/index';
import { cartSubtotal } from '@data/index';
import { useCartStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brandHeaderOptions } from '@theme/navHeader';
import { brl, checkoutTotal, frete, pointsDiscount } from '@utils/index';

type PagamentoMetodo = 'pix' | 'card' | 'boleto';
const PAGAMENTOS: { key: PagamentoMetodo; label: string }[] = [
  { key: 'pix', label: 'Pix' },
  { key: 'card', label: 'Cartão' },
  { key: 'boleto', label: 'Boleto' },
];

function CardBox({ children }: { children: React.ReactNode }) {
  return (
    <Box
      marginHorizontal="s22"
      marginTop="s14"
      backgroundColor="surface"
      borderWidth={1}
      borderColor="inkBorder10"
      borderRadius="r14"
      padding="s18">
      {children}
    </Box>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const items = useCartStore(s => s.items);
  const clear = useCartStore(s => s.clear);

  const [pm, setPm] = useState<PagamentoMetodo>('pix');
  const [usePoints, setUsePoints] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftMsg, setGiftMsg] = useState('');
  const [hidePrice, setHidePrice] = useState(false);
  const [giftDate, setGiftDate] = useState(() => new Date('2026-08-02T12:00:00'));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const giftDateLabel = giftDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const subtotal = cartSubtotal(items);
  const hasItems = Object.keys(items).length > 0;
  const desconto = pointsDiscount(subtotal, usePoints);
  const freteValor = hasItems ? frete(subtotal) : 0;
  const total = checkoutTotal(subtotal, usePoints, hasItems);

  const placeOrder = () => {
    clear();
    router.replace('/processing');
  };

  return (
    <Screen scroll nativeHeader>
      <Stack.Screen options={{ ...brandHeaderOptions, title: 'Checkout' }} />
      <Box paddingBottom="s40" paddingTop="s6">
        {/* endereço */}
        <CardBox>
          <Text variant="eyebrow" marginBottom="s8">
            Entrega
          </Text>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1}>
              <Text variant="body" fontSize={14} style={{ fontFamily: fonts.sansMedium }}>
                Helena Prado · Casa
              </Text>
              <Text variant="body" fontSize={12} color="inkA60" marginTop="s2">
                Rua das Videiras, 240 · Porto Alegre
              </Text>
            </Box>
            <Text variant="body" fontSize={11} color="accentDark" style={{ letterSpacing: 1 }}>
              Alterar
            </Text>
          </Box>
        </CardBox>

        {/* pagamento */}
        <CardBox>
          <Text variant="eyebrow" marginBottom="s12">
            Pagamento
          </Text>
          <SegmentedControl
            values={PAGAMENTOS.map(p => p.label)}
            selectedIndex={PAGAMENTOS.findIndex(p => p.key === pm)}
            onChange={e =>
              setPm(PAGAMENTOS[e.nativeEvent.selectedSegmentIndex].key)
            }
            tintColor={palette.wine}
          />
        </CardBox>

        {/* pontos */}
        <CardBox>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} marginRight="s12">
              <Text variant="body" fontSize={14} style={{ fontFamily: fonts.sansMedium }}>
                Usar 320 pontos de fidelidade
              </Text>
              <Text variant="body" fontSize={11} color="inkA55" marginTop="s2">
                Desconto de {brl(pointsDiscount(subtotal || 64, true))}
              </Text>
            </Box>
            <Toggle value={usePoints} onChange={setUsePoints} />
          </Box>
        </CardBox>

        {/* gifting */}
        <CardBox>
          <TouchableOpacityBox
            activeOpacity={0.9}
            onPress={() => setIsGift(v => !v)}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <Box flex={1} marginRight="s12">
              <Text variant="body" fontSize={14} style={{ fontFamily: fonts.sansMedium }}>
                Isso é um presente?
              </Text>
              <Text variant="body" fontSize={11} color="inkA55" marginTop="s2">
                Cartão, embalagem sem preço e data de entrega
              </Text>
            </Box>
            <Toggle value={isGift} onChange={setIsGift} />
          </TouchableOpacityBox>

          {isGift && (
            <Animated.View entering={FadeInDown.duration(280)}>
            <Box marginTop="s16" paddingTop="s16" borderTopWidth={1} borderTopColor="inkBorder10">
              <TextInput
                value={giftMsg}
                onChangeText={setGiftMsg}
                placeholder="Mensagem do cartão…"
                placeholderTextColor={palette.mutedIcon}
                multiline
                style={{
                  minHeight: 60,
                  borderWidth: 1,
                  borderColor: 'rgba(42,33,28,0.16)',
                  backgroundColor: palette.white,
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingTop: 12,
                  fontFamily: fonts.serifItalic,
                  fontSize: 16,
                  color: palette.ink,
                  textAlignVertical: 'top',
                }}
              />
              <TouchableOpacityBox
                activeOpacity={0.8}
                onPress={() => setHidePrice(v => !v)}
                flexDirection="row"
                alignItems="center"
                marginTop="s14"
                style={{ gap: 10 }}>
                <Box
                  width={20}
                  height={20}
                  borderRadius="r6"
                  borderWidth={1}
                  borderColor={hidePrice ? 'primary' : 'inkBorder20'}
                  backgroundColor={hidePrice ? 'primary' : 'transparent'}
                  alignItems="center"
                  justifyContent="center">
                  {hidePrice && <Icon name="check" size={11} color={palette.creme} />}
                </Box>
                <Text variant="body" fontSize={13}>
                  Ocultar preço na nota fiscal
                </Text>
              </TouchableOpacityBox>
              <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="s14">
                <Text variant="body" fontSize={13}>
                  Data de entrega
                </Text>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={giftDate}
                    mode="date"
                    display="compact"
                    accentColor={palette.wine}
                    onValueChange={(_e, date) => setGiftDate(date)}
                  />
                ) : (
                  <TouchableOpacityBox
                    activeOpacity={0.8}
                    onPress={() => setShowDatePicker(true)}
                    borderWidth={1}
                    borderColor="inkBorder20"
                    borderRadius="r8"
                    paddingVertical="s8"
                    paddingHorizontal="s12">
                    <Text variant="body" fontSize={13} color="primary">
                      {giftDateLabel}
                    </Text>
                  </TouchableOpacityBox>
                )}
              </Box>
              {Platform.OS !== 'ios' && showDatePicker && (
                <DateTimePicker
                  value={giftDate}
                  mode="date"
                  presentation="dialog"
                  accentColor={palette.wine}
                  onValueChange={(_e, date) => {
                    setGiftDate(date);
                    setShowDatePicker(false);
                  }}
                  onDismiss={() => setShowDatePicker(false)}
                />
              )}
            </Box>
            </Animated.View>
          )}
        </CardBox>

        {/* resumo */}
        <Box
          marginTop="s20"
          marginHorizontal="s22"
          paddingTop="s18"
          borderTopWidth={1}
          borderTopColor="inkBorder10">
          <ResumoLinha label="Subtotal" valor={brl(subtotal)} />
          {usePoints && (
            <ResumoLinha label="Pontos de fidelidade" valor={`− ${brl(desconto)}`} destaque />
          )}
          <ResumoLinha
            label="Frete"
            valor={hasItems && freteValor ? brl(freteValor) : 'Grátis'}
          />
          <Box flexDirection="row" alignItems="baseline" justifyContent="space-between" marginTop="s8">
            <Text variant="label" fontSize={11} color="primary" style={{ letterSpacing: 2 }}>
              Total
            </Text>
            <Text color="primary" style={{ fontFamily: fonts.serifRegular, fontSize: 30 }}>
              {brl(total)}
            </Text>
          </Box>
          <Box marginTop="s18">
            <Button label="Confirmar pedido" variant="primary" fullWidth onPress={placeOrder} />
          </Box>
        </Box>
      </Box>
    </Screen>
  );
}

function ResumoLinha({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <Box flexDirection="row" justifyContent="space-between" marginBottom="s8">
      <Text variant="body" fontSize={13} color={destaque ? 'accentDark' : 'inkA65'}>
        {label}
      </Text>
      <Text variant="body" fontSize={13} color={destaque ? 'accentDark' : 'inkA65'}>
        {valor}
      </Text>
    </Box>
  );
}
