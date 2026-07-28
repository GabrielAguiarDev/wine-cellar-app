import { fonts, palette } from '@theme/index';

import { Box } from './Box';
import { Text } from './Text';

/**
 * Wordmark IL DiVino. É tipográfico, não imagem: Cormorant com tracking largo,
 * mais a linha "Adega Prime" em eyebrow.
 *
 * Tudo escala a partir de `size`, com as proporções do lockup original da
 * Home (corpo 22 / tracking 2.6 / tagline 8 em tracking 3.2). Ou seja,
 * `<Logo />` reproduz exatamente o header antigo.
 */
type LogoProps = {
  /** Corpo do wordmark. O resto do lockup deriva daqui. */
  size?: number;
  /** Mostra a linha "Adega Prime". Desligar em espaços apertados. */
  tagline?: boolean;
};

export function Logo({ size = 22, tagline = true }: LogoProps) {
  return (
    <Box alignItems="center">
      <Text
        style={{
          fontFamily: fonts.serifSemiBold,
          fontSize: size,
          letterSpacing: size * 0.118,
          color: palette.wine,
        }}>
        IL DIVINO
      </Text>
      {tagline && (
        <Text
          variant="eyebrow"
          fontSize={size * 0.364}
          marginTop="s2"
          style={{ letterSpacing: size * 0.145 }}>
          Adega Prime
        </Text>
      )}
    </Box>
  );
}
