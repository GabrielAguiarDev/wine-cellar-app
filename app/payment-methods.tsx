import { useRouter } from 'expo-router';

import {
  AnimatedHeaderScrollView,
  BackButton,
  Box,
  Icon,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { type SavedCard } from '@data/index';
import { useGoBack } from '@hooks/useGoBack';
import { useCardsStore, useToastStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { CARD_BRAND_LABEL, CARD_BRAND_SHORT } from '@utils/card';

/**
 * Selo da bandeira em TEXTO — não há logo de terceiro no projeto para imitar, e
 * desenhar um parecido seria pior que escrever o nome. Rótulo curto
 * (`CARD_BRAND_SHORT`) porque "MASTERCARD" quebra em duas linhas aqui.
 */
function BrandMark({ brand }: { brand: SavedCard['brand'] }) {
  return (
    <Box
      width={46}
      height={30}
      borderWidth={1}
      borderColor="goldA50"
      borderRadius="r6"
      alignItems="center"
      justifyContent="center">
      <Text
        variant="label"
        fontSize={8}
        color="accentDark"
        numberOfLines={1}
        style={{ letterSpacing: 0.6 }}>
        {CARD_BRAND_SHORT[brand]}
      </Text>
    </Box>
  );
}

/**
 * Pagamento — push da Stack raiz, aberta do Perfil.
 *
 * Header igual ao de `/loyalty` e `/notifications` (`AnimatedHeaderScrollView` +
 * `BackButton` no `leftComponent`).
 *
 * **Título "Pagamento", não "Formas de pagamento"**: o crescimento do título
 * grande no overscroll é limitado ao que couber em UMA linha (ver
 * `maxOverscrollGrowth` no `AnimatedHeaderScrollView`), então um título que já
 * nasce quebrado em duas fica sem efeito algum e come a altura de duas linhas na
 * barra. A linha do Perfil continua sendo "Formas de pagamento" — ela é o nome do
 * assunto, o título é o nome da tela.
 *
 * O cadastro NÃO mora aqui: é `/add-card`. Um formulário que expande dentro da
 * lista deixa cartão salvo e cartão pela metade na mesma tela, e obriga um botão
 * "Cancelar" que o voltar já resolve.
 */
export default function PaymentMethodsScreen() {
  const router = useRouter();
  const goBack = useGoBack('/profile');
  const show = useToastStore(s => s.show);

  const cards = useCardsStore(s => s.cards);
  const primaryId = useCardsStore(s => s.primaryId);
  const setPrimary = useCardsStore(s => s.setPrimary);
  const removeCard = useCardsStore(s => s.removeCard);

  return (
    <Box flex={1} backgroundColor="background">
      <AnimatedHeaderScrollView
        largeTitle="Pagamento"
        leftComponent={<BackButton onPress={goBack} />}>
        <Box paddingBottom="s108">
          {/* cartões salvos */}
          <Box marginHorizontal="s22" marginTop="s6">
            {cards.length === 0 ? (
              <Box
                backgroundColor="surface"
                borderWidth={1}
                borderColor="inkBorder09"
                borderRadius="r14"
                paddingVertical="s24"
                paddingHorizontal="s20"
                alignItems="center">
                <Text variant="wineName" fontSize={18} color="primary">
                  Nenhum cartão salvo
                </Text>
                <Text
                  variant="body"
                  fontSize={12}
                  color="inkA55"
                  marginTop="s6"
                  style={{ textAlign: 'center' }}>
                  Cadastre um cartão para fechar a compra em um toque.
                </Text>
              </Box>
            ) : (
              <Box style={{ gap: 10 }}>
                {cards.map(card => {
                  const isPrimary = card.id === primaryId;

                  return (
                    <TouchableOpacityBox
                      key={card.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${CARD_BRAND_LABEL[card.brand]} terminado em ${card.last4}${isPrimary ? ', cartão principal' : ''}`}
                      activeOpacity={0.85}
                      onPress={() => {
                        if (isPrimary) {
                          return;
                        }
                        setPrimary(card.id);
                        show('Cartão principal atualizado.');
                      }}
                      flexDirection="row"
                      alignItems="center"
                      backgroundColor="surface"
                      borderWidth={1}
                      borderColor={isPrimary ? 'goldA50' : 'inkBorder09'}
                      borderRadius="r14"
                      paddingVertical="s16"
                      paddingHorizontal="s16"
                      style={{ gap: 14 }}>
                      <BrandMark brand={card.brand} />
                      <Box flex={1}>
                        <Text
                          variant="body"
                          fontSize={14}
                          style={{
                            fontFamily: fonts.sansMedium,
                            letterSpacing: 1,
                          }}>
                          •••• {card.last4}
                        </Text>
                        <Text
                          variant="body"
                          fontSize={11}
                          color="inkA50"
                          marginTop="s2">
                          {card.holder} · vence {card.expiry}
                        </Text>
                      </Box>
                      {isPrimary ? (
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
                            Principal
                          </Text>
                        </Box>
                      ) : (
                        <TouchableOpacityBox
                          accessibilityRole="button"
                          accessibilityLabel={`Remover cartão terminado em ${card.last4}`}
                          activeOpacity={0.7}
                          onPress={() => {
                            removeCard(card.id);
                            show('Cartão removido.');
                          }}
                          paddingVertical="s6"
                          paddingHorizontal="s6">
                          <Text variant="body" fontSize={11} color="inkA50">
                            Remover
                          </Text>
                        </TouchableOpacityBox>
                      )}
                    </TouchableOpacityBox>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* adicionar cartão */}
          <Box marginHorizontal="s22" marginTop="s16">
            <TouchableOpacityBox
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => router.navigate('/add-card')}
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
                Adicionar cartão
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
              Pix e boleto continuam disponíveis no fechamento da compra, sem
              cadastro. Os dados do cartão são usados apenas para a cobrança do
              pedido.
            </Text>
          </Box>
        </Box>
      </AnimatedHeaderScrollView>
    </Box>
  );
}
