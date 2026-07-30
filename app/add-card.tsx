import { useRef, useState } from 'react';

import { TextInput, useWindowDimensions } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
  AnimatedHeaderScrollView,
  BackButton,
  Box,
  Button,
  FlipCard,
  Text,
  TextField,
} from '@components/index';
import { useGoBack } from '@hooks/useGoBack';
import { useCardsStore, useToastStore, useUserStore } from '@store/index';
import { alpha, fonts, palette } from '@theme/index';
import {
  CARD_BRAND_LABEL,
  cardBrand,
  cardCvvLength,
  cardLast4,
  cardNumberPreview,
  formatCardNumber,
  formatExpiry,
  isCardNumberComplete,
  isCvvComplete,
  isExpiryComplete,
} from '@utils/card';

/** Proporção ISO 7810 ID-1 — a de um cartão de verdade. */
const CARD_RATIO = 1.586;
const MAX_CARD_WIDTH = 340;

/**
 * Novo cartão — push da Stack raiz, aberta de `/payment-methods`.
 *
 * Tela própria (e não um formulário que expande na lista) porque é uma TAREFA com
 * começo e fim: o cartão preenchido pela metade não convive com a lista de
 * cartões salvos, e o voltar já é o "cancelar" — não precisa de um segundo botão
 * dizendo a mesma coisa. Push normal, não modal: no iOS uma rota apresentada como
 * modal contamina as próximas da pilha (a armadilha documentada em `_layout.tsx`),
 * e o padrão de header desta tela é o mesmo de todas as outras.
 *
 * ── Por que o cadastro é um FlipCard ────────────────────────────────────────
 *
 * O CVV é o único dado que não está na frente do cartão, e todo mundo já virou um
 * cartão na mão para achá-lo. Então a face de trás não é enfeite: ela é a
 * instrução. O foco no campo do CVV vira o cartão (por isso o `FlipCard` ganhou
 * modo CONTROLADO no porte) e mostra exatamente onde o número está — a tarja, a
 * faixa de assinatura e o número à direita dela.
 *
 * O toque no cartão também vira, para quem quiser conferir antes de digitar. Aí o
 * `onFlip` tem de TIRAR o foco do CVV: sem isso o campo focado puxaria a face de
 * trás de volta no mesmo instante e o cartão pareceria travado.
 */
export default function AddCardScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const goBack = useGoBack('/payment-methods');
  const show = useToastStore(s => s.show);
  const addCard = useCardsStore(s => s.addCard);
  // Só de PLACEHOLDER: o titular do cartão não é necessariamente quem compra
  // (cartão do cônjuge, cartão da empresa), então sugerir é ajudar e preencher
  // seria errar calado.
  const accountName = useUserStore(s => s.profile.name);

  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const cvvRef = useRef<TextInput>(null);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [manualBack, setManualBack] = useState(false);

  const cardWidth = Math.min(windowWidth - 44, MAX_CARD_WIDTH);
  const cardHeight = Math.round(cardWidth / CARD_RATIO);

  const brand = cardBrand(number);
  const showBack = cvvFocused || manualBack;
  const complete =
    isCardNumberComplete(number) &&
    holder.trim().length > 2 &&
    isExpiryComplete(expiry) &&
    isCvvComplete(cvv, brand);

  const onFlip = (next: boolean) => {
    if (!next) {
      cvvRef.current?.blur();
    }
    setManualBack(next);
  };

  const save = () => {
    addCard({
      brand,
      last4: cardLast4(number),
      holder: holder.trim(),
      expiry,
    });
    show('Cartão adicionado.');
    goBack();
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AnimatedHeaderScrollView
        largeTitle="Novo cartão"
        leftComponent={<BackButton onPress={goBack} />}
        adjustsForKeyboard>
        <Box paddingBottom="s52">
          <Box marginTop="s6" alignItems="center">
            <FlipCard
              width={cardWidth}
              height={cardHeight}
              borderRadius="r16"
              flipped={showBack}
              onFlip={onFlip}>
              {/* frente */}
              <FlipCard.Front
                style={{ borderWidth: 1, borderColor: alpha.goldA35 }}>
                <LinearGradient
                  colors={[palette.wineLight, palette.wine, palette.wineDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, padding: 20 }}>
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between">
                    <Text variant="eyebrow">IL DiVino</Text>
                    <Text
                      variant="label"
                      fontSize={9}
                      color="cremeA70"
                      style={{ letterSpacing: 1.4 }}>
                      {CARD_BRAND_LABEL[brand]}
                    </Text>
                  </Box>

                  {/* chip */}
                  <Box
                    marginTop="s16"
                    width={34}
                    height={24}
                    borderRadius="r6"
                    borderWidth={1}
                    borderColor="goldA50"
                    backgroundColor="cremeA08"
                  />

                  <Text
                    color="textOnDark"
                    marginTop="s14"
                    style={{
                      fontFamily: fonts.sansMedium,
                      fontSize: cardWidth > 320 ? 17 : 15.5,
                      letterSpacing: 1.6,
                    }}>
                    {cardNumberPreview(number)}
                  </Text>

                  <Box
                    flex={1}
                    flexDirection="row"
                    alignItems="flex-end"
                    justifyContent="space-between"
                    style={{ gap: 16 }}>
                    <Box flex={1}>
                      <Text
                        variant="label"
                        fontSize={8}
                        color="cremeA50"
                        style={{ letterSpacing: 1.6 }}>
                        Titular
                      </Text>
                      <Text
                        color="cremeA82"
                        numberOfLines={1}
                        marginTop="s2"
                        style={{
                          fontFamily: fonts.sansRegular,
                          fontSize: 12,
                          letterSpacing: 0.8,
                        }}>
                        {holder.trim()
                          ? holder.trim().toUpperCase()
                          : 'NOME NO CARTÃO'}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        variant="label"
                        fontSize={8}
                        color="cremeA50"
                        style={{ letterSpacing: 1.6 }}>
                        Validade
                      </Text>
                      <Text
                        color="cremeA82"
                        marginTop="s2"
                        style={{
                          fontFamily: fonts.sansRegular,
                          fontSize: 12,
                          letterSpacing: 0.8,
                        }}>
                        {expiry || 'MM/AA'}
                      </Text>
                    </Box>
                  </Box>
                </LinearGradient>
              </FlipCard.Front>

              {/* verso */}
              <FlipCard.Back
                style={{ borderWidth: 1, borderColor: alpha.goldA35 }}>
                <LinearGradient
                  colors={[palette.wine, palette.wineDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, paddingVertical: 18 }}>
                  {/* tarja magnética */}
                  <Box height={38} backgroundColor="videoBackdrop" />

                  <Box paddingHorizontal="s20" marginTop="s18">
                    <Box flexDirection="row" alignItems="center">
                      {/* faixa de assinatura */}
                      <Box
                        flex={1}
                        height={30}
                        backgroundColor="cremeA15"
                        borderRadius="r5"
                      />
                      <Box
                        marginLeft="s10"
                        minWidth={58}
                        height={30}
                        borderRadius="r5"
                        backgroundColor="surface"
                        alignItems="center"
                        justifyContent="center"
                        paddingHorizontal="s8">
                        <Text
                          color="textPrimary"
                          style={{
                            fontFamily: fonts.sansMedium,
                            fontSize: 13,
                            letterSpacing: 2,
                          }}>
                          {cvv || '•'.repeat(cardCvvLength(brand))}
                        </Text>
                      </Box>
                    </Box>
                    <Text
                      variant="body"
                      fontSize={10}
                      color="cremeA55"
                      marginTop="s10">
                      Os {cardCvvLength(brand)} dígitos ao lado da faixa de
                      assinatura.
                    </Text>
                  </Box>
                </LinearGradient>
              </FlipCard.Back>

              <FlipCard.Trigger
                accessibilityLabel={
                  showBack ? 'Ver a frente do cartão' : 'Ver o verso do cartão'
                }
              />
            </FlipCard>
          </Box>

          {/* formulário */}
          <Box marginHorizontal="s22" marginTop="s24" style={{ gap: 14 }}>
            <TextField
              label="Número do cartão"
              value={number}
              onChangeText={v => setNumber(formatCardNumber(v))}
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              maxLength={19}
            />
            <TextField
              label="Nome impresso no cartão"
              value={holder}
              onChangeText={setHolder}
              placeholder={accountName}
              autoCapitalize="words"
            />
            <Box flexDirection="row" style={{ gap: 12 }}>
              <TextField
                label="Validade"
                value={expiry}
                onChangeText={v => setExpiry(formatExpiry(v))}
                placeholder="MM/AA"
                keyboardType="number-pad"
                maxLength={5}
              />
              <TextField
                label="CVV"
                value={cvv}
                onChangeText={v =>
                  setCvv(v.replace(/\D+/g, '').slice(0, cardCvvLength(brand)))
                }
                placeholder={'•'.repeat(cardCvvLength(brand))}
                keyboardType="number-pad"
                maxLength={cardCvvLength(brand)}
                inputRef={cvvRef}
                onFocus={() => setCvvFocused(true)}
                onBlur={() => setCvvFocused(false)}
              />
            </Box>

            <Box marginTop="s6">
              <Button
                label="Salvar cartão"
                variant="primary"
                fullWidth
                disabled={!complete}
                onPress={save}
              />
            </Box>

            <Text
              variant="body"
              fontSize={11}
              color="inkA50"
              marginTop="s6"
              style={{ lineHeight: 17 }}>
              Guardamos apenas a bandeira, os quatro últimos dígitos e a
              validade. O CVV é usado na cobrança e não fica salvo.
            </Text>
          </Box>
        </Box>
      </AnimatedHeaderScrollView>
    </Box>
  );
}
