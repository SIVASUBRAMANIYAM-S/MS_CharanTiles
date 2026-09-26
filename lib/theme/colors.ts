export const colors = {
  // Brand palette
  primary: '#1B4F9C',
  navy: '#0F2A5C',
  sky: '#4FA8E8',
  stone: '#F6F5F1',
  surface: '#E8E6DF',
  ink: '#1A1D21',
  gold: '#C9A227',

  // Neutrals & semantic
  white: '#FFFFFF',
  muted: '#8A8D93',
  border: '#D4D1C8',
  error: '#C62828',
  warning: '#E08A1E',
  success: '#2E7D32',
  glassOverlay: 'rgba(255, 255, 255, 0.35)',
  shadow: '#000000',
} as const;

export type ColorName = keyof typeof colors;
