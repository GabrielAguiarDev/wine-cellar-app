import { palette } from './palette';
import { fonts } from './theme';

/**
 * Opções do header nativo (expo-router / native-stack) com a identidade
 * IL DiVino: fundo creme, tinta bordô, título em serifada Cormorant e, no iOS,
 * large title que colapsa ao rolar. O `title` é definido por tela.
 */
export const brandHeaderOptions = {
  headerShown: true,
  headerLargeTitle: true,
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal' as const,
  headerStyle: { backgroundColor: palette.creme },
  headerTintColor: palette.wine,
  headerTitleStyle: { fontFamily: fonts.serifSemiBold, color: palette.wine },
  headerLargeTitleStyle: {
    fontFamily: fonts.serifSemiBold,
    color: palette.wine,
  },
};
