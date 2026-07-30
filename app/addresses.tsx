import { useRouter } from 'expo-router';

import {
  AnimatedHeaderScrollView,
  BackButton,
  Blip,
  Box,
  Icon,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { type SavedAddress } from '@data/index';
import { useGoBack } from '@hooks/useGoBack';
import { useAddressesStore, useToastStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import {
  addressLine,
  addressRegionLine,
  deliveryEstimate,
} from '@utils/address';

/**
 * Endereços — push da Stack raiz, aberta do Perfil.
 *
 * ── Por que a lista mostra PRAZO, e não só o endereço ───────────────────────
 *
 * Numa adega o endereço não é um dado de cadastro, é uma condição de entrega: o
 * mesmo pedido chega em 24h em São Paulo e em até 5 dias úteis em Porto Alegre
 * (`deliveryEstimate`, a mesma regra que a FAQ conta). Uma lista que só repete a
 * rua obriga a pessoa a descobrir isso no checkout, quando já escolheu. Aqui a
 * escolha de "onde receber" já vem com a consequência ao lado — e é por isso que
 * o prazo curto ganha `Blip` e cor de acento: ele é uma vantagem, não um aviso.
 *
 * Tocar o card define o endereço PADRÃO (o que o checkout usa). "Editar" e
 * "Remover" ficam explícitos no rodapé do card em vez de virarem gesto: swipe
 * para remover esconde a ação mais destrutiva da tela atrás de um gesto que não
 * se anuncia, e aqui não há lista longa que justifique economizar espaço.
 */
export default function AddressesScreen() {
  const router = useRouter();
  const goBack = useGoBack('/profile');
  const show = useToastStore(s => s.show);

  const addresses = useAddressesStore(s => s.addresses);
  const defaultId = useAddressesStore(s => s.defaultId);
  const setDefault = useAddressesStore(s => s.setDefault);
  const removeAddress = useAddressesStore(s => s.removeAddress);

  const remove = (address: SavedAddress) => {
    removeAddress(address.id);
    show(`${address.label} removido.`);
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AnimatedHeaderScrollView
        largeTitle="Endereços"
        leftComponent={<BackButton onPress={goBack} />}>
        <Box paddingBottom="s108">
          <Box marginHorizontal="s22" marginTop="s6">
            {addresses.length === 0 ? (
              <Box
                backgroundColor="surface"
                borderWidth={1}
                borderColor="inkBorder09"
                borderRadius="r14"
                paddingVertical="s24"
                paddingHorizontal="s20"
                alignItems="center">
                <Text variant="wineName" fontSize={18} color="primary">
                  Nenhum endereço salvo
                </Text>
                <Text
                  variant="body"
                  fontSize={12}
                  color="inkA55"
                  marginTop="s6"
                  style={{ textAlign: 'center' }}>
                  Cadastre onde você quer receber suas garrafas.
                </Text>
              </Box>
            ) : (
              <Box style={{ gap: 12 }}>
                {addresses.map(address => {
                  const isDefault = address.id === defaultId;
                  const estimate = deliveryEstimate(address.uf);

                  return (
                    <TouchableOpacityBox
                      key={address.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${address.label}, ${addressLine(address)}${isDefault ? ', endereço padrão' : '. Toque para tornar padrão'}`}
                      activeOpacity={0.9}
                      onPress={() => {
                        if (isDefault) {
                          return;
                        }
                        setDefault(address.id);
                        show(`Entregas em ${address.label}.`);
                      }}
                      backgroundColor="surface"
                      borderWidth={1}
                      borderColor={isDefault ? 'goldA50' : 'inkBorder09'}
                      borderRadius="r14"
                      paddingTop="s16"
                      paddingHorizontal="s16">
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        style={{ gap: 12 }}>
                        <Text variant="wineName" fontSize={18} color="primary">
                          {address.label}
                        </Text>
                        {isDefault && (
                          <Box
                            borderWidth={1}
                            borderColor="goldA50"
                            borderRadius="r8"
                            paddingVertical="s6"
                            paddingHorizontal="s10">
                            <Text
                              variant="label"
                              fontSize={8.5}
                              color="accentDark"
                              style={{ letterSpacing: 1.2 }}>
                              Padrão
                            </Text>
                          </Box>
                        )}
                      </Box>

                      <Text variant="body" fontSize={13} marginTop="s8">
                        {addressLine(address)}
                      </Text>
                      <Text
                        variant="body"
                        fontSize={11.5}
                        color="inkA55"
                        marginTop="s2">
                        {addressRegionLine(address)} · {address.cep}
                      </Text>

                      {/* prazo */}
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        marginTop="s12"
                        style={{ gap: 7 }}>
                        {estimate.express ? (
                          <Blip size={6} color={palette.gold} />
                        ) : (
                          <Box
                            width={6}
                            height={6}
                            borderRadius="rFull"
                            backgroundColor="inkA35"
                          />
                        )}
                        <Text
                          variant="label"
                          fontSize={9}
                          color={estimate.express ? 'accentDark' : 'inkA55'}
                          style={{ letterSpacing: 1.4 }}>
                          {estimate.label}
                        </Text>
                      </Box>

                      {!!address.notes && (
                        <Text
                          variant="body"
                          fontSize={11}
                          color="inkA50"
                          marginTop="s8"
                          style={{
                            fontFamily: fonts.serifItalic,
                            fontSize: 13,
                          }}>
                          {address.notes}
                        </Text>
                      )}

                      {/* ações */}
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        marginTop="s14"
                        paddingTop="s12"
                        paddingBottom="s14"
                        borderTopWidth={1}
                        borderTopColor="inkBorder09"
                        style={{ gap: 20 }}>
                        <TouchableOpacityBox
                          accessibilityRole="button"
                          accessibilityLabel={`Editar ${address.label}`}
                          activeOpacity={0.7}
                          onPress={() =>
                            router.navigate({
                              pathname: '/address-form',
                              params: { id: address.id },
                            })
                          }>
                          <Text
                            variant="label"
                            fontSize={9.5}
                            color="accentDark"
                            style={{ letterSpacing: 1.4 }}>
                            Editar
                          </Text>
                        </TouchableOpacityBox>
                        <TouchableOpacityBox
                          accessibilityRole="button"
                          accessibilityLabel={`Remover ${address.label}`}
                          activeOpacity={0.7}
                          onPress={() => remove(address)}>
                          <Text
                            variant="label"
                            fontSize={9.5}
                            color="inkA50"
                            style={{ letterSpacing: 1.4 }}>
                            Remover
                          </Text>
                        </TouchableOpacityBox>
                      </Box>
                    </TouchableOpacityBox>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* adicionar */}
          <Box marginHorizontal="s22" marginTop="s16">
            <TouchableOpacityBox
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => router.navigate('/address-form')}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor="primary"
              borderRadius="r9"
              paddingVertical="s16"
              style={{ gap: 10 }}>
              <Icon name="plus" size={15} color={palette.wine} />
              <Text variant="button" color="primary">
                Adicionar endereço
              </Text>
            </TouchableOpacityBox>
          </Box>

          {/* nota */}
          <Box marginHorizontal="s22" marginTop="s24">
            <Text
              variant="body"
              fontSize={11}
              color="inkA50"
              style={{ lineHeight: 17 }}>
              A entrega é feita a maiores de 18 anos, com assinatura e
              conferência do documento. Deixe no recado quem pode receber por
              você.
            </Text>
          </Box>
        </Box>
      </AnimatedHeaderScrollView>
    </Box>
  );
}
