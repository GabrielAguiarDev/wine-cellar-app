import { TouchableOpacityBox } from './Box';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'outline' | 'outlineGold';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  /**
   * Afundar ao toque. Ligado por padrão — é o comportamento certo para um CTA,
   * que é justamente o alvo mais "físico" da tela.
   *
   * Desligue onde o botão está dentro de algo que JÁ se move ao toque (um card
   * que também é `PressableScale`): duas escalas aninhadas se multiplicam e o
   * conjunto encolhe o dobro do pretendido.
   */
  scaleOnPress?: boolean;
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
  scaleOnPress = true,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const borderColor =
    variant === 'outlineGold' ? ('accent' as const) : ('primary' as const);
  const textColor =
    isPrimary || variant === 'outlineGold' ? 'textOnDark' : 'primary';

  const boxProps = {
    onPress,
    disabled,
    backgroundColor: isPrimary
      ? ('primary' as const)
      : ('transparent' as const),
    borderWidth: isPrimary ? 0 : 1,
    borderColor,
    borderRadius: 'r9' as const,
    paddingVertical: 's16' as const,
    paddingHorizontal: 's24' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    alignSelf: fullWidth ? ('stretch' as const) : ('center' as const),
    style: { opacity: disabled ? 0.5 : 1 },
  };

  const content = (
    <Text variant="button" color={textColor}>
      {label}
    </Text>
  );

  if (scaleOnPress) {
    return <PressableScale {...boxProps}>{content}</PressableScale>;
  }

  return (
    <TouchableOpacityBox activeOpacity={0.85} {...boxProps}>
      {content}
    </TouchableOpacityBox>
  );
}
