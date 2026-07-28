import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  Box,
  Screen,
  ScreenHeader,
  Text,
  WineRow,
} from '@components/index';
import { StaggeredText } from '@components/organisms/animated-text';
import { specials } from '@data/index';
import { fonts, palette } from '@theme/index';
import { toWineRowData } from '@utils/index';

const TITLE_LINE_1 = 'Lançamentos';
const TITLE_LINE_2 = 'antecipados';

const CHAR_DELAY = 40;
const CHAR_DURATION = 350;

// A segunda linha só começa quando a primeira termina de ser digitada.
const LINE_2_START = TITLE_LINE_1.length * CHAR_DELAY;
// Revelação completa do título (defaults reacticx: 40ms/char + 350ms).
const TITLE_REVEAL_MS = LINE_2_START + (TITLE_LINE_2.length - 1) * CHAR_DELAY + CHAR_DURATION;
const SUBTITLE_DELAY = TITLE_REVEAL_MS;
const LIST_DELAY = TITLE_REVEAL_MS + 160;

const titleStyle = {
  fontFamily: fonts.serifSemiBold,
  fontSize: 40,
  lineHeight: 41,
  color: palette.creme,
};

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
          <Animated.View entering={FadeInDown.duration(320)}>
            <Text variant="eyebrow" style={{ letterSpacing: 3.6 }}>
              Exclusivo · Nível VIP
            </Text>
          </Animated.View>

          {/* título (revelação caractere a caractere — reacticx) */}
          <Box marginTop="s8">
            <StaggeredText text={TITLE_LINE_1} style={titleStyle} />
            <StaggeredText
              text={TITLE_LINE_2}
              style={titleStyle}
              animationConfig={{ startDelay: LINE_2_START }}
            />
          </Box>

          <Animated.View entering={FadeInDown.delay(SUBTITLE_DELAY).duration(340)}>
            <Text
              color="cremeA70"
              marginTop="s12"
              style={{ fontFamily: fonts.serifItalic, fontSize: 17, lineHeight: 24 }}>
              Garrafas em pré-lançamento, antes do público geral.
            </Text>
          </Animated.View>
        </Box>

        {/* lançamentos (fade up escalonado) */}
        <Box paddingHorizontal="s22" paddingTop="s26" style={{ gap: 16 }}>
          {releases.map((w, i) => (
            <Animated.View
              key={w.id}
              entering={FadeInDown.delay(LIST_DELAY + i * 70).duration(320)}>
              <WineRow
                variant="dark"
                bottleWidth={38}
                badge="Pré-lançamento"
                data={toWineRowData(w, { full: false })}
                onPress={() => openWine(w.id)}
              />
            </Animated.View>
          ))}
        </Box>
      </Box>
    </Screen>
  );
}
