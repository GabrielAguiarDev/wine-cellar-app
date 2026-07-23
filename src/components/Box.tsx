import {
  Pressable,
  type PressableProps,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import { createBox } from '@shopify/restyle';

import { type Theme } from '@theme/theme';

/** View base estilizada 100% via tokens do tema. */
export const Box = createBox<Theme>();
export type BoxProps = React.ComponentProps<typeof Box>;

/** TouchableOpacity com todas as props de tema do Box. */
export const TouchableOpacityBox = createBox<Theme, TouchableOpacityProps>(
  TouchableOpacity,
);
export type TouchableOpacityBoxProps = React.ComponentProps<
  typeof TouchableOpacityBox
>;

/** Pressable com todas as props de tema do Box. */
export const PressableBox = createBox<Theme, PressableProps>(Pressable);
export type PressableBoxProps = React.ComponentProps<typeof PressableBox>;
