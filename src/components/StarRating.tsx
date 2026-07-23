import { palette } from '@theme/index';

import { Box, TouchableOpacityBox } from './Box';
import { Icon } from './Icon';

type StarRatingProps = {
  /** Nota de 0 a 5 (aceita decimais — arredonda para preencher). */
  value: number;
  size?: number;
  /** Espaço entre estrelas. */
  gap?: number;
  /** Se true, permite tocar para definir a nota (avaliação). */
  editable?: boolean;
  onChange?: (value: number) => void;
  /** Cor do traço/preenchimento (default dourado). */
  color?: string;
};

const MAX = 5;

/** Linha de 5 estrelas — leitura ou edição. */
export function StarRating({
  value,
  size = 14,
  gap = 3,
  editable = false,
  onChange,
  color = palette.gold,
}: StarRatingProps) {
  const filled = Math.round(value);

  return (
    <Box flexDirection="row" style={{ gap }}>
      {Array.from({ length: MAX }, (_, i) => {
        const on = i < filled;
        const star = (
          <Icon
            name="star"
            size={size}
            color={color}
            fill={on ? color : 'none'}
          />
        );

        if (!editable) {
          return <Box key={i}>{star}</Box>;
        }

        return (
          <TouchableOpacityBox
            key={i}
            activeOpacity={0.7}
            onPress={() => onChange?.(i + 1)}>
            {star}
          </TouchableOpacityBox>
        );
      })}
    </Box>
  );
}
