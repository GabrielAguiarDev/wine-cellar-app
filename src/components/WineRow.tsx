import { type ReactNode } from 'react';

import { BottleGraphic } from './BottleGraphic';
import { Box, TouchableOpacityBox } from './Box';
import { Text } from './Text';

export type WineRowData = {
  name: string;
  /** Ex.: "Tinto · Nebbiolo" ou categoria completa. */
  category: string;
  priceFmt?: string;
  color: string;
  capColor?: string;
  initials: string;
};

type WineRowProps = {
  data: WineRowData;
  variant?: 'light' | 'dark';
  /** Etiqueta acima do nome (ex.: "◆ Especial", "Pré-lançamento"). */
  badge?: string;
  /** Linha secundária (ex.: "★ 4,7 · 128 avaliações"). */
  subtitle?: string;
  /** Largura da garrafa. */
  bottleWidth?: number;
  onPress?: () => void;
  /** Substitui o preço à direita (ex.: botões de favorito). */
  rightSlot?: ReactNode;
};

/**
 * Linha horizontal de vinho (mais vendidos, busca, sommelier, VIP, sacola…).
 * `light` = sobre creme; `dark` = sobre bordô.
 */
export function WineRow({
  data,
  variant = 'light',
  badge,
  subtitle,
  bottleWidth = 34,
  onPress,
  rightSlot,
}: WineRowProps) {
  const dark = variant === 'dark';

  return (
    <TouchableOpacityBox
      activeOpacity={0.9}
      onPress={onPress}
      flexDirection="row"
      alignItems="center"
      backgroundColor={dark ? 'cremeA06' : 'surface'}
      borderWidth={1}
      borderColor={dark ? 'goldA28' : 'inkBorder09'}
      borderRadius="r14"
      paddingVertical="s14"
      paddingHorizontal="s16"
      style={{ gap: 16 }}>
      <BottleGraphic
        width={bottleWidth}
        color={data.color}
        capColor={data.capColor}
        showCap={false}
        initials={data.initials}
      />
      <Box flex={1}>
        {badge && (
          <Text
            variant="eyebrow"
            fontSize={8}
            marginBottom="s4"
            style={{ letterSpacing: 1.6 }}>
            {badge}
          </Text>
        )}
        <Text
          variant="wineName"
          color={dark ? 'textOnDark' : 'textPrimary'}
          style={{ lineHeight: 21 }}>
          {data.name}
        </Text>
        <Text
          variant="label"
          fontSize={8.5}
          color={dark ? 'cremeA50' : 'inkA50'}
          marginTop="s4"
          style={{ letterSpacing: 1.3 }}>
          {data.category}
        </Text>
        {subtitle && (
          <Text fontSize={10} color="accent" marginTop="s6">
            {subtitle}
          </Text>
        )}
      </Box>
      {rightSlot ??
        (data.priceFmt ? (
          <Text variant="price" fontSize={15} color={dark ? 'accent' : 'primary'}>
            {data.priceFmt}
          </Text>
        ) : null)}
    </TouchableOpacityBox>
  );
}
