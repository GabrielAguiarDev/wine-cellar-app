import { useState } from 'react';

import { ScrollView, TextInput } from 'react-native';

import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import {
  Box,
  Chip,
  Icon,
  Screen,
  Text,
  TouchableOpacityBox,
  WineRow,
} from '@components/index';
import { CAT_SPECIALS, searchByDish, searchWines } from '@data/index';
import { fonts, palette } from '@theme/index';
import { toWineRowData } from '@utils/index';

type Mode = 'wine' | 'dish';

const MODES: { key: Mode; label: string }[] = [
  { key: 'wine', label: 'Buscar vinho' },
  { key: 'dish', label: 'Buscar por prato' },
];
const FILTERS = ['Uva', 'País', 'Preço', 'Corpo', 'Harmonização'];
const DISH_EXAMPLES = ['salmão grelhado', 'risoto', 'churrasco', 'queijos'];

export default function SearchScreen() {
  const router = useRouter();
  const { cat } = useLocalSearchParams<{ cat?: string }>();

  const [mode, setMode] = useState<Mode>('wine');
  const [query, setQuery] = useState('');
  const [dishQuery, setDishQuery] = useState('');

  const catFilter = cat ?? null;
  const title = cat === CAT_SPECIALS ? 'Especiais' : (cat ?? 'Coleção');

  const results = searchWines({ catFilter, query });
  const dishResults = searchByDish(dishQuery);
  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  return (
    <Screen scroll largeTitle={title}>
      <Stack.Screen options={{ title: title }} />
      <Box paddingBottom="s108" paddingTop="s10">
        {/* toggle vinho / prato (segmented nativo) */}
        <Box paddingHorizontal="s22" marginTop="s4" marginBottom="s16">
          <SegmentedControl
            values={MODES.map(m => m.label)}
            selectedIndex={MODES.findIndex(m => m.key === mode)}
            onChange={e =>
              setMode(MODES[e.nativeEvent.selectedSegmentIndex].key)
            }
            tintColor={palette.wine}
          />
        </Box>

        {mode === 'wine' ? (
          <>
            {/* input */}
            <Box
              marginHorizontal="s22"
              marginBottom="s18"
              flexDirection="row"
              alignItems="center"
              backgroundColor="surface"
              borderWidth={1}
              borderColor="inkBorder14"
              borderRadius="r12"
              paddingVertical="s12"
              paddingHorizontal="s16"
              style={{ gap: 10 }}>
              <Icon name="search" size={16} color={palette.mutedIcon} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Nome, uva ou região…"
                placeholderTextColor={palette.mutedIcon}
                style={{ flex: 1, fontFamily: fonts.sansRegular, fontSize: 14, color: palette.ink }}
              />
            </Box>

            {/* chips de filtro */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 22, gap: 8, paddingBottom: 18 }}>
              {FILTERS.map(f => (
                <Chip key={f} label={f} />
              ))}
            </ScrollView>

            {/* resultados */}
            <Box paddingHorizontal="s22" style={{ gap: 14 }}>
              {results.map(w => (
                <WineRow
                  key={w.id}
                  data={toWineRowData(w, { full: true })}
                  onPress={() => openWine(w.id)}
                />
              ))}
              {results.length === 0 && (
                <Text variant="quote" color="wineA70" textAlign="center" marginTop="s40">
                  Nenhum vinho encontrado.
                </Text>
              )}
            </Box>
          </>
        ) : (
          <Box paddingHorizontal="s22">
            <Text variant="quote" fontSize={17} color="wineA70" marginBottom="s14">
              Diga o que vai preparar — encontramos a taça certa.
            </Text>

            {/* input prato */}
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="surface"
              borderWidth={1}
              borderColor="inkBorder14"
              borderRadius="r12"
              paddingVertical="s14"
              paddingHorizontal="s16"
              marginBottom="s14"
              style={{ gap: 10 }}>
              <Text style={{ fontSize: 15 }}>🍽</Text>
              <TextInput
                value={dishQuery}
                onChangeText={setDishQuery}
                placeholder="ex: salmão grelhado"
                placeholderTextColor={palette.mutedIcon}
                style={{ flex: 1, fontFamily: fonts.sansRegular, fontSize: 14, color: palette.ink }}
              />
            </Box>

            {/* exemplos */}
            <Box flexDirection="row" flexWrap="wrap" marginBottom="s22" style={{ gap: 8 }}>
              {DISH_EXAMPLES.map(d => (
                <TouchableOpacityBox
                  key={d}
                  activeOpacity={0.8}
                  onPress={() => setDishQuery(d)}
                  borderWidth={1}
                  borderColor="goldA50"
                  borderRadius="r8"
                  paddingVertical="s8"
                  paddingHorizontal="s14">
                  <Text variant="body" fontSize={11} color="accentDark">
                    {d}
                  </Text>
                </TouchableOpacityBox>
              ))}
            </Box>

            {/* resultados por prato */}
            {dishResults.length > 0 && (
              <>
                <Text variant="eyebrow" marginBottom="s14">
                  Harmonizam com &quot;{dishQuery}&quot;
                </Text>
                <Box style={{ gap: 14 }}>
                  {dishResults.map(w => (
                    <WineRow key={w.id} data={toWineRowData(w)} onPress={() => openWine(w.id)} />
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}

        {/* link sommelier */}
        <TouchableOpacityBox
          activeOpacity={0.85}
          onPress={() => router.navigate('/sommelier')}
          marginTop="s26"
          marginHorizontal="s22"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          borderWidth={1}
          borderColor="goldA60"
          borderRadius="r13"
          paddingVertical="s18"
          paddingHorizontal="s20"
          style={{ borderStyle: 'dashed' }}>
          <Box>
            <Text variant="wineName" color="primary">
              Sommelier virtual
            </Text>
            <Text variant="body" fontSize={11} color="inkA55" marginTop="s2">
              Sugestões por ocasião
            </Text>
          </Box>
          <Icon name="arrowRight" size={14} color={palette.gold} />
        </TouchableOpacityBox>
      </Box>
    </Screen>
  );
}
