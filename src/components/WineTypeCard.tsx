import { LinearGradient } from 'expo-linear-gradient';

import { palette } from '@theme/index';

import { Box, TouchableOpacityBox } from './Box';
import { Icon } from './Icon';
import { Text } from './Text';

export type WineTypeCardData = {
  /** Rótulo do tipo (Tinto, Branco…). */
  label: string;
  /** Quantidade de rótulos do tipo no catálogo. */
  count: number;
  /** Par de cores do líquido (claro → escuro) usado no swatch. */
  colors: [string, string];
};

type WineTypeCardProps = {
  data: WineTypeCardData;
  onPress?: () => void;
};

/**
 * Atalho de categoria da Home. Leva para a busca já filtrada — por isso é um
 * card com seta, e não um chip: chip com estado ativo dá a entender que o
 * conteúdo é filtrado ali mesmo.
 */
export function WineTypeCard({ data, onPress }: WineTypeCardProps) {
  const { label, count, colors } = data;

  return (
    <TouchableOpacityBox
      accessibilityRole="button"
      accessibilityLabel={`Ver ${label.toLowerCase()}s na busca, ${count} rótulos`}
      activeOpacity={0.85}
      onPress={onPress}
      width={140}
      backgroundColor="surface"
      borderWidth={1}
      borderColor="inkBorder10"
      borderRadius="r13"
      paddingVertical="s14"
      paddingHorizontal="s14">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        {/* swatch do líquido */}
        <Box
          width={26}
          height={26}
          borderRadius="rFull"
          overflow="hidden"
          borderWidth={1}
          borderColor="goldA30">
          <LinearGradient
            colors={colors}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{ flex: 1 }}
          />
        </Box>
        <Icon name="arrowRight" size={11} color={palette.gold} />
      </Box>

      <Text variant="wineName" fontSize={19} marginTop="s10" style={{ lineHeight: 21 }}>
        {label}
      </Text>
      <Text
        variant="label"
        fontSize={8.5}
        color="inkA50"
        marginTop="s2"
        style={{ letterSpacing: 1.3 }}>
        {count} {count === 1 ? 'rótulo' : 'rótulos'}
      </Text>
    </TouchableOpacityBox>
  );
}
