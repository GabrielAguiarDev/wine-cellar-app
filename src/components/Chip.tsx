import { Box, TouchableOpacityBox } from './Box';
import { Text } from './Text';

type ChipProps = {
  label: string;
  onPress?: () => void;
};

/** Chip de filtro com indicador de dropdown (Uva, País, Preço…). */
export function Chip({ label, onPress }: ChipProps) {
  return (
    <TouchableOpacityBox
      activeOpacity={0.8}
      onPress={onPress}
      flexDirection="row"
      alignItems="center"
      borderWidth={1}
      borderColor="inkBorder16"
      borderRadius="r8"
      paddingVertical="s8"
      paddingHorizontal="s12"
      style={{ gap: 6 }}>
      <Text
        variant="label"
        fontSize={9.5}
        color="inkA55"
        style={{ letterSpacing: 1.3 }}>
        {label}
      </Text>
      <Box>
        <Text fontSize={11} color="inkA55">
          ⌄
        </Text>
      </Box>
    </TouchableOpacityBox>
  );
}
