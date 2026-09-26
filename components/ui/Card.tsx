import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '@/lib/theme/colors';

type CardProps = {
  children: ReactNode;
  variant?: 'surface' | 'glass';
  style?: ViewStyle;
  onPress?: () => void;
};

export function Card({ children, variant = 'surface', style, onPress }: CardProps) {
  const body =
    variant === 'glass' ? (
      <BlurView intensity={40} tint="light" style={[styles.base, styles.glass, style]}>
        {children}
      </BlurView>
    ) : (
      <View style={[styles.base, styles.surface, style]}>{children}</View>
    );

  if (!onPress) {
    return body;
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 16, padding: 16 },
  surface: {
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' },
    }),
  },
  glass: {
    overflow: 'hidden',
    backgroundColor: colors.glassOverlay,
  },
});
