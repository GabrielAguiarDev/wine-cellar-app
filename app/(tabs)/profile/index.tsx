import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import {
  Box,
  Button,
  Icon,
  Screen,
  SectionTitle,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { useUserStore } from '@store/index';
import { fonts, palette } from '@theme/index';

const META = 500;
const PEDIDOS = [
  { titulo: 'Notte Eterna + 1', data: '12 jul', status: 'Entregue', total: 'R$ 678' },
  { titulo: 'Lumière Blanche', data: '28 jun', status: 'Entregue', total: 'R$ 279' },
];
const LINKS = ['Dados pessoais', 'Endereços salvos', 'Formas de pagamento', 'Notificações'];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ProfileScreen() {
  const router = useRouter();
  const points = useUserStore(s => s.points);
  const paladar = useUserStore(s => s.paladar);

  const restante = META - points;
  const progressPct = Math.round((points / META) * 100);
  const tags = [cap(paladar), 'Seco', 'Tintos'];

  return (
    <Screen scroll nativeHeader>
      <Box paddingBottom="s108" paddingTop="s6">
        {/* card VIP */}
        <Box marginHorizontal="s22" borderRadius="r18" overflow="hidden" borderWidth={1} borderColor="goldA35">
          <LinearGradient
            colors={[palette.wineDeep, palette.wine]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22 }}>
            <Box flexDirection="row" alignItems="center" style={{ gap: 16 }}>
              <Box
                width={58}
                height={58}
                borderRadius="rFull"
                borderWidth={1}
                borderColor="goldA50"
                backgroundColor="cremeA08"
                alignItems="center"
                justifyContent="center">
                <Text color="textOnDark" style={{ fontFamily: fonts.serifRegular, fontSize: 24 }}>
                  HP
                </Text>
              </Box>
              <Box flex={1}>
                <Text color="textOnDark" style={{ fontFamily: fonts.serifSemiBold, fontSize: 26 }}>
                  Helena Prado
                </Text>
                <Text variant="eyebrow" marginTop="s6">
                  Membro Prime
                </Text>
              </Box>
            </Box>
            <Box marginTop="s20" flexDirection="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Text color="textOnDark" style={{ fontFamily: fonts.serifRegular, fontSize: 22 }}>
                  {points} <Text color="cremeA60" fontSize={12}>pontos</Text>
                </Text>
                <Text variant="body" fontSize={10} color="cremeA55" marginTop="s2">
                  {restante} pts para o nível VIP
                </Text>
              </Box>
              <Button label="Ver programa" variant="outlineGold" onPress={() => router.navigate('/loyalty')} />
            </Box>
            <Box marginTop="s14" height={5} borderRadius="r5" backgroundColor="cremeA15" overflow="hidden">
              <Box height={5} borderRadius="r5" backgroundColor="accent" style={{ width: `${progressPct}%` }} />
            </Box>
          </LinearGradient>
        </Box>

        {/* acesso antecipado */}
        <TouchableOpacityBox
          activeOpacity={0.9}
          onPress={() => router.navigate('/vip')}
          marginHorizontal="s22"
          marginTop="s14"
          flexDirection="row"
          alignItems="center"
          backgroundColor="surface"
          borderWidth={1}
          borderColor="goldA50"
          borderRadius="r14"
          paddingVertical="s16"
          paddingHorizontal="s18"
          style={{ gap: 14 }}>
          <Box
            width={38}
            height={38}
            borderRadius="rFull"
            borderWidth={1}
            borderColor="accent"
            alignItems="center"
            justifyContent="center">
            <Icon name="star" size={16} color={palette.gold} fill={palette.gold} />
          </Box>
          <Box flex={1}>
            <Text variant="wineName" color="primary">
              Acesso antecipado
            </Text>
            <Text variant="body" fontSize={11} color="inkA55" marginTop="s2">
              Lançamentos VIP antes de todos
            </Text>
          </Box>
          <Icon name="chevronRight" size={13} color={palette.gold} />
        </TouchableOpacityBox>

        {/* seu paladar */}
        <Box marginHorizontal="s22" marginTop="s22">
          <SectionTitle
            right={
              <TouchableOpacityBox activeOpacity={0.7} onPress={() => router.navigate('/quiz')}>
                <Text variant="body" fontSize={11} color="accentDark">
                  Refazer
                </Text>
              </TouchableOpacityBox>
            }>
            <Text variant="sectionTitle" fontSize={21}>
              Seu paladar
            </Text>
          </SectionTitle>
          <Box flexDirection="row" flexWrap="wrap" marginTop="s12" style={{ gap: 8 }}>
            {tags.map(t => (
              <Box key={t} borderWidth={1} borderColor="goldA50" borderRadius="r8" paddingVertical="s8" paddingHorizontal="s14">
                <Text variant="label" fontSize={10} color="primary" style={{ letterSpacing: 1.6 }}>
                  {t}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* pedidos recentes */}
        <Box marginHorizontal="s22" marginTop="s24">
          <Text variant="sectionTitle" fontSize={21} marginBottom="s12">
            Pedidos recentes
          </Text>
          <Box style={{ gap: 10 }}>
            {PEDIDOS.map(p => (
              <TouchableOpacityBox
                key={p.titulo}
                activeOpacity={0.85}
                onPress={() => router.navigate('/tracking')}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                backgroundColor="surface"
                borderWidth={1}
                borderColor="inkBorder09"
                borderRadius="r12"
                paddingVertical="s14"
                paddingHorizontal="s16">
                <Box>
                  <Text variant="body" fontSize={13} style={{ fontFamily: fonts.sansMedium }}>
                    {p.titulo}
                  </Text>
                  <Text variant="body" fontSize={11} color="inkA50" marginTop="s2">
                    {p.data} · {p.status}
                  </Text>
                </Box>
                <Text color="primary" style={{ fontFamily: fonts.serifRegular, fontSize: 16 }}>
                  {p.total}
                </Text>
              </TouchableOpacityBox>
            ))}
          </Box>
        </Box>

        {/* links */}
        <Box marginHorizontal="s22" marginTop="s22">
          {LINKS.map(l => (
            <Box
              key={l}
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingVertical="s16"
              borderBottomWidth={1}
              borderBottomColor="inkBorder10">
              <Text variant="body" fontSize={14}>
                {l}
              </Text>
              <Icon name="chevronRight" size={12} color={palette.mutedIcon} />
            </Box>
          ))}
        </Box>
      </Box>
    </Screen>
  );
}
