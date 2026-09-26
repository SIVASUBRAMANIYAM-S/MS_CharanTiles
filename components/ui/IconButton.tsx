import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, radius } from '@/lib/theme';

type IconButtonProps = {
  /** Required: icon-only buttons have no visible text for screen readers. */
  accessibilityLabel: string;
  onPress: () => void;
  children: ReactNode;
  /** 'surface' for page chrome, 'overlay' for sitting on top of photos. */
  tone?: 'surface' | 'overlay';
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  accessibilityLabel,
  onPress,
  children,
  tone = 'surface',
  size = 40,
  style,
}: IconButtonProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        tone === 'overlay' ? styles.overlay : styles.surface,
        { width: size, height: size },
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const useStyles = makeStyles((c, dark) => ({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  surface: { backgroundColor: c.surfaceAlt },
  overlay: { backgroundColor: dark ? 'rgba(13, 14, 16, 0.72)' : 'rgba(252, 252, 253, 0.9)' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.94 }] },
}));
