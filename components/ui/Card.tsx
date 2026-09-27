import type { ReactNode } from 'react';
import { Platform, Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { makeStyles, radius } from '@/lib/theme';

type CardProps = {
  children: ReactNode;
  /** 'surface' = raised panel, 'outline' = flat with a hairline border, 'accent' = gold-tinted highlight. */
  variant?: 'surface' | 'outline' | 'accent';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({
  children,
  variant = 'surface',
  style,
  onPress,
  accessibilityLabel,
}: CardProps) {
  const styles = useStyles();
  const cardStyle = [styles.base, styles[variant], style];

  if (!onPress) {
    return <View style={cardStyle}>{children}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const useStyles = makeStyles((c, dark) => ({
  base: { borderRadius: radius.lg, padding: 16 },
  surface: {
    backgroundColor: c.surface,
    borderWidth: dark ? 1 : 0,
    borderColor: c.border,
    ...Platform.select({
      ios: {
        shadowColor: c.shadow,
        shadowOpacity: dark ? 0 : 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: dark ? 0 : 2 },
      web: { boxShadow: dark ? 'none' : '0px 6px 18px rgba(27, 31, 36, 0.06)' },
    }),
  },
  outline: { borderWidth: 1, borderColor: c.border },
  accent: { backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentSoft },
  pressed: { opacity: 0.85 },
}));
