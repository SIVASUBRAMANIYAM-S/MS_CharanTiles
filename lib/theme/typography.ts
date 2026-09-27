import type { TextStyle } from 'react-native';

// Plus Jakarta Sans throughout (Inter dropped in the redesign). Each weight is a
// separate loaded family, so fontWeight is never set alongside these. Keys must
// match the useFonts() call in app/_layout.tsx.
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

type TypeStyle = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'> & {
  fontVariant?: TextStyle['fontVariant'];
};

// Colors are applied by the caller from the theme; these carry only type metrics.
export const typography = {
  display: { fontFamily: fontFamily.extraBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  h1: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontFamily: fontFamily.bold, fontSize: 21, lineHeight: 27, letterSpacing: -0.3 },
  h3: { fontFamily: fontFamily.semiBold, fontSize: 17, lineHeight: 23, letterSpacing: -0.1 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamily.semiBold, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  caption: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  price: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TypeStyle>;

export type TypographyVariant = keyof typeof typography;
