import type { TextStyle } from 'react-native';

// Must match the keys passed to useFonts() in app/_layout.tsx — on native, each
// weight is a separate family, so fontWeight is never set alongside these.
export const fontFamily = {
  headingSemiBold: 'PlusJakartaSans_600SemiBold',
  headingBold: 'PlusJakartaSans_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

type TypeStyle = Required<Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight'>>;

export const typography = {
  h1: { fontFamily: fontFamily.headingBold, fontSize: 32, lineHeight: 40 },
  h2: { fontFamily: fontFamily.headingSemiBold, fontSize: 24, lineHeight: 32 },
  h3: { fontFamily: fontFamily.headingSemiBold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18 },
} satisfies Record<string, TypeStyle>;

export type TypographyVariant = keyof typeof typography;
