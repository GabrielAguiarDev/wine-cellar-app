import { TouchableOpacityBox } from './Box';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'outline' | 'outlineGold';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
};

/**
 * CTA do design. Variantes:
 * - primary: fundo bordô, texto creme (telas claras).
 * - outline: contorno bordô, texto bordô (telas claras).
 * - outlineGold: contorno dourado, texto creme (telas escuras).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const borderColor = variant === 'outlineGold' ? 'accent' : 'primary';
  const textColor = isPrimary || variant === 'outlineGold' ? 'textOnDark' : 'primary';

  return (
    <TouchableOpacityBox
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      backgroundColor={isPrimary ? 'primary' : 'transparent'}
      borderWidth={isPrimary ? 0 : 1}
      borderColor={borderColor}
      borderRadius="r9"
      paddingVertical="s16"
      paddingHorizontal="s24"
      alignItems="center"
      justifyContent="center"
      alignSelf={fullWidth ? 'stretch' : 'center'}
      style={{ opacity: disabled ? 0.5 : 1 }}>
      <Text variant="button" color={textColor}>
        {label}
      </Text>
    </TouchableOpacityBox>
  );
}
