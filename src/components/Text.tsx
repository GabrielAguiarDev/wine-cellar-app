import { createText } from '@shopify/restyle';

import { type Theme } from '@theme/theme';

/** Texto base tipado por `variant` (ver textVariants no tema). */
export const Text = createText<Theme>();
export type TextProps = React.ComponentProps<typeof Text>;
