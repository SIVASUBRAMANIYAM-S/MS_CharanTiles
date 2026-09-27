import { StyleSheet, useColorScheme } from 'react-native';

import { darkColors, lightColors, type Palette } from '@/lib/theme/colors';

export { brand, type Palette } from '@/lib/theme/colors';
export { fontFamily, typography } from '@/lib/theme/typography';

/**
 * Shape rule (one system, applied everywhere):
 * sm  - badges, thumbnails        md - inputs, buttons
 * lg  - cards, product images     xl - hero panels, bottom sheets
 * pill - chips, icon buttons, the cart badge
 */
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export type Theme = { dark: boolean; colors: Palette };

/** Follows the phone's light/dark setting (app.config.ts: userInterfaceStyle 'automatic'). */
export function useTheme(): Theme {
  const dark = useColorScheme() === 'dark';
  return { dark, colors: dark ? darkColors : lightColors };
}

/**
 * Theme-aware replacement for a module-level StyleSheet.create: the factory runs
 * at most once per color scheme and the result is cached, so style references
 * stay stable across renders.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: Palette, dark: boolean) => T,
): () => T {
  const cache: { light?: T; dark?: T } = {};
  return function useStyles() {
    const { dark, colors } = useTheme();
    const key = dark ? 'dark' : 'light';
    cache[key] ??= StyleSheet.create(factory(colors, dark));
    return cache[key];
  };
}
