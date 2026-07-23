import { type ReactNode } from 'react';

import { palette } from '@theme/index';

import { Box, TouchableOpacityBox } from './Box';
import { Icon } from './Icon';
import { Text } from './Text';

type ScreenHeaderProps = {
  /** Texto ao lado do chevron (ex.: "Voltar", "Sacola", nome do vinho). */
  label?: string;
  onBack?: () => void;
  variant?: 'light' | 'dark';
  /** Conteúdo à direita (ex.: botão de favorito). */
  right?: ReactNode;
};

/** Cabeçalho com botão voltar (chevron + label) e ação opcional à direita. */
export function ScreenHeader({
  label = 'Voltar',
  onBack,
  variant = 'light',
  right,
}: ScreenHeaderProps) {
  const dark = variant === 'dark';
  const chevronColor = dark ? palette.gold : palette.wine;

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between">
      <TouchableOpacityBox
        activeOpacity={0.7}
        onPress={onBack}
        flexDirection="row"
        alignItems="center"
        paddingVertical="s6"
        style={{ gap: 6 }}>
        <Icon name="chevronLeft" size={13} color={chevronColor} />
        <Text
          variant="label"
          fontSize={12}
          color={dark ? 'cremeA70' : 'primary'}
          style={{ letterSpacing: 1, textTransform: 'none' }}>
          {label}
        </Text>
      </TouchableOpacityBox>
      {right}
    </Box>
  );
}
