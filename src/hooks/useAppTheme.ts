import { useTheme } from '@shopify/restyle';

import { type Theme } from '@theme/theme';

/** Acesso tipado ao tema restyle dentro de componentes. */
export const useAppTheme = () => useTheme<Theme>();
