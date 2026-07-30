import { palette } from '@theme/index';

import { TouchableOpacityBox } from './Box';
import { Icon } from './Icon';

type BackButtonProps = {
  onPress?: () => void;
  /**
   * `dark` — sobre bordô ou fotografia: vidro bordô translúcido, borda e seta
   * douradas. É a variante que nasceu no hero de `/reserved`.
   * `light` — sobre creme: superfície creme, borda e seta bordô.
   *
   * O PADRÃO é a forma (círculo de 36 com borda e seta centrada), não a cor: um
   * vidro bordô sobre creme viraria um borrão escuro, e a seta dourada perde
   * contraste no claro.
   */
  variant?: 'dark' | 'light';
  /**
   * Default "Voltar". Trocar quando o destino NÃO é a tela anterior — em
   * `/tracking` o botão vai para a Home, e é só isto que conta essa história a
   * quem usa leitor de tela.
   */
  accessibilityLabel?: string;
};

/**
 * Voltar redondo — o padrão das telas cujo topo tem SÓ o voltar.
 *
 * Existe porque `ScreenHeader` resolve outro problema: ele é uma LINHA (chevron
 * + rótulo, com slot à direita), pensada para topos que carregam uma segunda
 * ação. Onde não há segunda ação, aquela linha vira um "‹ Voltar" solto no canto,
 * competindo em peso com o título da tela logo abaixo. O círculo é uma peça só,
 * ancorada no canto, que se lê como controle de sistema e não como conteúdo.
 *
 * `ScreenHeader` continua sendo o certo onde há par (produto padrão: voltar +
 * favoritar) — os dois convivem de propósito.
 */
const SIZE = 36;

export function BackButton({
  onPress,
  variant = 'light',
  accessibilityLabel = 'Voltar',
}: BackButtonProps) {
  const dark = variant === 'dark';

  return (
    <TouchableOpacityBox
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.8}
      onPress={onPress}
      width={SIZE}
      height={SIZE}
      borderRadius="rFull"
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor={dark ? 'goldA35' : 'inkBorder14'}
      backgroundColor={dark ? 'wineA60' : 'surface'}>
      <Icon
        name="chevronLeft"
        size={13}
        color={dark ? palette.gold : palette.wine}
      />
    </TouchableOpacityBox>
  );
}
