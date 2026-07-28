import { palette } from '@theme/index';

import { BottleGraphic } from './BottleGraphic';
import { Box, TouchableOpacityBox } from './Box';
import { Icon } from './Icon';
import { Text } from './Text';


export type WineCardData = {
  name: string;
  /** Ex.: "Tinto · Nebbiolo". */
  category: string;
  priceFmt: string;
  ratingFmt: string;
  color: string;
  capColor?: string;
  initials: string;
  featured?: boolean;
  favorite?: boolean;
};

type WineCardProps = {
  data: WineCardData;
  onPress?: () => void;
  onToggleFav?: () => void;
};

/** Card vertical do rail "Selecionados para você". */
export function WineCard({ data, onPress, onToggleFav }: WineCardProps) {
  return (
    <TouchableOpacityBox activeOpacity={0.9} onPress={onPress} width={150}>
      {/* moldura da garrafa */}
      <Box
        height={210}
        borderRadius="r13"
        backgroundColor="surface"
        borderWidth={1}
        borderColor="inkBorder10"
        alignItems="center"
        justifyContent="flex-end"
        overflow="hidden"
        position="relative">
        {data.featured && (
          <Box
            position="absolute"
            top={10}
            left={10}
            borderWidth={1}
            borderColor="goldA55"
            borderRadius="r5"
            paddingVertical="s2"
            paddingHorizontal="s6">
            <Text variant="eyebrow" fontSize={8} style={{ letterSpacing: 1.6 }}>
              Especial
            </Text>
          </Box>
        )}
        <TouchableOpacityBox
          position="absolute"
          top={8}
          right={8}
          zIndex={2}
          padding="s4"
          activeOpacity={0.7}
          onPress={onToggleFav}>
          <Icon
            name="heart"
            size={17}
            color={palette.wine}
            fill={data.favorite ? palette.wine : 'none'}
          />
        </TouchableOpacityBox>
        <Box marginBottom="s6">
          <BottleGraphic
            width={46}
            color={data.color}
            capColor={data.capColor}
            initials={data.initials}
          />
        </Box>
      </Box>
      {/* infos */}
      <Text variant="wineName" fontSize={19} marginTop="s8" style={{ lineHeight: 20 }}>
        {data.name}
      </Text>
      <Text
        variant="label"
        fontSize={8.5}
        color="inkA50"
        marginTop="s2"
        style={{ letterSpacing: 1.3 }}>
        {data.category}
      </Text>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginTop="s8">
        <Text variant="price" fontSize={13}>
          {data.priceFmt}
        </Text>
        <Text fontSize={10} color="accent">
          ★ {data.ratingFmt}
        </Text>
      </Box>
    </TouchableOpacityBox>
  );
}
