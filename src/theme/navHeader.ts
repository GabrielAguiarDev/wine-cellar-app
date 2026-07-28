import { palette } from './palette';
import { fonts } from './theme';

/**
 * Opções do header nativo (expo-router / native-stack) com a identidade
 * IL DiVino: fundo creme, tinta bordô, título em serifada Cormorant e, no iOS,
 * large title que colapsa ao rolar. O `title` é definido por tela.
 *
 * Este é o header de telas EMPILHADAS (checkout, fidelidade, avaliações): tem
 * botão voltar, então precisa aparecer nas duas plataformas. Para raiz de aba,
 * usar `brandLargeTitleOptions`.
 */
export const brandHeaderOptions = {
  headerShown: true,
  headerLargeTitleEnabled: true,
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

/**
 * Header de RAIZ DE ABA (buscar, favoritos, sacola, perfil): NENHUM header
 * nativo — quem desenha o título grande colapsável é o `Screen`, via prop
 * `largeTitle` (ver `AnimatedHeaderScrollView`).
 *
 * Por que não o nativo, que existe no iOS (`headerLargeTitleEnabled`):
 *
 * 1. O colapso nativo depende do `react-native-screens` ACHAR o ScrollView da
 *    tela, e duas das três buscas dele exigem o scroll como filho direto do
 *    content wrapper — qualquer view de tema no meio mata o colapso em silêncio,
 *    e o header nasce aberto e nunca fecha.
 * 2. O Android não tem large title nativo.
 * 3. O nativo não suporta subtítulo (não existe `headerSubtitle` nem no
 *    expo-router nem no react-native-screens).
 *
 * Em JS os três problemas somem de uma vez. O custo é a animação rodar em JS.
 *
 * Uso: `screenOptions={brandLargeTitleOptions}` na pilha da aba, e
 * `<Screen scroll largeTitle="Favoritos">` na tela.
 */
export const brandLargeTitleOptions = {
  headerShown: false,
};
