// "Dark luxury showroom" design language: charcoal + off-white + the Charan
// Tiles brand gold as the single accent. The light palette is the same language on a
// cool neutral ground, so both modes read as one brand. Both palettes share
// every key; components only ever read semantic tokens, never raw hex.

export type Palette = {
  /** Screen background. */
  bg: string;
  /** Cards, sheets, tab bar. */
  surface: string;
  /** Inputs, chips, secondary buttons, image placeholders. */
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  /** Placeholders and disabled text (still WCAG AA on surfaceAlt). */
  textFaint: string;
  /** Brand gold fill: primary buttons, selected chips, badges. */
  accent: string;
  /** Text/icons sitting on an `accent` fill. */
  onAccent: string;
  /** Gold used as text or icon color on the page background. */
  accentInk: string;
  /** Subtle gold tint behind accent content. */
  accentSoft: string;
  success: string;
  successSoft: string;
  error: string;
  errorSoft: string;
  warning: string;
  /** Dark overlay for text laid over photos. */
  scrim: string;
  /** Always-light text for use over photos/scrims in both modes. */
  onImage: string;
  shadow: string;
};

export const darkColors: Palette = {
  bg: '#0D0E10',
  surface: '#16181B',
  surfaceAlt: '#1F2226',
  border: '#2A2D32',
  borderStrong: '#3A3E44',
  text: '#F3F1EC',
  textMuted: '#A3A7AE',
  textFaint: '#858A93',
  accent: '#C9A227',
  onAccent: '#14110A',
  accentInk: '#D8B64C',
  accentSoft: 'rgba(201, 162, 39, 0.14)',
  success: '#5BBF8A',
  successSoft: 'rgba(91, 191, 138, 0.14)',
  error: '#F0625D',
  errorSoft: 'rgba(240, 98, 93, 0.14)',
  warning: '#E3A445',
  scrim: 'rgba(8, 9, 11, 0.55)',
  onImage: '#F7F5F0',
  shadow: '#000000',
};

export const lightColors: Palette = {
  bg: '#F4F5F6',
  surface: '#FCFCFD',
  surfaceAlt: '#ECEEF0',
  border: '#E1E3E7',
  borderStrong: '#C9CDD3',
  text: '#15171A',
  textMuted: '#5F646C',
  textFaint: '#6F757D',
  accent: '#C9A227',
  onAccent: '#14110A',
  accentInk: '#8A6A0F',
  accentSoft: 'rgba(201, 162, 39, 0.16)',
  success: '#2E7D4F',
  successSoft: 'rgba(46, 125, 79, 0.12)',
  error: '#C62828',
  errorSoft: 'rgba(198, 40, 40, 0.1)',
  warning: '#B26A00',
  scrim: 'rgba(8, 9, 11, 0.45)',
  onImage: '#F7F5F0',
  shadow: '#1B1F24',
};

/** Fixed brand colors for build-time assets (app icon, native splash). */
export const brand = {
  blue: '#1B4F9C',
  navy: '#0F2A5C',
  gold: '#C9A227',
  charcoal: '#0D0E10',
} as const;
