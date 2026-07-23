import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Box } from './Box';
import { Text } from './Text';

type ToastProps = {
  message: string;
  /** Distância do fundo (acima da tab bar, por padrão). */
  bottom?: number;
};

/**
 * Notificação flutuante inferior (bordô escuro, borda dourada).
 * Renderize condicionalmente (a orquestração/auto-dismiss vem na Fase 2).
 */
export function Toast({ message, bottom = 120 }: ToastProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutDown.duration(200)}
      style={{
        position: 'absolute',
        left: 26,
        right: 26,
        bottom,
        zIndex: 80,
      }}>
      <Box
        backgroundColor="primaryDeep"
        borderWidth={1}
        borderColor="goldA40"
        borderRadius="r12"
        paddingVertical="s14"
        paddingHorizontal="s18">
        <Text
          variant="body"
          fontSize={12.5}
          color="textOnDark"
          textAlign="center">
          {message}
        </Text>
      </Box>
    </Animated.View>
  );
}
