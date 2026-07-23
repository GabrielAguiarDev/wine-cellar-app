import { type ReactNode } from 'react';

import { useRouter, type Href } from 'expo-router';

import { palette } from '@theme/index';

import { Box } from './Box';
import { Button } from './Button';
import { Screen } from './Screen';
import { ScreenHeader } from './ScreenHeader';
import { Text } from './Text';

type DevLink = { label: string; href: Href };

type DevStubProps = {
  title: string;
  subtitle?: string;
  dark?: boolean;
  onBack?: () => void;
  links?: DevLink[];
  children?: ReactNode;
};

const DARK_GRADIENT = [palette.wineLight, palette.wine, palette.wineDeep];

/**
 * TEMPORÁRIO (Fase 3): esqueleto navegável de tela.
 * Cada tela real substitui isto nas Fases 4+.
 */
export function DevStub({
  title,
  subtitle,
  dark = false,
  onBack,
  links = [],
  children,
}: DevStubProps) {
  const router = useRouter();

  return (
    <Screen scroll gradient={dark ? DARK_GRADIENT : undefined}>
      <Box padding="s22" style={{ gap: 20 }} paddingBottom="s108">
        {onBack && <ScreenHeader onBack={onBack} variant={dark ? 'dark' : 'light'} />}
        <Box>
          <Text variant="eyebrow">IL DiVino</Text>
          <Text variant="h2" color={dark ? 'textOnDark' : 'primary'} marginTop="s4">
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="body"
              color={dark ? 'cremeA60' : 'inkA60'}
              marginTop="s6">
              {subtitle}
            </Text>
          )}
        </Box>
        {children}
        {links.length > 0 && (
          <Box style={{ gap: 12 }}>
            {links.map(link => (
              <Button
                key={String(link.href)}
                label={link.label}
                variant={dark ? 'outlineGold' : 'outline'}
                fullWidth
                onPress={() => router.navigate(link.href)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Screen>
  );
}
