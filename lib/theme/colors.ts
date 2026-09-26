export const colors = {
  primary: '#1B4F9C',
  navy: '#0F2A5C',
  sky: '#4FA8E8',
  stone: '#F6F5F1',
  surface: '#E8E6DF',
  ink: '#1A1D21',
  gold: '#C9A227',
} as const;

export type ColorName = keyof typeof colors;
