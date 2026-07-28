import { Box, TouchableOpacityBox } from './Box';
import { Text } from './Text';

type ChipProps = {
  label: string;
  /**
   * Valor escolhido. Quando presente, o chip fica preenchido e mostra o valor
   * no lugar do rótulo — é o estado "filtro ativo".
   */
  value?: string;
  onPress?: () => void;
  /** Limpa só este filtro (mostra o "×" quando há valor). */
  onClear?: () => void;
};

/** Chip de filtro com indicador de dropdown (Uva, País, Preço…). */
export function Chip({ label, value, onPress, onClear }: ChipProps) {
  const active = !!value;

  return (
    <TouchableOpacityBox
      accessibilityRole="button"
      accessibilityLabel={active ? `${label}: ${value}` : `Filtrar por ${label}`}
      activeOpacity={0.8}
      onPress={onPress}
      flexDirection="row"
      alignItems="center"
      backgroundColor={active ? 'primary' : 'transparent'}
      borderWidth={1}
      borderColor={active ? 'primary' : 'inkBorder16'}
      borderRadius="r8"
      paddingVertical="s8"
      paddingHorizontal="s12"
      style={{ gap: 6 }}>
      <Text
        variant="label"
        fontSize={9.5}
        color={active ? 'textOnDark' : 'inkA55'}
        style={{ letterSpacing: 1.3 }}>
        {value ?? label}
      </Text>
      {active && onClear ? (
        <TouchableOpacityBox
          accessibilityRole="button"
          accessibilityLabel={`Remover filtro de ${label}`}
          activeOpacity={0.7}
          onPress={onClear}
          hitSlop={10}>
          <Text fontSize={13} color="cremeA70" style={{ lineHeight: 14 }}>
            ×
          </Text>
        </TouchableOpacityBox>
      ) : (
        <Box>
          <Text fontSize={11} color={active ? 'cremeA70' : 'inkA55'}>
            ⌄
          </Text>
        </Box>
      )}
    </TouchableOpacityBox>
  );
}
