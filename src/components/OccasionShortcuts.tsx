import { ScrollView } from 'react-native';

import { OCCASIONS } from '@data/index';

import { Box, TouchableOpacityBox } from './Box';
import { Text } from './Text';

/**
 * Como a fileira ocupa o espaço:
 * - `row`: uma linha só, rolável — para onde a altura é caríssima (a Home).
 * - `wrap`: quebra em quantas linhas precisar — para onde ela é livre (o estado
 *   vazio da busca, que já é uma coluna de sugestões).
 */
type OccasionLayout = 'row' | 'wrap';

type OccasionShortcutsProps = {
  onSelect: (key: string) => void;
  layout?: OccasionLayout;
  /** Padding horizontal do `row`, para o primeiro chip alinhar com a margem da tela. */
  inset?: number;
};

/**
 * As quatro ocasiões do sommelier como atalhos de texto.
 *
 * Existe porque a porta do sommelier estava só no RODAPÉ da busca, depois de uma
 * lista de resultados de tamanho variável — na prática, invisível. O convite não
 * é mais o nome da ferramenta ("Sommelier virtual") e sim o próprio momento
 * ("Churrasco", "Presente"): quem vê um label desses já sabe se é o seu caso,
 * sem ter de descobrir o que a ferramenta faz.
 *
 * Um desenho só para os dois lugares onde aparece, de propósito: o atalho de
 * ocasião tem de ser reconhecível como a MESMA coisa na Home e na busca.
 * Quem navega é a tela (`onSelect` → `/sommelier?occasion=`), seguindo o resto
 * do design system daqui — ver `WineCountryCard`, `CurationBlock`.
 */
export function OccasionShortcuts({
  onSelect,
  layout = 'row',
  inset = 22,
}: OccasionShortcutsProps) {
  const chips = OCCASIONS.map(o => (
    <TouchableOpacityBox
      key={o.key}
      accessibilityRole="button"
      accessibilityLabel={`Sugestões para ${o.label}`}
      activeOpacity={0.8}
      onPress={() => onSelect(o.key)}
      borderWidth={1}
      borderColor="goldA50"
      borderRadius="r9"
      paddingVertical="s10"
      paddingHorizontal="s16">
      <Text variant="body" fontSize={12} color="accentDark">
        {o.label}
      </Text>
    </TouchableOpacityBox>
  ));

  if (layout === 'wrap') {
    return (
      <Box flexDirection="row" flexWrap="wrap" style={{ gap: 8 }}>
        {chips}
      </Box>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: inset, gap: 8 }}>
      {chips}
    </ScrollView>
  );
}
