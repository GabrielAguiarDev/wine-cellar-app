import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';

import { Box, Screen, Text, TouchableOpacityBox } from '@components/index';
import { useToastStore, useUserStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brandHeaderOptions } from '@theme/navHeader';

const GOAL = 500;

const EARN = [
  { label: 'A cada R$ 1 em compras', pts: '+1 pt' },
  { label: 'Avaliar um vinho', pts: '+15 pts' },
  { label: 'Indicar um amigo', pts: '+80 pts' },
];

const REWARDS = [
  { title: 'R$ 50 de desconto', cost: 250, ok: true },
  { title: 'Frete grátis', cost: 120, ok: true },
  { title: 'Degustação guiada', cost: 600, ok: false },
];

const HISTORY = [
  { label: 'Compra · Notte Eterna', date: '12 jul', delta: '+678', earned: true },
  { label: 'Avaliação registrada', date: '05 jul', delta: '+15', earned: true },
  { label: 'Resgate · Frete grátis', date: '20 jun', delta: '−120', earned: false },
];

export default function LoyaltyScreen() {
  const points = useUserStore(s => s.points);
  const show = useToastStore(s => s.show);

  const progressPct = Math.round((points / GOAL) * 100);
  const remaining = GOAL - points;

  return (
    <Screen scroll nativeHeader>
      <Stack.Screen options={{ ...brandHeaderOptions, title: 'Fidelidade' }} />
      <Box paddingBottom="s108" paddingTop="s6">
        {/* hero de pontos */}
        <Box marginHorizontal="s22" marginTop="s14" borderRadius="r18" overflow="hidden">
          <LinearGradient
            colors={[palette.wineLight, palette.wine, palette.wineDeep]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ padding: 24, alignItems: 'center' }}>
            <Text variant="eyebrow">Seus pontos</Text>
            <Text color="textOnDark" style={{ fontFamily: fonts.serifSemiBold, fontSize: 60, lineHeight: 56, marginVertical: 8 }}>
              {points}
            </Text>
            <Text variant="body" fontSize={12} color="cremeA62">
              {remaining} pts para o nível VIP
            </Text>
            <Box marginTop="s16" flexDirection="row" alignItems="center" alignSelf="stretch" style={{ gap: 10 }}>
              <Text variant="label" fontSize={10} color="accent" style={{ letterSpacing: 1.4 }}>
                Prime
              </Text>
              <Box flex={1} height={5} borderRadius="r5" backgroundColor="cremeA15" overflow="hidden">
                <Box height={5} backgroundColor="accent" style={{ width: `${progressPct}%` }} />
              </Box>
              <Text variant="label" fontSize={10} color="cremeA50" style={{ letterSpacing: 1.4 }}>
                VIP
              </Text>
            </Box>
          </LinearGradient>
        </Box>

        {/* como ganhar */}
        <Box marginHorizontal="s22" marginTop="s24">
          <Text variant="sectionTitle" fontSize={22} marginBottom="s12">
            Como ganhar pontos
          </Text>
          <Box style={{ gap: 10 }}>
            {EARN.map(g => (
              <Box
                key={g.label}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                backgroundColor="surface"
                borderWidth={1}
                borderColor="inkBorder09"
                borderRadius="r12"
                paddingVertical="s14"
                paddingHorizontal="s16">
                <Text variant="body" fontSize={13.5}>
                  {g.label}
                </Text>
                <Text variant="body" fontSize={12} color="accentDark">
                  {g.pts}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* resgatar */}
        <Box marginHorizontal="s22" marginTop="s24">
          <Text variant="sectionTitle" fontSize={22} marginBottom="s12">
            Resgatar
          </Text>
          <Box style={{ gap: 12 }}>
            {REWARDS.map(r => (
              <Box
                key={r.title}
                flexDirection="row"
                alignItems="center"
                backgroundColor="surface"
                borderWidth={1}
                borderColor="inkBorder09"
                borderRadius="r14"
                paddingVertical="s16"
                paddingHorizontal="s18"
                style={{ gap: 14 }}>
                <Box flex={1}>
                  <Text variant="wineName" fontSize={19} color="primary">
                    {r.title}
                  </Text>
                  <Text variant="body" fontSize={11} color="inkA55" marginTop="s4">
                    {r.cost} pontos
                  </Text>
                </Box>
                <TouchableOpacityBox
                  activeOpacity={0.85}
                  onPress={() =>
                    show(r.ok ? 'Recompensa resgatada!' : 'Pontos insuficientes.')
                  }
                  borderWidth={1}
                  borderColor="primary"
                  borderRadius="r9"
                  paddingVertical="s10"
                  paddingHorizontal="s16"
                  backgroundColor={r.ok ? 'primary' : 'transparent'}>
                  <Text
                    variant="label"
                    fontSize={10}
                    color={r.ok ? 'textOnDark' : 'inkA50'}
                    style={{ letterSpacing: 1.2 }}>
                    {r.ok ? 'Resgatar' : `${points}/${r.cost}`}
                  </Text>
                </TouchableOpacityBox>
              </Box>
            ))}
          </Box>
        </Box>

        {/* histórico */}
        <Box marginHorizontal="s22" marginTop="s24">
          <Text variant="sectionTitle" fontSize={22} marginBottom="s4">
            Histórico
          </Text>
          {HISTORY.map(h => (
            <Box
              key={h.label}
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingVertical="s14"
              borderBottomWidth={1}
              borderBottomColor="inkBorder10">
              <Box>
                <Text variant="body" fontSize={13}>
                  {h.label}
                </Text>
                <Text variant="body" fontSize={11} color="inkA50" marginTop="s2">
                  {h.date}
                </Text>
              </Box>
              <Text
                color={h.earned ? 'accentDark' : 'inkA50'}
                style={{ fontFamily: fonts.serifRegular, fontSize: 14 }}>
                {h.delta}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Screen>
  );
}
