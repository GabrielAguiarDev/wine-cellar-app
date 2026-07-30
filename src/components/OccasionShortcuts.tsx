import { OCCASIONS } from '@data/index';

import { Box, TouchableOpacityBox } from './Box';
import { Text } from './Text';

type OccasionShortcutsProps = {
  onSelect: (key: string) => void;
};

/**
 * As quatro ocasiões do sommelier como atalhos de texto, quebrando em quantas
 * linhas precisar.
 *
 * Existe porque a porta do sommelier estava só no RODAPÉ da busca, depois de uma
 * lista de resultados de tamanho variável — na prática, invisível. O convite não
 * é mais o nome da ferramenta ("Sommelier virtual") e sim o próprio momento
 * ("Churrasco", "Presente"): quem vê um label desses já sabe se é o seu caso,
 * sem ter de descobrir o que a ferramenta faz.
 *
 * Quem navega é a tela (`onSelect` → `/sommelier?occasion=`), seguindo o resto
 * do design system daqui — ver `WineCountryCard`, `CurationBlock`.
 */
export function OccasionShortcuts({ onSelect }: OccasionShortcutsProps) {
  return (
    <Box flexDirection="row" flexWrap="wrap" style={{ gap: 8 }}>
      {OCCASIONS.map(o => (
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
      ))}
    </Box>
  );
}
