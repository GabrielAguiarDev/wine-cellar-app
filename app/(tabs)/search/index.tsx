import { useState } from 'react';

import { ScrollView, TextInput } from 'react-native';

import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import {
  Box,
  Chip,
  FilterSheet,
  Icon,
  Screen,
  Text,
  TouchableOpacityBox,
  WineRow,
} from '@components/index';
import {
  FILTER_DEFS,
  activeFilterCount,
  filterOptions,
  filterValueLabel,
  searchByDish,
  searchWines,
  type WineFilterKey,
  type WineFilters,
} from '@data/index';
import { fonts, palette } from '@theme/index';
import { toWineRowData } from '@utils/index';

type Mode = 'wine' | 'dish';

const MODES: { key: Mode; label: string }[] = [
  { key: 'wine', label: 'Buscar vinho' },
  { key: 'dish', label: 'Buscar por prato' },
];
const DISH_EXAMPLES = ['salmão grelhado', 'risoto', 'churrasco', 'queijos'];
const TITLE = 'Coleção';

export default function SearchScreen() {
  const router = useRouter();
  const { cat } = useLocalSearchParams<{ cat?: string }>();

  const [mode, setMode] = useState<Mode>('wine');
  const [query, setQuery] = useState('');
  const [dishQuery, setDishQuery] = useState('');
  // A categoria que vem da Home não vira título: entra como o filtro "Tipo".
  const [filters, setFilters] = useState<WineFilters>(cat ? { type: cat } : {});
  const [openFilter, setOpenFilter] = useState<WineFilterKey | null>(null);

  // A tela é uma aba: já pode estar montada quando a Home navega com outro
  // `cat`. Ajuste em render (e não em effect) para não renderizar um frame
  // com os filtros antigos.
  const [lastCat, setLastCat] = useState(cat);
  if (cat !== lastCat) {
    setLastCat(cat);
    setFilters(cat ? { type: cat } : {});
  }

  const activeCount = activeFilterCount(filters);
  const results = searchWines({ query, filters });
  const dishResults = searchByDish(dishQuery);
  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  const setFilter = (key: WineFilterKey, value?: string) =>
    setFilters(current => {
      const next = { ...current };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });

  const openFilterDef = FILTER_DEFS.find(f => f.key === openFilter);

  return (
    <Screen scroll largeTitle={TITLE}>
      <Stack.Screen options={{ title: TITLE }} />
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

            {/* chips de filtro — cada um abre a folha de opções */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 22, gap: 8 }}>
              {FILTER_DEFS.map(f => (
                <Chip
                  key={f.key}
                  label={f.label}
                  value={
                    filters[f.key]
                      ? filterValueLabel(f.key, filters[f.key] as string)
                      : undefined
                  }
                  onPress={() => setOpenFilter(f.key)}
                  onClear={() => setFilter(f.key)}
                />
              ))}
            </ScrollView>

            {/* resumo dos filtros ativos + limpar tudo */}
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal="s22"
              paddingTop="s14"
              paddingBottom="s18">
              <Text variant="label" fontSize={9.5} color="inkA50" style={{ letterSpacing: 1.4 }}>
                {results.length} {results.length === 1 ? 'rótulo' : 'rótulos'}
                {activeCount > 0 &&
                  ` · ${activeCount} ${activeCount === 1 ? 'filtro' : 'filtros'}`}
              </Text>
              {activeCount > 0 && (
                <TouchableOpacityBox
                  accessibilityRole="button"
                  accessibilityLabel="Limpar todos os filtros"
                  activeOpacity={0.7}
                  onPress={() => setFilters({})}
                  flexDirection="row"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="goldA50"
                  borderRadius="r8"
                  paddingVertical="s6"
                  paddingHorizontal="s12"
                  style={{ gap: 6 }}>
                  <Text
                    variant="label"
                    fontSize={9.5}
                    color="accentDark"
                    style={{ letterSpacing: 1.4 }}>
                    Limpar filtros
                  </Text>
                  <Text fontSize={13} color="accentDark" style={{ lineHeight: 14 }}>
                    ×
                  </Text>
                </TouchableOpacityBox>
              )}
            </Box>

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
                <Box alignItems="center" marginTop="s40" style={{ gap: 14 }}>
                  <Text variant="quote" color="wineA70" textAlign="center">
                    Nenhum vinho encontrado.
                  </Text>
                  {activeCount > 0 && (
                    <TouchableOpacityBox
                      accessibilityRole="button"
                      activeOpacity={0.7}
                      onPress={() => setFilters({})}
                      borderWidth={1}
                      borderColor="goldA50"
                      borderRadius="r8"
                      paddingVertical="s8"
                      paddingHorizontal="s14">
                      <Text
                        variant="label"
                        fontSize={9.5}
                        color="accentDark"
                        style={{ letterSpacing: 1.4 }}>
                        Limpar filtros
                      </Text>
                    </TouchableOpacityBox>
                  )}
                </Box>
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

      {openFilterDef && (
        <FilterSheet
          title={openFilterDef.label}
          options={filterOptions(openFilterDef.key)}
          selected={filters[openFilterDef.key]}
          onSelect={value => setFilter(openFilterDef.key, value)}
          onClear={() => setFilter(openFilterDef.key)}
          // a própria folha fecha ao escolher/limpar; aqui só desmontamos
          onClose={() => setOpenFilter(null)}
        />
      )}
    </Screen>
  );
}
