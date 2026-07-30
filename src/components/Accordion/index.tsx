import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react';

import { type LayoutChangeEvent } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@hooks/useAppTheme';
import { fonts } from '@theme/index';

import { Box, PressableBox } from '../Box';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { ACCORDION_APPEARANCE } from './presets';
import {
  type AccordionContentProps,
  type AccordionContextValue,
  type AccordionItemContextValue,
  type AccordionItemProps,
  type AccordionProps,
  type AccordionTriggerProps,
} from './types';

/** 200ms, como no original: abrir tem de parecer instantâneo, não coreografado. */
const DURATION = 200;

const AnimatedBox = Animated.createAnimatedComponent(Box);

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null,
);

const useAccordion = () => {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('Accordion.* precisa estar dentro de <Accordion>');
  }
  return ctx;
};

const useAccordionItem = () => {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(
      'Accordion.Trigger e Accordion.Content precisam estar dentro de <Accordion.Item>',
    );
  }
  return ctx;
};

function ChevronIndicator({
  isOpen,
  color,
}: {
  isOpen: boolean;
  color: string;
}) {
  const open = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    open.set(withTiming(isOpen ? 1 : 0, { duration: DURATION }));
  }, [isOpen, open]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${open.get() * 180}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Icon name="chevronDown" size={13} color={color} />
    </Animated.View>
  );
}

/**
 * "+" que vira "−": só a barra vertical gira um quarto de volta e vai deitar
 * sobre a horizontal. Sem fade — o traço não desaparece, ele só muda de eixo, e
 * é isso que faz o gesto parecer reversível.
 */
function PlusIndicator({ isOpen, color }: { isOpen: boolean; color: string }) {
  const open = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    open.set(withTiming(isOpen ? 1 : 0, { duration: DURATION }));
  }, [isOpen, open]);

  const verticalStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${open.get() * 90}deg` }],
  }));

  return (
    <Box width={16} height={16} alignItems="center" justifyContent="center">
      <Box
        position="absolute"
        width={14}
        height={1.5}
        borderRadius="r5"
        style={{ backgroundColor: color }}
      />
      <AnimatedBox
        position="absolute"
        width={14}
        height={1.5}
        borderRadius="r5"
        style={[{ backgroundColor: color }, verticalStyle]}
      />
    </Box>
  );
}

/**
 * Acordeão — porte do [accordion do reacticx](https://www.reacticx.com/docs/components/accordion),
 * compound como o original (`Accordion` / `.Item` / `.Trigger` / `.Content`).
 *
 * ── O que mudou no porte ────────────────────────────────────────────────────
 *
 * 1. **Cor em tokens** (`appearance`), não hex cru num objeto `theme` — ver
 *    `presets.ts`. É o que deixa o mesmo componente servir creme e bordô.
 * 2. **Conteúdo renderizado UMA vez.** O original renderiza os filhos em dobro:
 *    uma cópia invisível fora de tela só para medir a altura, e a de verdade
 *    depois. Aqui o conteúdo mora ABSOLUTO dentro da caixa de altura animada —
 *    ele já tem altura natural e se mede sozinho, mesmo fechado, então uma
 *    árvore só resolve as duas coisas (e remedir passa a funcionar quando o
 *    texto muda de tamanho, o que no original ficava travado no 1º layout).
 * 3. **Sem `BlurView` sobre o conteúdo.** No original um blur escuro cobre o
 *    texto enquanto o item está fechado; sobre creme isso vira um borrão cinza
 *    no meio da tela clara. Altura + opacidade contam a mesma história.
 * 4. **Sem háptico.** `expo-haptics` não está no projeto e é módulo nativo
 *    (exigiria rebuild do dev client). O toque já responde pelo `PressableBox`.
 * 5. **`plus` no lugar do `cross`** — ver `AccordionIndicator` em `types.ts`.
 *
 * Com `spacing = 0` (default) o conjunto é UMA caixa com itens divididos por
 * linha; com `spacing > 0` cada item vira seu próprio card. O original mantém
 * as divisórias nos dois casos, e aí a linha de baixo de um card e a borda do
 * card seguinte desenham duas bordas colados.
 */
export function Accordion({
  children,
  type = 'single',
  appearance = ACCORDION_APPEARANCE.light,
  spacing = 0,
  defaultValue,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(() =>
    defaultValue ? new Set([defaultValue]) : new Set(),
  );

  const toggle = useCallback(
    (value: string) => {
      setOpenItems(prev => {
        const next = new Set(prev);
        if (next.has(value)) {
          next.delete(value);
          return next;
        }
        if (type === 'single') {
          next.clear();
        }
        next.add(value);
        return next;
      });
    },
    [type],
  );

  const ctx = useMemo<AccordionContextValue>(
    () => ({ openItems, toggle, appearance, spacing }),
    [openItems, toggle, appearance, spacing],
  );

  const items = Children.toArray(children);
  const grouped = spacing === 0;

  return (
    <AccordionContext.Provider value={ctx}>
      <Box
        backgroundColor={grouped ? appearance.backgroundColor : 'transparent'}
        borderWidth={grouped ? 1 : 0}
        borderColor={appearance.borderColor}
        borderRadius={grouped ? 'r14' : 'r0'}
        overflow="hidden">
        {items.map((child, index) =>
          isValidElement(child)
            ? cloneElement(child as ReactElement<AccordionItemProps>, {
                isLast: index === items.length - 1,
              })
            : child,
        )}
      </Box>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  children,
  value,
  indicator = 'chevron',
  pop = false,
  popScale = 1.02,
  isLast = false,
}: AccordionItemProps) {
  const { openItems, appearance, spacing } = useAccordion();
  const isOpen = openItems.has(value);
  const grouped = spacing === 0;
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!pop) {
      return;
    }
    scale.set(withTiming(isOpen ? popScale : 1, { duration: DURATION }));
  }, [isOpen, pop, popScale, scale]);

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const ctx = useMemo<AccordionItemContextValue>(
    () => ({ value, isOpen, indicator }),
    [value, isOpen, indicator],
  );

  const chrome = grouped
    ? {
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: appearance.borderColor,
      }
    : {
        backgroundColor: appearance.backgroundColor,
        borderWidth: 1,
        borderColor: appearance.borderColor,
        borderRadius: 'r14' as const,
      };

  return (
    <AccordionItemContext.Provider value={ctx}>
      <AnimatedBox
        overflow="hidden"
        {...chrome}
        style={[
          { marginBottom: grouped || isLast ? 0 : spacing },
          pop && popStyle,
        ]}>
        {children}
      </AnimatedBox>
    </AccordionItemContext.Provider>
  );
}

/**
 * String como filho ganha a tipografia de item de lista automaticamente — o
 * caso comum (`<Accordion.Trigger>Pergunta?</Accordion.Trigger>`) não deve
 * exigir um `<Text>` a cada chamada. Qualquer outro nó passa intacto.
 */
function AccordionTrigger({
  children,
  accessibilityLabel,
}: AccordionTriggerProps) {
  const { toggle, appearance } = useAccordion();
  const { value, isOpen, indicator } = useAccordionItem();
  const { colors } = useAppTheme();

  const iconColor = colors[appearance.iconColor];

  return (
    <PressableBox
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
      accessibilityLabel={
        accessibilityLabel ??
        (typeof children === 'string' ? children : undefined)
      }
      onPress={() => toggle(value)}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="s16"
      paddingHorizontal="s16"
      style={{ gap: 14 }}>
      {typeof children === 'string' ? (
        <Text
          variant="body"
          fontSize={13.5}
          flex={1}
          style={{ fontFamily: fonts.sansMedium }}>
          {children}
        </Text>
      ) : (
        <Box flex={1}>{children}</Box>
      )}
      {indicator === 'chevron' ? (
        <ChevronIndicator isOpen={isOpen} color={iconColor} />
      ) : (
        <PlusIndicator isOpen={isOpen} color={iconColor} />
      )}
    </PressableBox>
  );
}

function AccordionContent({ children }: AccordionContentProps) {
  const { isOpen } = useAccordionItem();
  const progress = useSharedValue(isOpen ? 1 : 0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!contentHeight) {
      return;
    }
    progress.set(withTiming(isOpen ? 1 : 0, { duration: DURATION }));
  }, [isOpen, contentHeight, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: contentHeight * progress.get(),
    opacity: progress.get(),
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== contentHeight) {
      setContentHeight(h);
    }
  };

  return (
    <Animated.View style={[{ overflow: 'hidden' }, animatedStyle]}>
      <Box
        onLayout={onLayout}
        position="absolute"
        top={0}
        left={0}
        right={0}
        paddingHorizontal="s16"
        paddingBottom="s16"
        pointerEvents={isOpen ? 'auto' : 'none'}
        accessibilityElementsHidden={!isOpen}
        importantForAccessibility={isOpen ? 'auto' : 'no-hide-descendants'}>
        {children}
      </Box>
    </Animated.View>
  );
}

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
