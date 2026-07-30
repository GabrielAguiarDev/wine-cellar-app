import { IconButton } from './IconButton';

type BackButtonProps = {
  onPress?: () => void;
  /** Ver `IconButton`: `dark` sobre bordô/fotografia, `light` sobre creme. */
  variant?: 'dark' | 'light';
  /**
   * Default "Voltar". Trocar quando o destino NÃO é a tela anterior — em
   * `/tracking` o botão vai para a Home, e é só isto que conta essa história a
   * quem usa leitor de tela.
   */
  accessibilityLabel?: string;
};

/**
 * O voltar do app — um `IconButton` com o chevron dentro.
 *
 * É o ÚNICO voltar: não existe mais a variante em linha ("‹ Voltar" com
 * rótulo). Ela vinha do `ScreenHeader` e o problema era de peso — a palavra
 * "Voltar" em caixa alta no canto competia com o título da tela logo abaixo, e
 * onde o topo tinha par (produto: voltar + favoritar) ficava uma linha de texto
 * de um lado contra um ícone nu do outro. O círculo é uma peça só, ancorada no
 * canto, que se lê como controle de sistema e não como conteúdo.
 */
export function BackButton({
  onPress,
  variant = 'light',
  accessibilityLabel = 'Voltar',
}: BackButtonProps) {
  return (
    <IconButton
      icon="chevronLeft"
      onPress={onPress}
      variant={variant}
      accessibilityLabel={accessibilityLabel}
      iconSize={13}
    />
  );
}
