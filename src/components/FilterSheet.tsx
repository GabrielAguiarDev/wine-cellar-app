import { useCallback, useEffect, useRef } from 'react';

import { useWindowDimensions } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@theme/index';

import { Box, TouchableOpacityBox } from './Box';
import { Icon } from './Icon';
import { Text } from './Text';

export type FilterSheetOption = {
  value: string;
  label: string;
};

type FilterSheetProps = {
  /** Nome do filtro (ex.: "Uva") — vira o título da folha. */
  title: string;
  options: FilterSheetOption[];
  /** Valor atualmente escolhido, se houver. */
  selected?: string;
  onSelect: (value: string) => void;
  /** Limpa este filtro. */
  onClear: () => void;
  /** Chamado depois que a folha termina de sair (inclusive por arraste). */
  onClose: () => void;
};

/** Acima disso a lista rola dentro da folha (e ganha o detent expandido). */
const SCROLL_THRESHOLD = 8;

/**
 * Folha inferior com as opções de um filtro (seleção única), arrastável.
 *
 * Monte condicionalmente: ela se apresenta sozinha e chama `onClose` só quando
 * a animação de saída termina — arrastar para baixo fecha. Escolher/limpar
 * também fecha, mas pela própria folha, para não cortar a saída ao desmontar.
 *
 * Altura: o detent inicial é o tamanho REAL do conteúdo (dimensionamento
 * dinâmico do gorhom), limitado a 55% da tela. Listas longas ganham um segundo
 * detent em 85%, para arrastar para cima e ver mais opções de uma vez; listas
 * curtas não ganham — não haveria conteúdo para preencher o espaço.
 */
export function FilterSheet({
  title,
  options,
  selected,
  onSelect,
  onClear,
  onClose,
}: FilterSheetProps) {
  const sheet = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  useEffect(() => {
    sheet.current?.present();
  }, []);

  const scrollable = options.length > SCROLL_THRESHOLD;
  const paddingBottom = insets.bottom + 12;

  const select = (value: string) => {
    onSelect(value);
    sheet.current?.dismiss();
  };

  const clear = useCallback(() => {
    onClear();
    sheet.current?.dismiss();
  }, [onClear]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior="close"
        style={[props.style, { backgroundColor: palette.ink }]}
      />
    ),
    [],
  );

  /**
   * Cabeçalho no lugar da alça padrão: assim ele fica FIXO (o gorhom mede a
   * alça à parte do conteúdo) e o "Limpar" não some ao rolar a lista.
   */
  const renderHandle = useCallback(
    () => (
      <Box paddingTop="s12">
        <Box
          alignSelf="center"
          width={38}
          height={4}
          borderRadius="rFull"
          backgroundColor="inkBorder20"
        />
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="s22"
          paddingTop="s14"
          paddingBottom="s12">
          <Text variant="sectionTitle" fontSize={22}>
            {title}
          </Text>
          {selected ? (
            <TouchableOpacityBox
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={clear}
              paddingVertical="s4">
              <Text
                variant="label"
                fontSize={9.5}
                color="accentDark"
                style={{ letterSpacing: 1.5 }}>
                Limpar
              </Text>
            </TouchableOpacityBox>
          ) : null}
        </Box>
      </Box>
    ),
    [title, selected, clear],
  );

  const rows = options.map(option => {
    const active = option.value === selected;
    return (
      <TouchableOpacityBox
        key={option.value}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        activeOpacity={0.7}
        onPress={() => select(option.value)}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="s22"
        paddingVertical="s14"
        borderTopWidth={1}
        borderTopColor="inkBorder09">
        <Text variant="body" fontSize={14} color={active ? 'primary' : 'textPrimary'}>
          {option.label}
        </Text>
        {active && <Icon name="check" size={13} color={palette.wine} />}
      </TouchableOpacityBox>
    );
  });

  return (
    <BottomSheetModal
      ref={sheet}
      snapPoints={scrollable ? ['85%'] : undefined}
      enableDynamicSizing
      maxDynamicContentSize={height * 0.55}
      enablePanDownToClose
      onDismiss={onClose}
      handleComponent={renderHandle}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: palette.cremeSurface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      style={{
        shadowColor: palette.wine,
        shadowOpacity: 0.2,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: -8 },
        elevation: 16,
      }}>
      {scrollable ? (
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom }}>
          {rows}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView style={{ paddingBottom }}>{rows}</BottomSheetView>
      )}
    </BottomSheetModal>
  );
}
