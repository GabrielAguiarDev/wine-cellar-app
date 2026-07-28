import { useState } from 'react';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  Box,
  Screen,
  ScreenHeader,
  Text,
  TouchableOpacityBox,
  WineRow,
} from '@components/index';
import { StaggeredText } from '@components/organisms/animated-text';
import { OCCASIONS, winesByIds } from '@data/index';
import { fonts, palette } from '@theme/index';
import { toWineRowData } from '@utils/index';

const TITLE = 'Qual é a ocasião?';

// A revelação caractere a caractere do título (defaults: 40ms/char + 350ms)
// define quando o resto da tela pode entrar.
const TITLE_REVEAL_MS = (TITLE.length - 1) * 40 + 350;
const GRID_DELAY = TITLE_REVEAL_MS;

export default function SommelierScreen() {
  const router = useRouter();
  const [sel, setSel] = useState<string | null>(null);

  const occasion = OCCASIONS.find(o => o.key === sel);
  const wines = occasion ? winesByIds(occasion.ids) : [];
  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  return (
    <Screen scroll gradient={[palette.wine, palette.wineDeeper]}>
      <StatusBar style="light" />
      <Box paddingBottom="s108" paddingTop="s6">
        <Box paddingHorizontal="s22">
          <ScreenHeader onBack={() => router.back()} variant="dark" />
        </Box>

        <Box paddingHorizontal="s24" paddingTop="s14">
          <Animated.View entering={FadeInDown.duration(320)}>
            <Text variant="eyebrow">Sommelier virtual</Text>
          </Animated.View>
          {/* título (revelação caractere a caractere — reacticx) */}
          <Box marginTop="s8">
            <StaggeredText
              text={TITLE}
              style={{
                fontFamily: fonts.serifSemiBold,
                fontSize: 36,
                lineHeight: 38,
                color: palette.creme,
              }}
            />
          </Box>
        </Box>

        {/* grade 2x2 (fade up escalonado) */}
        <Box
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="space-between"
          paddingHorizontal="s22"
          paddingTop="s22"
          style={{ rowGap: 12 }}>
          {OCCASIONS.map((o, i) => {
            const active = o.key === sel;
            return (
              <Animated.View
                key={o.key}
                entering={FadeInDown.delay(GRID_DELAY + i * 70).duration(320)}
                style={{ width: '48%' }}>
                <TouchableOpacityBox
                  activeOpacity={0.85}
                  onPress={() => setSel(o.key)}
                  backgroundColor={active ? 'accent' : 'cremeA06'}
                  borderWidth={1}
                  borderColor={active ? 'accent' : 'goldA35'}
                  borderRadius="r14"
                  padding="s18"
                  minHeight={118}
                  justifyContent="flex-end">
                  <Text
                    color="textOnDark"
                    style={{ fontFamily: fonts.serifSemiBold, fontSize: 22, lineHeight: 23 }}>
                    {o.label}
                  </Text>
                  <Text
                    variant="body"
                    fontSize={10.5}
                    color={active ? 'cremeA82' : 'cremeA60'}
                    marginTop="s6"
                    style={{ lineHeight: 15 }}>
                    {o.desc}
                  </Text>
                </TouchableOpacityBox>
              </Animated.View>
            );
          })}
        </Box>

        {/* vinhos da ocasião */}
        {occasion && (
          <Box paddingHorizontal="s22" paddingTop="s20">
            <Animated.View key={`${occasion.key}-label`} entering={FadeInDown.duration(300)}>
              <Text variant="eyebrow" marginBottom="s14">
                Para &quot;{occasion.label}&quot;
              </Text>
            </Animated.View>
            <Box style={{ gap: 12 }}>
              {wines.map((w, i) => (
                <Animated.View
                  key={`${occasion.key}-${w.id}`}
                  entering={FadeInDown.delay(90 + i * 70).duration(320)}>
                  <WineRow
                    variant="dark"
                    bottleWidth={30}
                    data={toWineRowData(w)}
                    onPress={() => openWine(w.id)}
                  />
                </Animated.View>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Screen>
  );
}
