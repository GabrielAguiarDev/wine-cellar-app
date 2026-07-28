import { useCallback, useEffect, useRef, useState } from 'react';

import { ScrollView, TextInput } from 'react-native';

import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import {
  Box,
  Chip,
  FilterSheet,
  Icon,
  Screen,
  ScrollableSearch,
  Text,
  TouchableOpacityBox,
  WineRow,
  useScrollableSearch,
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

/** Quantas buscas ficam guardadas na sessão (não persiste). */
const RECENT_LIMIT = 6;
/** Uvas oferecidas como atalho quando a busca abre vazia. */
const GRAPE_SUGGESTIONS = 8;
/** Resultados mostrados sobre o blur — a lista completa fica atrás dele. */
const FOCUSED_RESULT_LIMIT = 8;

/**
 * A tela inteira mora dentro de um `<ScrollableSearch>`: puxar a lista para
 * baixo passa a focar o campo de busca (em vez de engordar o título grande, que
 * é o que o `AnimatedHeaderScrollView` faz nas outras telas). Ver
 * `ScrollableSearch` para o porquê do contexto ficar por fora do `Screen`.
 */
export default function SearchScreen() {
  return (
    <ScrollableSearch>
      <SearchContent />
    </ScrollableSearch>
  );
}

function SearchContent() {
  const router = useRouter();
  const { cat } = useLocalSearchParams<{ cat?: string }>();

  const [mode, setMode] = useState<Mode>('wine');
  const [query, setQuery] = useState('');
  const [dishQuery, setDishQuery] = useState('');
  // A categoria que vem da Home não vira título: entra como o filtro "Tipo".
  const [filters, setFilters] = useState<WineFilters>(cat ? { type: cat } : {});
  const [openFilter, setOpenFilter] = useState<WineFilterKey | null>(null);

  const { isFocused, setIsFocused } = useScrollableSearch();
  const inputRef = useRef<TextInput>(null);
  /** Onde o campo descansa dentro do conteúdo, medido pelo `Anchor`. */
  const [anchorY, setAnchorY] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);

  /**
   * O foco nativo segue o estado da busca: o gesto (ou o toque) abre o teclado.
   * Ao fechar não chamamos `blur()` — quem desce o teclado é o `Keyboard.dismiss`
   * atrasado do `ScrollableSearch`, para a barra ter tempo de voltar ao lugar.
   */
  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  // A tela é uma aba: já pode estar montada quando a Home navega com outro
  // `cat`. Ajuste em render (e não em effect) para não renderizar um frame
  // com os filtros antigos.
  const [lastCat, setLastCat] = useState(cat);
  if (cat !== lastCat) {
    setLastCat(cat);
    setFilters(cat ? { type: cat } : {});
  }

  const isDish = mode === 'dish';
  const term = isDish ? dishQuery : query;
  const setTerm = isDish ? setDishQuery : setQuery;

  const activeCount = activeFilterCount(filters);
  const results = searchWines({ query, filters });
  const dishResults = searchByDish(dishQuery);
  const focusedResults = isDish ? dishResults : results;

  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  const setFilter = (key: WineFilterKey, value?: string) =>
    setFilters(current => {
      const next = { ...current };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });

  /** Uma lista só para os dois modos: o texto recente serve aos dois campos. */
  const rememberTerm = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRecents(current =>
      [
        trimmed,
        ...current.filter(r => r.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, RECENT_LIMIT),
    );
  }, []);

  const closeSearch = useCallback(() => {
    rememberTerm(term);
    setIsFocused(false);
  }, [rememberTerm, setIsFocused, term]);

  const openResult = useCallback(
    (id: string) => {
      rememberTerm(term);
      setIsFocused(false);
      openWine(id);
    },
    // `openWine` é recriado a cada render (usa o router direto); só o id importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rememberTerm, setIsFocused, term],
  );

  const openFilterDef = FILTER_DEFS.find(f => f.key === openFilter);

  return (
    <>
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
              {/*
                O campo em si é a `SearchBar` lá embaixo — flutuante, para poder
                subir sobre o blur ao focar. Aqui fica só o lugar dele.
              */}
              <Box marginBottom="s18">
                <ScrollableSearch.Anchor onMeasure={setAnchorY} />
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
                <Text
                  variant="label"
                  fontSize={9.5}
                  color="inkA50"
                  style={{ letterSpacing: 1.4 }}>
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
                    <Text
                      fontSize={13}
                      color="accentDark"
                      style={{ lineHeight: 14 }}>
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
              <Text
                variant="quote"
                fontSize={17}
                color="wineA70"
                marginBottom="s14">
                Diga o que vai preparar — encontramos a taça certa.
              </Text>

              {/* lugar do campo de prato (a barra flutuante o desenha) */}
              <Box marginBottom="s14">
                <ScrollableSearch.Anchor onMeasure={setAnchorY} />
              </Box>

              {/* exemplos */}
              <Box
                flexDirection="row"
                flexWrap="wrap"
                marginBottom="s22"
                style={{ gap: 8 }}>
                {DISH_EXAMPLES.map(d => (
                  <SuggestionChip
                    key={d}
                    label={d}
                    onPress={() => setDishQuery(d)}
                  />
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
                      <WineRow
                        key={w.id}
                        data={toWineRowData(w)}
                        onPress={() => openWine(w.id)}
                      />
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

      {/* Blur sobre a tela + toque que fecha a busca. */}
      <ScrollableSearch.Overlay onPress={closeSearch}>
        <ScrollableSearch.FocusedScreen>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            // O teclado está aberto sobre esta lista: no iOS o inset entra sozinho.
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{
              paddingHorizontal: 22,
              paddingBottom: 140,
            }}>
            {term.trim() ? (
              <>
                <Text variant="eyebrow" marginBottom="s14">
                  {focusedResults.length === 0
                    ? 'Nada encontrado'
                    : `${focusedResults.length} ${
                        focusedResults.length === 1 ? 'rótulo' : 'rótulos'
                      }`}
                </Text>
                <Box style={{ gap: 14 }}>
                  {focusedResults.slice(0, FOCUSED_RESULT_LIMIT).map(w => (
                    <WineRow
                      key={w.id}
                      data={toWineRowData(w)}
                      onPress={() => openResult(w.id)}
                    />
                  ))}
                </Box>
                {focusedResults.length > FOCUSED_RESULT_LIMIT && (
                  <TouchableOpacityBox
                    accessibilityRole="button"
                    activeOpacity={0.7}
                    onPress={closeSearch}
                    alignSelf="center"
                    marginTop="s18"
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
                      Ver todos
                    </Text>
                  </TouchableOpacityBox>
                )}
              </>
            ) : (
              <>
                {recents.length > 0 && (
                  <>
                    <Text variant="eyebrow" marginBottom="s14">
                      Buscas recentes
                    </Text>
                    <Box marginBottom="s22" style={{ gap: 8 }}>
                      {recents.map(r => (
                        <TouchableOpacityBox
                          key={r}
                          accessibilityRole="button"
                          activeOpacity={0.7}
                          onPress={() => setTerm(r)}
                          flexDirection="row"
                          alignItems="center"
                          backgroundColor="surface"
                          borderWidth={1}
                          borderColor="inkBorder14"
                          borderRadius="r12"
                          paddingVertical="s12"
                          paddingHorizontal="s14"
                          style={{ gap: 10 }}>
                          <Icon
                            name="search"
                            size={14}
                            color={palette.mutedIcon}
                          />
                          <Text
                            variant="body"
                            fontSize={13}
                            color="textPrimary">
                            {r}
                          </Text>
                        </TouchableOpacityBox>
                      ))}
                    </Box>
                  </>
                )}

                <Text variant="eyebrow" marginBottom="s14">
                  {isDish ? 'Comece por um prato' : 'Uvas em destaque'}
                </Text>
                <Box flexDirection="row" flexWrap="wrap" style={{ gap: 8 }}>
                  {(isDish
                    ? DISH_EXAMPLES
                    : filterOptions('grape')
                        .slice(0, GRAPE_SUGGESTIONS)
                        .map(o => o.label)
                  ).map(label => (
                    <SuggestionChip
                      key={label}
                      label={label}
                      onPress={() => setTerm(label)}
                    />
                  ))}
                </Box>
              </>
            )}
          </ScrollView>
        </ScrollableSearch.FocusedScreen>
      </ScrollableSearch.Overlay>

      {/*
        O campo de busca: flutua acima do overlay, acompanha o scroll em repouso
        e sobe para o topo quando o gesto (ou um toque) abre a busca. Um só para
        os dois modos — o `Anchor` de cada um diz onde ele deve descansar.
      */}
      <ScrollableSearch.SearchBar
        anchorY={anchorY}
        onPullToFocus={() => setIsFocused(true)}>
        {isDish ? (
          <Text style={{ fontSize: 15 }}>🍽</Text>
        ) : (
          <Icon name="search" size={16} color={palette.mutedIcon} />
        )}
        <TextInput
          ref={inputRef}
          value={term}
          onChangeText={setTerm}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={closeSearch}
          returnKeyType="search"
          placeholder={isDish ? 'ex: salmão grelhado' : 'Nome, uva ou região…'}
          placeholderTextColor={palette.mutedIcon}
          accessibilityLabel={
            isDish ? 'Buscar por prato' : 'Buscar vinho por nome, uva ou região'
          }
          style={{
            flex: 1,
            fontFamily: fonts.sansRegular,
            fontSize: 14,
            color: palette.ink,
          }}
        />
        {term.length > 0 && (
          <TouchableOpacityBox
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            activeOpacity={0.7}
            onPress={() => setTerm('')}
            hitSlop={10}>
            <Text fontSize={17} color="inkA50" style={{ lineHeight: 18 }}>
              ×
            </Text>
          </TouchableOpacityBox>
        )}
      </ScrollableSearch.SearchBar>
    </>
  );
}

/** Atalho de texto (prato, uva) — mesmo desenho nos dois lugares onde aparece. */
function SuggestionChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacityBox
      accessibilityRole="button"
      activeOpacity={0.8}
      onPress={onPress}
      borderWidth={1}
      borderColor="goldA50"
      borderRadius="r8"
      paddingVertical="s8"
      paddingHorizontal="s14">
      <Text variant="body" fontSize={11} color="accentDark">
        {label}
      </Text>
    </TouchableOpacityBox>
  );
}
