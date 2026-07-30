import { palette } from '@theme/index';

import { TouchableOpacityBox } from './Box';
import { Icon, type IconName } from './Icon';

/**
 * Diâmetro do controle de chrome. Único de propósito: voltar e favoritar são
 * a MESMA peça em tamanhos diferentes de glifo, e é o círculo repetido que faz
 * o topo da tela ler como barra de sistema em vez de dois ícones soltos.
 */
export const ICON_BUTTON_SIZE = 36;

type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  /**
   * `dark` — sobre bordô ou fotografia: vidro bordô translúcido, borda e glifo
   * dourados. `light` — sobre creme: superfície creme, borda e glifo bordô.
   *
   * O PADRÃO é a forma (círculo de 36 com borda e glifo centrado), não a cor:
   * um vidro bordô sobre creme viraria um borrão escuro, e o glifo dourado
   * perde contraste no claro.
   */
  variant?: 'dark' | 'light';
  accessibilityLabel: string;
  /** Tamanho do glifo. O círculo não muda — só o desenho dentro dele. */
  iconSize?: number;
  /** Preenche o glifo com a própria cor (coração favoritado). */
  filled?: boolean;
};

/**
 * Controle redondo de chrome — o voltar, o favoritar, e o que mais ocupar o
 * topo de uma tela.
 *
 * Nasceu de `BackButton` (que agora é este componente com o chevron dentro):
 * quando o topo tem PAR — voltar à esquerda, favoritar à direita — os dois
 * precisam ser a mesma peça, senão um círculo com borda de um lado e um ícone
 * nu do outro parecem pertencer a camadas diferentes da interface.
 */
export function IconButton({
  icon,
  onPress,
  variant = 'light',
  accessibilityLabel,
  iconSize = 16,
  filled = false,
}: IconButtonProps) {
  const dark = variant === 'dark';
  const tint = dark ? palette.gold : palette.wine;

  return (
    <TouchableOpacityBox
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.8}
      onPress={onPress}
      width={ICON_BUTTON_SIZE}
      height={ICON_BUTTON_SIZE}
      borderRadius="rFull"
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor={dark ? 'goldA35' : 'inkBorder14'}
      backgroundColor={dark ? 'wineA60' : 'surface'}>
      <Icon
        name={icon}
        size={iconSize}
        color={tint}
        fill={filled ? tint : 'none'}
      />
    </TouchableOpacityBox>
  );
}
