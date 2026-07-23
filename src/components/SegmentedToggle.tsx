import { Box, TouchableOpacityBox } from './Box';
import { Text } from './Text';

type SegmentedOption<T extends string> = {
  key: T;
  label: string;
};

type SegmentedToggleProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (key: T) => void;
};

/** Alternador segmentado de 2+ opções (busca vinho/prato, status/mapa). */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: SegmentedToggleProps<T>) {
  return (
    <Box
      flexDirection="row"
      backgroundColor="toggleTrack"
      borderRadius="r11"
      padding="s4"
      style={{ gap: 4 }}>
      {options.map(opt => {
        const active = opt.key === value;
        return (
          <TouchableOpacityBox
            key={opt.key}
            activeOpacity={0.85}
            onPress={() => onChange(opt.key)}
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingVertical="s10"
            borderRadius="r8"
            backgroundColor={active ? 'primary' : 'transparent'}>
            <Text
              variant="label"
              fontSize={11}
              color={active ? 'textOnDark' : 'inkA55'}
              style={{ letterSpacing: 1.6 }}>
              {opt.label}
            </Text>
          </TouchableOpacityBox>
        );
      })}
    </Box>
  );
}
