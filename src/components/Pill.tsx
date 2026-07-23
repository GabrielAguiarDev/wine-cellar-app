import { TouchableOpacityBox } from './Box';
import { Text } from './Text';

type PillProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

/** Chip de categoria (Todos/Tinto/Branco/Rosé/Espumante). */
export function Pill({ label, active = false, onPress }: PillProps) {
  return (
    <TouchableOpacityBox
      activeOpacity={0.8}
      onPress={onPress}
      backgroundColor={active ? 'primary' : 'transparent'}
      borderWidth={1}
      borderColor={active ? 'primary' : 'inkBorder20'}
      borderRadius="r9"
      paddingVertical="s10"
      paddingHorizontal="s18">
      <Text
        variant="label"
        fontSize={10.5}
        color={active ? 'textOnDark' : 'primary'}
        style={{ letterSpacing: 1.8 }}>
        {label}
      </Text>
    </TouchableOpacityBox>
  );
}
