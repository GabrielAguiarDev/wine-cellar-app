import { StyleSheet } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Box, TouchableOpacityBox } from './Box';
import { Flag } from './Flag';
import { Text } from './Text';

/** Bordô do véu sobre a bandeira (`palette.wineDeep` com alfa). */
const VEIL = 'rgba(44,10,16,';

/**
 * Sombra do texto sobre a bandeira. É ela que segura a legibilidade — assim o
 * véu pode ficar discreto (a bandeira é o assunto do card, não o overlay).
 */
const TEXT_SHADOW = {
  textShadowColor: `${VEIL}0.85)`,
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 6,
} as const;

export const COUNTRY_CARD_WIDTH = 132;
const CARD_HEIGHT = 84;

export type WineCountryCardData = {
  /** Nome do país como vem do catálogo (`wineCountry`). */
  country: string;
  /** Quantidade de rótulos do país no catálogo. */
  count: number;
};

type WineCountryCardProps = {
  data: WineCountryCardData;
  onPress?: () => void;
};

/**
 * Atalho de país da Home. Leva para a busca já filtrada — a bandeira ocupa o
 * card inteiro e o nome vem sobre ela: é a bandeira que identifica o atalho de
 * relance, o texto só confirma. O véu bordô existe por dois motivos: garante
 * contraste do nome sobre qualquer cor de bandeira e mantém as cores nacionais
 * (saturadas) dentro da paleta sóbria do app.
 */
export function WineCountryCard({ data, onPress }: WineCountryCardProps) {
  const { country, count } = data;

  return (
    <TouchableOpacityBox
      accessibilityRole="button"
      accessibilityLabel={`${country}: ver ${count} ${count === 1 ? 'rótulo' : 'rótulos'} na busca`}
      activeOpacity={0.85}
      onPress={onPress}
      width={COUNTRY_CARD_WIDTH}
      height={CARD_HEIGHT}
      borderRadius="r13"
      overflow="hidden"
      borderWidth={1}
      borderColor="goldA35">
      <Flag
        country={country}
        width={COUNTRY_CARD_WIDTH}
        height={CARD_HEIGHT}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[`${VEIL}0)`, `${VEIL}0.22)`, `${VEIL}0.82)`]}
        locations={[0, 0.32, 0.82]}
        style={StyleSheet.absoluteFill}
      />

      <Box flex={1} justifyContent="flex-end" padding="s10">
        <Text
          variant="wineName"
          fontSize={17}
          color="textOnDark"
          style={{ lineHeight: 19, ...TEXT_SHADOW }}>
          {country}
        </Text>
        <Text
          variant="label"
          fontSize={8}
          color="cremeA82"
          marginTop="s2"
          style={{ letterSpacing: 1.3, ...TEXT_SHADOW }}>
          {count} {count === 1 ? 'rótulo' : 'rótulos'}
        </Text>
      </Box>
    </TouchableOpacityBox>
  );
}
