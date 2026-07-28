import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  Box,
  Screen,
  ScreenHeader,
  Text,
  WineRow,
} from '@components/index';
import { specials } from '@data/index';
import { fonts, palette } from '@theme/index';
import { toWineRowData } from '@utils/index';

export default function VipScreen() {
  const router = useRouter();
  const releases = specials();
  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  return (
    <Screen scroll gradient={[palette.wineLight, palette.wine, palette.wineDeep]} gradientLocations={[0, 0.46, 1]}>
      <StatusBar style="light" />
      <Box paddingBottom="s108" paddingTop="s6">
        <Box paddingHorizontal="s22">
          <ScreenHeader onBack={() => router.back()} variant="dark" />
        </Box>

        <Box paddingHorizontal="s24" paddingTop="s14">
          <Text variant="eyebrow" style={{ letterSpacing: 3.6 }}>
            Exclusivo · Nível VIP
          </Text>
          <Text
            color="textOnDark"
            marginTop="s8"
            style={{ fontFamily: fonts.serifSemiBold, fontSize: 40, lineHeight: 41 }}>
            Lançamentos{'\n'}antecipados
          </Text>
          <Text
            color="cremeA70"
            marginTop="s12"
            style={{ fontFamily: fonts.serifItalic, fontSize: 17, lineHeight: 24 }}>
            Garrafas em pré-lançamento, antes do público geral.
          </Text>
        </Box>

        <Box paddingHorizontal="s22" paddingTop="s26" style={{ gap: 16 }}>
          {releases.map(w => (
            <WineRow
              key={w.id}
              variant="dark"
              bottleWidth={38}
              badge="Pré-lançamento"
              data={toWineRowData(w, { full: false })}
              onPress={() => openWine(w.id)}
            />
          ))}
        </Box>
      </Box>
    </Screen>
  );
}
