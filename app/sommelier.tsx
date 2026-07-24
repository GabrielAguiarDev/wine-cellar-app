import { useState } from 'react';

import { useRouter } from 'expo-router';

import {
  Box,
  Screen,
  ScreenHeader,
  Text,
  TouchableOpacityBox,
  WineRow,
} from '@components/index';
import { OCASIOES, winesByIds } from '@data/index';
import { fonts, palette } from '@theme/index';
import { toWineRowData } from '@utils/index';

export default function SommelierScreen() {
  const router = useRouter();
  const [sel, setSel] = useState<string | null>(null);

  const ocasiao = OCASIOES.find(o => o.key === sel);
  const vinhos = ocasiao ? winesByIds(ocasiao.ids) : [];
  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  return (
    <Screen scroll gradient={[palette.wine, palette.wineDeeper]}>
      <Box paddingBottom="s108" paddingTop="s6">
        <Box paddingHorizontal="s22">
          <ScreenHeader onBack={() => router.back()} variant="dark" />
        </Box>

        <Box paddingHorizontal="s24" paddingTop="s14">
          <Text variant="eyebrow">Sommelier virtual</Text>
          <Text
            color="textOnDark"
            marginTop="s8"
            style={{ fontFamily: fonts.serifSemiBold, fontSize: 36, lineHeight: 38 }}>
            Qual é a ocasião?
          </Text>
        </Box>

        {/* grade 2x2 */}
        <Box
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="space-between"
          paddingHorizontal="s22"
          paddingTop="s22"
          style={{ rowGap: 12 }}>
          {OCASIOES.map(o => {
            const active = o.key === sel;
            return (
              <TouchableOpacityBox
                key={o.key}
                activeOpacity={0.85}
                onPress={() => setSel(o.key)}
                backgroundColor={active ? 'accent' : 'cremeA06'}
                borderWidth={1}
                borderColor={active ? 'accent' : 'goldA35'}
                borderRadius="r14"
                padding="s18"
                minHeight={118}
                justifyContent="flex-end"
                style={{ width: '48%' }}>
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
            );
          })}
        </Box>

        {/* vinhos da ocasião */}
        {ocasiao && (
          <Box paddingHorizontal="s22" paddingTop="s20">
            <Text variant="eyebrow" marginBottom="s14">
              Para &quot;{ocasiao.label}&quot;
            </Text>
            <Box style={{ gap: 12 }}>
              {vinhos.map(w => (
                <WineRow
                  key={w.id}
                  variant="dark"
                  bottleWidth={30}
                  data={toWineRowData(w)}
                  onPress={() => openWine(w.id)}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Screen>
  );
}
