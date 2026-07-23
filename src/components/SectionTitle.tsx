import { type ReactNode } from 'react';

import { Box } from './Box';
import { Text } from './Text';

type SectionTitleProps = {
  children: ReactNode;
  /** Ação opcional à direita (ex.: "Ver tudo", "Refazer"). */
  right?: ReactNode;
};

/** Título de seção em serif (Cormorant 25) com ação opcional à direita. */
export function SectionTitle({ children, right }: SectionTitleProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="baseline"
      justifyContent="space-between">
      <Text variant="sectionTitle">{children}</Text>
      {right}
    </Box>
  );
}
